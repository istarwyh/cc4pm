---
number: "24.11"
title: "能力层选型——CLI、MCP 与 Skill 不是二选一"
short_title: "CLI/MCP/Skill 选型"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.11: 能力层选型——CLI、MCP 与 Skill 不是二选一

> **前置课程**：Lesson 2（上下文窗口）、Lesson 6（命令与技能）、Lesson 22.2（视觉校验）、Lesson 24.1（MCP 生态）
>
> **预计用时**：20 分钟
>
> **适合人群**：已经知道 Skill、CLI、MCP 的基本概念，但在做工具选型时容易问“到底该用哪一个”的产品主理人和工程团队
>
> **实操须知**：本课命令请在一个新的 Claude Code session 中执行。详见 [practice-notice.md](../shared/practice-notice.md)。

## 先拆掉一个伪问题

“Skill 和 MCP/CLI 选哪个？”这个问题本身就是错位的。

它们不在同一层：

```text
用户意图
  ↓
Skill：知识层 / 工作流层
  - 什么时候该做什么
  - 按什么步骤做
  - 遇到边界怎么判断
  - 哪些坑不要踩
  ↓
能力层：CLI 或 MCP
  - 真实执行命令
  - 调外部服务
  - 操作浏览器
  - 读取结构化状态
```

换句话说：

- **Skill = “怎么用”的知识层**：`SKILL.md` 教模型工作流、最佳实践、何时用哪个工具。
- **CLI / MCP = “能做什么”的能力层**：提供实际操作能力。

所以你真正要比较的不是“Skill vs MCP”，而是：**能力层用 CLI 还是 MCP**。Skill 都可以盖在上面，MCP 也同样可以配 Skill。

## 学习目标

完成本课后，你将能够：

- 用“知识层 / 能力层”模型解释 Skill、CLI、MCP 的关系
- 判断日常任务更适合 CLI + Skill 还是 MCP + Skill
- 读懂 token、结构化契约、跨会话状态、可调试性之间的取舍
- 为浏览器验收、E2E、调试任务选择正确暴露方式
- 避免把“工具暴露方式”误判成“能力强弱”

## Step 1：把 Skill 放在上层

一个 Skill 可以调用 CLI，也可以指导 Claude 使用 MCP。它不是能力本身，而是能力的使用说明书。

```text
视觉验收 Skill
├── 确定验收目标：截图、Console、Network、Performance
├── 判断任务形态：稳定流程 / 探索调试
├── 稳定流程 → 走 Playwright CLI 或测试脚本
└── 探索调试 → 走 Chrome DevTools MCP 或 Playwright MCP
```

同一个 Skill 可以这样写：

```markdown
## Tool Strategy

- 如果目标是可重复的登录流程，请优先生成 Playwright 测试并用 CLI 跑。
- 如果目标是排查一次线上页面的 Console / Network / trace，请优先使用浏览器 MCP。
- 如果工具之间开始反复切换，本轮只保留一个能力层入口。
```

注意这里的核心不是“Skill 代替 MCP”，而是 Skill 帮模型做出能力层选择。

## Step 2：CLI + Skill 适合确定性任务

CLI + Skill 的优势在于：脚本化、可复现、透明、适合 CI。

| 适合场景 | 为什么 |
|---------|--------|
| 跑测试 / 构建 / lint | 命令输出稳定，适合自动化记录 |
| 生成并维护 E2E 测试 | 产物是代码，可提交、可复跑 |
| 发布前质量门禁 | CI 友好，失败原因可追踪 |
| 批处理脚本 | 输入输出明确，不需要长时间交互 |

典型提示词：

```text
请用 CLI + Skill 路线完成这次验收：
1. 先检查项目已有的测试脚本
2. 如果需要浏览器自动化，优先生成 Playwright 测试代码
3. 用命令行运行测试
4. 把关键输出、失败截图和下一步建议写成报告
5. 不要在浏览器 MCP 中做无法复现的手工探索
```

CLI + Skill 的好处是你能看见精确命令和输出。失败了也容易复制给 CI、同事或下一轮 Claude。

```bash
npm test
npx playwright test
node scripts/verify.js
```

这种路线尤其适合产品主理人的“交付确认”：你要的不是一次看起来通过，而是明天、下周、换一台机器也能通过。

## Step 3：MCP + Skill 适合探索式任务

MCP + Skill 的优势在于：结构化契约、常驻状态、丰富内省、跨 turn 连续操作。

| 适合场景 | 为什么 |
|---------|--------|
| 浏览器调试 | 能读 Console、Network、Performance trace |
| 需要登录态的网页操作 | MCP server / 浏览器会话可以持续存在 |
| 动态页面排查 | 直接观察真实 DOM 和交互 |
| 外部服务集成 | MCP 工具返回结构化结果，少让模型解析文本 |

典型提示词：

```text
请用 MCP + Skill 路线完成这次探索式调试：
1. 本轮只使用 Chrome DevTools MCP
2. 打开目标页面并截图
3. 读取 Console error/warn
4. 检查 Network 中失败请求
5. 录一段 Performance trace
6. 用证据说明最可能的瓶颈，不要只凭感觉判断
```

MCP 的强项不是“更会跑脚本”，而是像把浏览器调试台、外部 API 面板、结构化工具状态交给了 Claude。

对产品主理人来说，它更适合回答这类问题：

```text
页面到底哪里卡？
哪个请求失败？
点击后真实 DOM 有没有变化？
控制台报错来自哪个资源？
这次登录态还能不能复用？
```

## Step 4：用决策矩阵而不是站队

把 CLI + Skill 和 MCP + Skill 放在一起看，差异会更清楚：

| 维度 | CLI + Skill | MCP + Skill |
|------|-------------|-------------|
| Token 效率 | 高：快照写盘，Skill 按需加载 | 中：现代 harness 已懒加载，差距缩小 |
| 结构化契约 | 弱：模型要解析文本输出 | 强：类型化 schema、结构化返回 |
| 跨会话状态 | 依赖 session / state-save 手动管理 | MCP server 常驻，天然更有状态 |
| 可调试性 / 透明度 | 强：精确命令和输出都可见 | 中：工具调用更像黑盒 |
| 权限摩擦 | 低：Skill 里可预设可信命令策略 | 中：每个 MCP 工具可能单独过权限 |
| 复用性 | 更偏单 agent / Claude Code | 更偏跨 agent / 跨平台协议 |
| 探索式交互 | 弱：适合跑确定流程 | 强：适合网络面板、console、trace |

这里的“结构化契约”值得单独看。CLI 的默认产物通常是 stdout、日志或文件，Claude 需要从文本里解析含义；MCP 工具则天然带 schema，工具名、参数和返回值都有类型边界。

```text
如果输出要被人读：文字报告就够了。
如果输出要被工具、CI 或下一轮 Agent 继续消费：要定义契约。

契约至少包含：
- schema：字段长什么样
- acceptance：什么算通过
- validation：用什么命令验证
- failure：失败后怎么停、怎么报
```

这也是为什么稳定流程经常会从“浏览器里探索”沉淀成“脚本 + 测试 + 报告格式”：不是 MCP 不好，而是可复用产物需要更硬的契约。

这张表不是为了选出“永远正确”的一边，而是帮你看清任务形态。

```text
确定性、可重复、要沉淀成脚本
  → CLI + Skill

探索式、需要内省、需要持续操作一个浏览器或外部服务
  → MCP + Skill
```

## Step 5：理解“底层趋同，暴露方式不同”

材料中给出的判断是：到 2026 年，Playwright 这类工具的 CLI 与 MCP 暴露方式已经出现趋同——CLI 命令可以按名调用同一套 MCP tool，后端能力趋向相同。

这意味着选择更多是在选**暴露方式**，不是在选“哪个能力更高级”。

```text
同一类浏览器能力
├── CLI 暴露：脚本、日志、CI、可复跑
└── MCP 暴露：工具 schema、常驻会话、交互式内省
```

浏览器能力可以这样分工：

| 入口 | 更像什么 | 默认用途 |
|------|----------|----------|
| Playwright CLI | 自动化测试员 | 稳定脚本、回归测试、CI |
| Playwright MCP | 代理操作的浏览器 | 临时打开页面、点击、截图、辅助生成测试 |
| Chrome DevTools MCP | 调试工程师 | Console、Network、Performance、Memory |

三者都能碰到“浏览器”，但接口不同，最佳用途也不同。验收页面时先用 MCP 看清问题；流程稳定后，再反推成 Playwright CLI 测试。

实际使用时仍然以你安装的版本和项目配置为准。不要因为“底层趋同”就忽视验收：

```text
□ CLI 路线是否能在干净环境复跑？
□ MCP 路线是否能给出 Console / Network / trace 证据？
□ 关键产物是否写入文件，而不是只停留在对话里？
□ 是否明确了本轮只用哪一个能力入口，避免工具左右互搏？
```

## Step 6：产品主理人的默认策略

你可以把选型压缩成一个简单决策树：

```text
这个任务的结果需要进入仓库 / CI / 发布流程吗？
├── 是 → CLI + Skill
└── 否 → 继续问

这个任务需要看真实页面状态、网络请求或控制台吗？
├── 是 → MCP + Skill
└── 否 → 继续问

这个任务是否会重复发生？
├── 是 → 先用 MCP 探索，再沉淀为 CLI 脚本 + Skill
└── 否 → 直接用 MCP 探索，留下证据报告
```

最务实的姿势是：

```text
日常交付：CLI + Skill
探索调试：MCP + Skill
成熟流程：从 MCP 探索沉淀回 CLI 脚本
```

也就是：不必非黑即白。能力层按任务选，Skill 层都应该配。

## 实操：让 Claude 为项目做一次工具路线审计

在新的 Claude Code session 中说：

```text
请只读审计当前项目的工具路线，不要修改文件。

请输出一个表格：
1. 哪些任务现在适合 CLI + Skill？例如测试、构建、发布、脚本化验收。
2. 哪些任务适合 MCP + Skill？例如浏览器调试、文档查询、外部服务操作。
3. 哪些 MCP 只是偶尔用 1-2 个功能，是否可沉淀成 CLI 命令或脚本？
4. 哪些探索式流程已经稳定，是否应该反推出 Playwright 测试或项目脚本？
5. 每项给出理由、风险和建议产物。

不要只给结论；请引用配置文件、脚本、测试或课程 Skill 的路径作为证据。
```

预期产出：

```text
任务                     推荐路线        理由                         建议产物
E2E 登录回归              CLI + Skill     可重复，适合 CI              tests/e2e/login.spec.ts
首页性能瓶颈定位          MCP + Skill     需要 trace / Network          调试报告 + 截图
GitHub Issue 状态查询     MCP + Skill     外部服务结构化接口            issue 摘要
发布前静态构建            CLI + Skill     命令稳定、失败可追踪          npm run build 日志
```

## 常见误区

### 误区 1：把 Skill 当成能力层

Skill 不负责“真的点击按钮”或“真的跑测试”。它负责告诉 Claude：什么时候点击、为什么点击、点完怎样验收、失败后怎样收敛。

### 误区 2：为了省 token 一律不用 MCP

现代 harness 已经在懒加载和快照写盘上做了大量优化。MCP 的 token 劣势被缩小了。真正要避免的是“开了一堆不用的 MCP”，不是“任何 MCP 都不用”。

### 误区 3：用 MCP 做所有可重复工作

如果一个流程已经稳定，就应该尽快沉淀为脚本或测试。否则每次都在浏览器里重新探索，既难复现，也难交给 CI。

### 误区 4：同时打开多个浏览器能力入口

Playwright MCP、Chrome DevTools MCP、浏览器自动化 Skill 同时启用时，模型可能在工具之间来回切换。遇到这种情况，直接限制：

```text
本轮只使用 Chrome DevTools MCP，不要调用其他浏览器工具。
```

## FAQ

**Q：CLI + Skill 是不是比 MCP + Skill 更推荐？**

不是。CLI + Skill 更适合确定性流程；MCP + Skill 更适合探索式调试。推荐的是“按任务形态分流”，不是永远偏向某一边。

**Q：如果 MCP 和 CLI 底层能力相同，为什么还要保留两种入口？**

因为入口决定协作方式。CLI 入口天然适合脚本、日志、CI 和代码审查；MCP 入口天然适合结构化工具调用、常驻状态和交互式内省。

**Q：Skill 可以同时支持 CLI 和 MCP 吗？**

可以，而且这通常是最好的设计。Skill 写清楚路线选择规则：稳定流程走 CLI，探索调试走 MCP，探索成熟后沉淀回 CLI。

**Q：我怎么判断一个 MCP 是否应该被替换成 CLI？**

如果你只用它 1-2 个固定功能，而且每次输入输出都很稳定，可以考虑写成 CLI 脚本并用 Skill 包起来。如果你需要大量结构化操作、会话状态或调试面板，就保留 MCP。

## 相关概念

- **上下文窗口**（Lesson 2）— 工具描述和输出都会消耗上下文，需要主动管理
- **命令与技能系统**（Lesson 6）— Skill 是工作流与知识层，不只是命令替代品
- **视觉校验**（Lesson 22.2）— Playwright、Chrome DevTools MCP 与浏览器调试的分工
- **MCP 生态**（Lesson 24.1）— 按需启用 MCP，不要全开

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 25 - 完整项目实战
- 返回 Lesson 24.1：MCP 生态与文档工具
- 返回主菜单

---
*阶段 5 | Lesson 24.11/26 | 上一课: Lesson 24.10 - 共享传输生命周期 | 下一课: Lesson 25 - 完整项目实战*
