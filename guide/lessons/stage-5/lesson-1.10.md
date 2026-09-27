---
number: "24.10"
title: "共享传输生命周期——H2 复用、优雅排空与 SSE 恢复边界"
short_title: "共享传输生命周期"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.10: 共享传输生命周期——H2 复用、优雅排空与 SSE 恢复边界

> **前置课程**：Lesson 9.1（网络与模型配置）、Lesson 23.4（Agent Brain/Hands/Session）、Lesson 24.1（MCP 服务生态）
>
> **预计用时**：20 分钟
>
> **适合人群**：正在构建 AI 流式接口、实时输出、API 网关或长连接服务，需要判断“一条底层连接失效为何会影响多个请求”的产品主理人和工程团队
>
> **内容边界**：本课只解释材料已经确认的生命周期语义。具体连接年龄、扫描周期、函数名、日志字段和 SSE 恢复协议，需要回到你的实现中核对，不能凭课程猜测。

## 为什么一条连接会让多个请求一起失败

HTTP/2（H2）可以在一条 TCP/TLS 物理连接上复用多个逻辑 stream。对产品层来说，你看到的是多个同时进行的请求；对 transport 层来说，它们可能共享同一个底层 parent。

```text
TCP/TLS 物理连接（parent）
├── H2 stream A（child）
├── H2 stream B（child）
└── H2 stream C（child）
```

复用减少了重复建立物理连接的成本，但也改变了故障半径：如果共享 transport 在中途失效，挂在它下面的多个 child 可能同时失败。

这类问题不能只用“某个请求超时了”来理解。你还需要追问：

- 这些失败请求是否共享同一个 parent？
- 这个 parent 已经存活了多久？
- 它在到龄后是否仍然接收新 stream？
- 旧 stream 是否被允许完成？
- transport 恢复后，SSE 事件是否真的能够继续？

## 学习目标

完成本课后，你将能够：

- 区分 H2 的物理连接 parent 与逻辑 stream child
- 识别共享 transport 带来的关联故障域
- 解释为什么连接数、排队和超时不足以定义完整生命周期
- 读懂“停止新增、排空旧流、具备回收资格、后台关闭”四个不同阶段
- 区分 transport 生命周期治理与 SSE 事件级恢复
- 用产品验收问题检查 parent/child 生命周期是否可观测

## Step 1：先分清 parent 和 child

把物理连接和逻辑请求混为一谈，是排查这类故障时最常见的认知错误。

| 层级 | 本课称呼 | 生命周期关注点 |
|------|----------|----------------|
| TCP/TLS + H2 物理连接 | parent | 何时停止接收新 stream、何时具备回收条件、何时可能关闭 |
| 在 parent 上复用的逻辑 stream | child | 是否已被接纳、是否仍在运行、何时结束 |

parent 和 child 不是“一起创建、一起销毁”的绑定关系。修复后的关键语义恰恰是：parent 可以先停止接收新的 child，同时让已经存在的 child 继续运行。

```text
停止新增 ≠ 立即关闭
parent 退役 ≠ 取消已有 child
child 全部结束 ≠ parent 已经同步关闭
```

这三个“不等于”决定了系统能否在更新资源策略时，避免无故中断正在进行的用户请求。

## Step 2：理解原有控制为什么还不够

原实现已经限制了连接数量、排队和超时。这些控制仍然有价值，但它们回答的是容量与等待问题，没有回答长生命周期 parent 的退役问题。

| 已有控制 | 能回答什么 | 没有回答什么 |
|----------|------------|--------------|
| 连接数量限制 | 同时允许多少底层连接 | 某个存活过久的 parent 何时停止承接新 stream |
| 排队 | 暂时拿不到资源时怎样等待 | 排队结束后是否仍会选中到龄 parent |
| 超时 | 一个等待或请求何时不再继续 | 已有 stream 与 parent 回收之间怎样协调 |

因此，“连接池有限制”不等于“连接生命周期已经完整”。如果没有规定 parent 何时停止新增复用，一个长生命周期 parent 仍可能不断承接新的 child。

从产品视角看，风险不是只有单个请求变慢，而是多个用户可见的流式任务可能被放进同一个逐渐不可靠的故障域。

## Step 3：读懂修复后的生命周期

修复后的 parent 生命周期可以压缩成一条状态链：

```text
可承接新 stream
  → parent 到龄
  → 后续 acquire / predicate 检查命中
  → 不再承接新 stream
  → 已有 stream 继续运行
  → H2 concurrency 归零
  → parent 具备回收条件
  → 可能在后续后台扫描中关闭
```

这是教学抽象，不代表真实实现里存在这些枚举名。真正需要记住的是状态转换的顺序。

### 1. 到龄不是立即关闭

parent 到龄后，不是立刻终止连接。修复语义是在**后续 acquire/predicate 检查命中时**，让它停止承接新的 stream。

这意味着“到龄”和“停止新增”之间可能存在一个被后续检查观察到的时点。验收时不能把它写成“到龄瞬间同步关闭”。

### 2. 停止新增不影响已有 stream

一旦检查命中，到龄 parent 不再接收新的 child，但已经运行的 stream 继续完成。

```text
新 stream     → 不再挂到这个到龄 parent；后续由 acquire 流程决定
已有 stream   → 留在原 parent 上继续运行
```

这就是优雅排空：先切断新流量入口，再等待存量任务自然结束，而不是用回收 parent 的动作打断正在执行的 child。

### 3. concurrency 归零只是具备回收条件

当底层 H2 concurrency 归零，说明这个 parent 上已经没有仍在运行的 child。此时 parent 才具备回收条件。

但“具备回收条件”不等于“已经关闭”。材料明确保留了下一层语义：它**可能在后续后台扫描中关闭**。

| 时点 | parent 状态 | 能否接收新 stream | 已有 stream |
|------|-------------|--------------------|-------------|
| 尚未到龄 | 正常复用 | 可以 | 正常运行 |
| 到龄但尚未被后续检查命中 | 等待检查观察 | 取决于检查是否已发生 | 正常运行 |
| 检查命中后 | 停止新增、开始排空 | 不可以 | 继续运行 |
| concurrency = 0 | 具备回收条件 | 不可以 | 已全部结束 |
| 后续后台扫描处理后 | 可能关闭 | 不可以 | 无 |

### 教学伪代码

下面的伪代码只表达顺序，不对应任何具体库的 API：

```text
on_acquire_candidate(parent, now):
  if parent_has_reached_age_limit(parent, now):
    reject_new_stream(parent)
  else:
    apply_existing_acquire_predicates(parent)

on_child_finished(parent):
  update_h2_concurrency(parent)

background_scan(parent):
  if parent_rejects_new_streams(parent)
     and h2_concurrency(parent) == 0:
    mark_or_close_reclaimable_parent(parent)
```

不要从这段伪代码推断真实函数名、线程模型或关闭时机。它只保留材料中已经确认的三个判断：后续检查停止新增、并发归零后才具备回收资格、关闭可能发生在后续后台扫描。

## Step 4：把“共享故障”变成可验收的故障域

假设三个流式任务复用同一个 parent：

```text
parent P1
├── child A：长文本生成
├── child B：实时状态更新
└── child C：工具执行结果流
```

如果只观察 child，你可能看到三个看似独立的失败；如果同时观察 parent/child 生命周期，才有机会识别它们共享同一个 transport。

因此，本次修复的另一个重要变化是：整个 parent/child 生命周期变得可观测。材料没有给出具体日志字段或指标名，所以课程不能声称实现了某个固定面板；产品验收应该先要求系统能回答这些问题：

```text
□ 哪个 parent 正在承接这些 child？
□ parent 是否已经到龄？
□ 后续 acquire/predicate 检查是否已让它停止新增？
□ 当前底层 H2 concurrency 是否已经归零？
□ parent 只是具备回收条件，还是已经被后台扫描关闭？
□ 一次共享 transport 失效影响了哪些 child？
```

这组问题把“偶发的多个请求失败”变成可关联、可定位的生命周期事件。

## Step 5：不要把 transport 排空误认为 SSE 恢复

材料还指出，原实现没有 SSE 事件级恢复。这和 parent 优雅退役是两个不同问题：

| 问题 | 关注对象 | 本次材料确认了什么 |
|------|----------|--------------------|
| H2 parent 生命周期 | 共享 transport 与 child stream | 到龄后停止新增、已有流继续、并发归零后具备回收条件、后续可能关闭 |
| SSE 事件级恢复 | 中断前后事件是否能够连续恢复 | 原实现没有事件级恢复；材料没有说明后续已经补上 |

因此，不能从“parent 能优雅排空”推导出“SSE 中断后一定能从断点继续”。同样，transport 重新建立，也不自动证明已经丢失的事件能够恢复。

产品需求里应把两项验收拆开：

```text
验收 A：连接退役
到龄 parent 不接收新 stream，但不打断已有 stream。

验收 B：事件恢复
共享 transport 中断后，SSE 是否具备事件级恢复能力？
```

本课只能确认验收 B 曾经存在缺口，不能虚构具体恢复机制或宣称修复已经完成。

## 实操：让 Claude 做一次只读生命周期审计

如果你的项目使用 H2 复用、SSE 或其他长生命周期共享 transport，请在**新的 Claude Code session** 中先做只读审计，不要直接改代码：

```text
请只读审计当前项目的共享 transport 生命周期，不要修改文件。

请用代码证据回答：
1. 一条 H2 parent 是否复用多个逻辑 stream？
2. parent 到龄后，在哪个 acquire/predicate 检查中停止承接新 stream？
3. 已有 stream 是否继续运行？
4. 哪个状态表示底层 H2 concurrency 已归零？
5. concurrency 归零后是立即关闭，还是仅具备回收条件？
6. 哪个后台扫描负责后续回收？
7. parent/child 生命周期如何关联观察？
8. SSE 是否真的实现了事件级恢复？如果没有证据，请明确写“未确认”。

输出文件路径和行号；不要根据变量名猜测行为。
```

审计结果应先形成“事实—缺口—验收项”三列表，再决定是否需要修改实现。

## 产品与工程验收清单

```text
□ 容量控制与生命周期控制被分别描述
□ 到龄不会被写成“立即关闭”
□ 后续 acquire/predicate 检查命中后，parent 不再承接新 stream
□ 已有 stream 不因 parent 到龄而被提前取消
□ H2 concurrency 归零后，parent 才具备回收条件
□ “具备回收条件”和“已经关闭”没有混为一谈
□ 后台扫描被描述为后续可能发生的关闭时点
□ 多个 child 的失败可以关联到共享 parent
□ SSE 事件级恢复被单独验证，没有从 transport 恢复中推断
```

## FAQ

**Q：已经限制连接数、排队和超时，为什么还要管 parent 年龄？**

因为前三者主要约束容量、等待和单次超时，没有定义一个长生命周期 parent 何时停止接收新的复用任务。没有退役入口，旧 parent 仍可能持续扩大共享故障域。

**Q：parent 到龄后为什么不立即关闭？**

因为它下面可能还有正在运行的 child。立即关闭会把资源回收动作变成用户请求中断；修复后的语义是先停止新增，再让已有 stream 继续运行。

**Q：H2 concurrency 归零是否表示 parent 已经关闭？**

不是。它只表示 parent 具备回收条件。真正关闭可能发生在后续后台扫描中。

**Q：parent 优雅排空后，SSE 就能自动续传吗？**

不能这样推断。材料只确认原实现缺少 SSE 事件级恢复，并没有提供后续恢复协议。transport 生命周期与事件连续性必须分开验收。

**Q：为什么要同时观察 parent 和 child？**

因为多个 child 可能共享同一个 transport。只看单个请求，会把一次关联故障误判成多个独立故障；同时观察生命周期，才能看见共享 parent 带来的故障半径。

## 相关概念

- **网络与模型配置**（Lesson 9.1）— 超时、重试和流式看门狗属于基础稳定性控制
- **Agent Brain/Hands/Session**（Lesson 23.4）— 用组件边界理解生命周期，但不要把 Agent session 与 H2 stream 混为一层
- **MCP 服务生态**（Lesson 24.1）— HTTP 类型服务是理解共享 transport 的相邻使用场景
- **完整项目实战**（Lesson 25）— 把连接退役与事件恢复分别写进非功能验收项

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 25 - 完整项目实战
- 返回 Lesson 24.9：OINK 内容站
- 返回主菜单

---
*阶段 5 | Lesson 24.10/26 | 上一课: Lesson 24.9 - OINK 内容站 | 下一课: Lesson 24.11 - CLI/MCP/Skill 选型*
