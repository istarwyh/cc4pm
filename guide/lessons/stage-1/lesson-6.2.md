# Lesson 6.2: Skill 链式调用——Agent Loop 驱动的即时注入

## 本课目标

- 理解 Skill 链式调用的底层机制
- 掌握 Agent Loop 如何驱动 Skill 的即时注入
- 学会设计可组合的 Skill 工作流

## 核心内容

### 什么是 Skill 链式调用

在一句话里组合多个 Skill，按阶段依次执行：

```bash
/design    → 先做设计
/implement → 再写实现
/test      → 然后测试
/push      → 最后推送
```

看起来像是一条流水线，但底层并不是"预先把所有指令灌进去"。

### 为什么不一次性注入

假设 Claude 一次性加载 4 个 Skill 的全部指令：

```
┌─────────────────────────────────────┐
│  /design 的 500 行指令               │
│  /implement 的 400 行指令            │
│  /test 的 300 行指令                 │
│  /push 的 200 行指令                 │
│                                     │
│  总计: 1400 行指令同时在上下文中      │
│  问题: 指令互相干扰，Claude 分不清   │
│        当前该执行哪个阶段             │
└─────────────────────────────────────┘
```

这就像同时打开 4 本说明书摊在桌上——每本都在说"现在做这个"，你反而不知道该做什么。

### Agent Loop：即时注入的关键

Claude Code 的执行模型是一个**循环**，不是一条直线：

```
用户消息
  │
  ▼
┌→ Claude 推理（看到全部上下文）
│    │
│    ▼
│  调用工具（比如 Skill tool）
│    │
│    ▼
│  拿到工具结果
│    │
└────┘  ← 回到推理，决定下一步
```

每一轮工具调用后，Claude 都会**重新进入推理**。这意味着：

1. Claude 看到 `/design /implement /test /push`
2. 第一轮推理：识别当前处于"开始"状态 → 调用 `Skill("design")`
3. 拿到 design 的指令 → 执行设计工作
4. **重新推理**：设计完成了，下一步是什么？→ 调用 `Skill("implement")`
5. 拿到 implement 的指令 → 执行实现工作
6. **重新推理**：实现完成了 → 调用 `Skill("test")`
7. ...依此类推

**每个 Skill 都是在"需要它的时候"才被注入**，而不是在最开始。

### 类比：项目经理读文档

```
你跟项目经理说：
  "先做设计，再实现，再测试，最后推送"

他不会同时打开 4 份文档。
他会做完一步，回来想"下一步是什么"，再翻开对应的文档。

Skill 就是那份文档
Agent Loop 就是那个"做完一步回来想想"的循环
你的一句话只是给了他整个计划
他按节奏自己读
```

### Skill 的本质：声明式指令模板

Skill 之所以能被这样灵活组合，是因为它们是**无状态的**：

```
Skill ≠ 程序（有状态、有执行上下文）
Skill = 指令模板（告诉 Claude 该怎么做某一类事）
```

就像乐谱——每张乐谱独立完整，乐队指挥（Agent Loop）决定什么时候演奏哪张。乐谱之间不需要互相知道，指挥会安排顺序。

### 设计可组合的 Skill

理解了链式调用的原理后，创建 Skill 时可以有意为之：

| 设计要点 | 说明 |
|---------|------|
| **独立性** | 每个 Skill 不依赖其他 Skill 的输出格式 |
| **明确边界** | Skill 的指令明确告诉 Claude "做到什么程度算完成" |
| **可交接** | 输出对下一个 Skill 来说是可消费的（比如设计产出方案、实现产出代码、测试产出报告） |
| **渐进式** | 内容从粗到细，让 Claude 在每一步都有足够的上下文 |

#### 示例：一个 3-Skill 链

```yaml
# Skill 1: /spec
description: >
  Use when the user wants to write a technical specification.
  Output: a spec document with requirements, constraints, and acceptance criteria.

# Skill 2: /implement
description: >
  Use when the user wants to implement code based on a spec or plan.
  Reads existing specs/plans, writes code with tests.

# Skill 3: /verify
description: >
  Use when the user wants to verify implementation against spec.
  Runs tests, checks acceptance criteria, reports pass/fail.
```

用户说 `/spec /implement /verify`，Claude 会：
1. 先注入 spec → 写出技术规格
2. 回到推理 → 注入 implement → 按规格写代码
3. 回到推理 → 注入 verify → 验证代码是否满足规格

每一步都是**即时注入**，上下文里只有当前阶段的指令在活跃。

### 与 Agent Teams 的区别

| 维度 | Skill 链式调用 | Agent Teams |
|------|---------------|-------------|
| 执行者 | 一个 Claude 实例 | 多个 Claude 实例 |
| 切换机制 | Agent Loop 内的推理循环 | 消息传递（SendMessage） |
| 上下文 | 共享同一个对话上下文 | 每个成员有独立上下文 |
| 适用场景 | 线性流水线（设计→实现→测试） | 并行协作（前端+后端+测试同时进行） |

简单说：Skill 链是**一个人按顺序做多件事**，Agent Teams 是**多个人同时做不同的事**。

## 常见问题

**Q: Skill 链的顺序是固定的吗？**

A: 不固定。Claude 会根据每一轮推理的结果决定下一步。如果 `/implement` 阶段发现需求不清晰，Claude 可能会回到 `/spec` 的逻辑重新审视，而不是死板地往下走。

**Q: 链式调用会不会消耗更多 token？**

A: 不会比分别调用更多。因为每个 Skill 只在需要时加载 body（Level 2），而不是在一开始全部加载。实际上可能更省，因为 Claude 不需要在无关阶段的指令中浪费注意力。

**Q: 什么时候用 Skill 链，什么时候用 Agent Teams？**

A: 阶段之间有明确的先后依赖（设计→实现→测试）用链式调用；多个任务可以并行（前端开发 + 后端开发）用 Agent Teams。

## 动手试试

### 练习 1：观察即时注入

```bash
claude
"用 /bmad-create-prd 写一个 PRD，然后用 /bmad-create-epics-and-stories 拆解需求"
# 观察：Claude 是否在 PRD 完成后才调用第二个 Skill？
# 观察：两个 Skill 的指令是否同时出现在上下文中？
```

### 练习 2：设计你的 Skill 链

```bash
claude
"假设我要做一个完整的内容发布流程：
 /research → /write → /review → /publish
 每个阶段的 Skill 应该怎么设计 description？
 阶段之间需要传递什么信息？"
```

## 相关概念

- **Skill 深度**（Lesson 6.1）— Skill 的结构、创建流程和设计哲学
- **Agent Loop**（Lesson 1.1）— Claude Code 的 11 步工作原理
- **Agent Teams**（Lesson 7.1）— 多 Claude 协作的另一种方式

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 7 - 代理系统：你的 AI 专家团
- 返回主菜单
- 退出学习

---
*阶段 1 | Lesson 6.2/26 | 上一课: Lesson 6.1 - Skill 深度 | 下一课: Lesson 7 - 代理系统*
