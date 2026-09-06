# Lesson 24.3: Agentic 知识库——产品主理人的「外挂大脑」

## 本课目标

- 理解从「被动 RAG」到「主动知识编译」的思维转换
- 掌握如何利用 Agent 维护一个永不过时的项目 Wiki
- 区分 Knowledge Wiki 与 Steering Layer，知道搜索结果如何进入行动与验收
- 能写一份 80 行以内的应用上下文入口，为不同任务声明路由和质量闸门
- 学习如何在 Obsidian 中可视化项目知识图谱

## 核心内容

### 为什么你需要「Agentic 知识库」？

作为产品主理人，你是否遇到过：
- 需求文档（PRD）是半年前的，代码已经是 3.0 版了，文档彻底失效。
- 新人入职，问你：“这个登录模块的逻辑是怎么设计的？”你得去翻 Git 提交记录。
- 你有一个关于产品未来方向的灵感，却找不到半年前讨论时的背景资料。

**Agentic 知识库（LLM Wiki）** 就是要把 AI 变成一个「永不疲倦的文档官」，让你的项目知识保持实时在线。

> **深度参考**：[Lesson 5.1：上下文治理分层与 Steering Layer](../stage-1/lesson-5.1.md)

### 思维转换：从 RAG 到知识编译

| 模式 | RAG (传统) | Agentic Wiki (新) |
|------|-----------|------------------|
| **本质** | 临时翻书 | 主动编写百科全书 |
| **状态** | 碎片、孤立 | 互联、结构化 |
| **价值** | 解决当下提问 | 积累项目资产 |

### 知识循环：产品主理人的三板斧

1. **灌入 (Ingest)**：当你写完一份调研笔记，让 Agent 把它「编译」进项目。它会自动更新相关的需求页、技术实现页。
2. **提问 (Query)**：当你需要决策时，问你的 Wiki。它能给出带引用的全景分析。
3. **巡检 (Inspect)**：让 Agent 每天跑一次巡检，发现你文档里的逻辑漏洞。

### CLAUDE.md / AGENTS.md 是 Wiki 入口

如果你从 Lesson 5 开始就在用 `CLAUDE.md`，你已经在维护 LLM Wiki 的入口，只是可能没用这个名字。入口应该精简、有导航性，把 Agent 路由到正确的知识和工作流，而不是复制整套百科。

| 入口 | 适用范围 | Claude Code 如何使用 |
|------|----------|----------------------|
| `CLAUDE.md` | Claude Code 专属说明 | 从当前目录及父目录自动加载；可写 Hooks、Skills 等专属配置 |
| `AGENTS.md` | 多种 Agent 工具共享的项目约束 | Claude Code 不会自动读取；在 `CLAUDE.md` 中用 `@AGENTS.md` 导入 |

如果团队跨工具协作，把共同规则写一次到 `AGENTS.md`，再由 `CLAUDE.md` 导入并补充 Claude Code 专属内容。详细知识继续留在 `docs/`、ADR、代码和 Issue，任务流程与专项约束继续留在 skills、rules 和 hooks。

> 回到 [Lesson 5：CLAUDE.md](../stage-1/lesson-5.md) 复习入口模板；回到 [Lesson 5.1：上下文治理分层](../stage-1/lesson-5.1.md) 复习不同载体的职责。

### LLM Wiki 的双层结构：Knowledge 与 Steering

前面的 Wiki 解决了“知识如何被编译、关联和搜索”。但应用维度还有另一层问题：Agent 找到材料以后，**是否知道该怎么判断、按什么顺序行动、由谁验收**？

| 层 | 主要问题 | 典型内容 | 对 Agent 的作用 |
|----|----------|----------|-----------------|
| Knowledge Wiki | 我们知道什么？ | PRD、ADR、调研、代码说明、历史决策、会议记录 | 提供事实、背景和引用 |
| Steering Layer | 我们应该怎么判断和行动？ | 项目原则、任务路由、工作流程、质量标准、禁止事项、取舍规则 | 约束行动顺序与输出质量 |

两层不是两套目录，而是同一套应用上下文的两种职责：

```text
CLAUDE.md / AGENTS.md = 入口和路由器
skills                 = 任务流程
rules                  = 可复用、可按路径触发的约束
hooks / tests          = 确定性执行与验收
memory                 = 个人偏好、纠正和历史原因
code / docs / issues   = 当前事实源
```

**QMD 解决“搜得到”，Steering 解决“用得对”。** 搜索引擎可以找到十份相关文档，但只有 Steering Layer 会告诉 Agent 哪份是事实源、应该先读什么、冲突时相信谁，以及最后必须通过什么检查。

#### 从任务进入到验收：五段 Steering 链

1. **任务识别**：当前是写内容、修 Bug、改 UI、做 PR Review，还是处理行业案例？
2. **路由规则**：不同任务应该读取哪些 skills、rules、docs 和事实源？
3. **行动流程**：先检索还是先写测试？哪些步骤不可跳过？
4. **判断标准**：什么叫合格？速度、兼容性、安全和品牌发生冲突时谁优先？
5. **验收机制**：哪些靠 Agent 自检，哪些必须由 Hooks、tests、reviewer 或人类强制执行？

这五段把“多放上下文”变成“稳定的应用工作方式”。入口文件只声明路线，不复制沿途所有资料。

#### 可复制的应用上下文入口模板

下面这份 `CLAUDE.md` / `AGENTS.md` 模板控制在 80 行以内。删除不适用的任务类型，再把占位路径换成项目里的真实文件：

```md
# Application Context Entry

## Always-on principles
- Prefer existing components, documents, and workflows before creating new ones.
- Treat current code, tests, formal docs, issues, and PRs as sources of truth.
- Treat memory and old documents as pointers; verify facts before using them.
- Keep changes scoped, reversible, and tied to explicit acceptance criteria.

## Task routing

### Before writing content
- Read `docs/writing-style.md`.
- Search existing content for overlap before drafting.
- Preserve first-person experience when the source is personal material.
- Run the editorial review workflow before delivery.

### Before frontend changes
- Read `.claude/rules/frontend.md` and the current design tokens.
- Reuse existing components before creating new variants.
- Keep internal tools information-dense; do not add a marketing Hero by default.
- Verify desktop and mobile screenshots after implementation.

### Before backend or API changes
- Read `docs/architecture.md` and the relevant API contract.
- Search callers and tests before changing a schema.
- Write or update tests before implementation.
- Run the required test and security checks.

### Before regulated-industry outputs
- Read the confidentiality, source, and human-review boundaries.
- Remove sensitive information from examples and client-facing versions.
- Mark every external source that affects the conclusion.
- State which final judgments require a qualified professional.

## Execution order
1. Identify the task type and acceptance criteria.
2. Load only the routed skill, rules, and factual documents.
3. Execute the required workflow without skipping quality gates.
4. Verify against current facts and report skipped checks honestly.

## Quality gates
- No unsupported claims or stale paths.
- No duplicated workflow or component without a reuse check.
- Tests, screenshots, citations, or human review completed as routed.
- Output matches the project format and user-visible quality standard.

## Boundaries
- Do not copy full knowledge documents into this entry file.
- Do not treat memory as final project truth.
- Do not weaken a deterministic check into a prose suggestion.
```

模板里的路径只是示例。一个合格入口应该短到每次都值得加载，同时明确到能让 Agent 选择正确路线。

#### 垂直行业例子：律师工作台写什么，不写什么

律师行业需要大量法律知识，但这些知识不应该全部常驻在 `CLAUDE.md`。入口承担的是机构工作守则：

| 应写入 Steering Layer | 应留在 Knowledge Wiki |
|-----------------------|------------------------|
| 教学版本与客户版本的边界 | 法律条文、案例库、研究材料 |
| 来源必须标注 | 具体案件事实和证据目录 |
| 敏感信息必须清理 | 长篇法律分析和会议记录 |
| 最终法律判断由律师复核 | 可检索的专业知识与历史意见 |
| 禁止把课堂示例冒充正式意见 | 经批准的模板与正式文档 |

这与垂直课程里的原则一致：`CLAUDE.md` 稳定协作和复核边界，不能替代律师判断，也不应该写成长篇法律百科。

#### 团队为什么需要 Collaborative Steering

Luke Wroblewski 在 2026 年 5 月 18 日的文章《[Collaborative Steering](https://www.lukew.com/ff/entry.asp?2153)》中指出：当团队成员各自用不同的 prompts、memory、skills 和 agent 配置驱动 AI 时，个人效率可能上升，产品方向却会分散。设计、工程和产品需要共同维护项目级上下文，把交互原则、品牌声音、性能、代码结构和基础设施约束导向同一个目标。

因此，Steering Layer 不是某个人的“超级提示词”，而是一份团队可共同评审、版本化和演进的应用协作协议。

### 工具选型：Obsidian 是你的 IDE

在 cc4pm 的世界里，**Obsidian 不只是笔记软件，它是项目管理的仪表盘**。利用它的图谱视图，你可以直观地看到：
- 需求节点是如何连接到功能模块的。
- 哪部分知识还没有被 AI 充分理解（孤立节点）。

### QMD——本地优先的文档搜索引擎

上面介绍了 Ingest（灌入）和 Inspect（巡检），但**最高频的操作其实是 Query（查询）**：你有几百篇 Markdown 笔记、会议记录、技术文档，想找某个内容时只能用文件名硬搜。

[QMD（Query Markup Documents）](https://github.com/tobi/qmd) 由 Shopify CEO Tobias Lutke 开发，是一个**完全本地运行**的 Markdown 搜索引擎。它的核心价值：

```
传统搜索 (grep/Spotlight):
  你搜 “项目时间线” → 文档里写的是 “Q4 规划” → 搜不到

QMD 混合搜索:
  BM25 全文检索（精确匹配）+ 向量语义搜索（理解意图）+ LLM 重排序（精选结果）
  → 即使用词不同，也能找到相关文档
  → 全部在你的设备上运行，文档不上传到任何云端
```

**为什么产品主理人应该关注**：你的会议记录、竞品分析、内部讨论不适合上传到第三方 RAG 服务。QMD 让你在保证隐私的前提下，获得语义级别的搜索能力。

#### 快速上手

```bash
# 安装
npm install -g @tobilu/qmd

# 索引你的笔记目录
qmd collection add ~/notes --name notes
qmd collection add ~/Documents/meetings --name meetings

# 生成向量索引（首次需下载约 2GB 模型，之后缓存）
qmd embed

# 搜索——三种模式
qmd search “认证流程”                         # 关键词搜索（快）
qmd vsearch “用户怎么登录”                     # 语义搜索（理解意图）
qmd query “季度规划会议说了什么” -c meetings    # 混合搜索（推荐）
```

#### 集成到 Claude Code（MCP）

QMD 支持 MCP 协议，配好后 Claude 能直接搜索你的本地文档：

```json
{
  “mcpServers”: {
    “qmd”: {
      “command”: “qmd”,
      “args”: [“mcp”]
    }
  }
}
```

配置完成后，你可以直接问 Claude：”在我的笔记里搜一下关于用户增长的讨论”——Claude 会通过 QMD MCP 在本地文档中进行语义搜索，然后基于搜索结果回答你。

#### QMD vs 其他搜索方案

| 特性 | QMD | grep/Spotlight | 云端 RAG |
|------|-----|---------------|---------|
| 语义理解 | 有 | 无 | 有 |
| 隐私保护 | 本地运行 | 本地运行 | 需上传 |
| API 费用 | 无 | 无 | 有 |
| MCP 集成 | 支持 | 不支持 | 部分 |

> **适用场景**：个人知识库、团队内部文档、会议记录。如果你有大量 Markdown 笔记且在意隐私，QMD 是目前最好的本地搜索选择。注意它目前只支持 Markdown 格式，其他格式需先转换。

#### 与 Agentic 知识库和 Steering 的关系

```text
LLM Wiki       → 写与组织：把新知识编译成结构化页面
QMD            → 搜：从大量 Markdown 中找到相关证据
Steering Layer → 用：决定读什么、如何行动、冲突时相信谁
Hooks / tests / reviewer / 人 → 验：执行确定性检查与专业复核
```

它们不是竞争关系。Wiki 让知识可维护，QMD 让知识“搜得到”，Steering 让 Agent“用得对”，确定性工具与人类复核负责证明结果达到质量边界。

> **拓展玩法**：本地索引的语料从哪里来？除了自己写的笔记，还可以接入**外部高质量信息源**——比如把"你在微信读书里的所有划线和想法"导出成 Markdown 喂给 QMD。详见 [Lesson 24.7：微信读书 Skill](./lesson-1.7.md)。

---

## 实操练习

### 练习 1：开启你的第一个 LLM Wiki

1. 在项目根目录下创建一个 `research/` 文件夹。
2. 告诉 Claude Code：“请根据本课的 Knowledge Wiki / Steering Layer 模型，以及 [Lesson 5.1](../stage-1/lesson-5.1.md) 的上下文分层原则，为我初始化一个项目研究知识库，并对我们刚才讨论的 Karpathy 观点进行一次 Ingest。”
3. 在 Obsidian 中打开 `research/` 文件夹，查看 AI 生成的第一个实体页面。

### 练习 2：用 QMD 索引你的文档

1. 安装 QMD：`npm install -g @tobilu/qmd`
2. 索引一个 Markdown 目录：`qmd collection add ~/your-notes --name notes && qmd embed`
3. 测试三种搜索：分别用 `qmd search`、`qmd vsearch`、`qmd query` 搜索同一个主题，对比结果差异。
4. （可选）配置 QMD 的 MCP 集成，让 Claude Code 直接搜索你的本地文档。

### 练习 3：写一个应用上下文入口

1. 从模板中选择 3 类与你项目最相关的任务，为每类任务写清读取路径、行动顺序和质量闸门。
2. 把入口控制在 80 行以内；长背景移到 docs，详细流程移到 skill，路径约束移到 rules。
3. 为每类任务至少写 1 个确定性或人工验收点，不要只写“请认真检查”。
4. **新开一个 Claude Code session**，让 Agent 仅凭这个入口分别解释三类任务会怎么路由，不要在当前教学对话中直接执行项目改动。
5. 检查它有没有加载无关资料、误把 Memory 当事实，或跳过 tests、截图、引用、专业复核等闸门；据此精简入口。

---

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 返回 Lesson 24：高级特性
- 前往 Lesson 25：完整项目实战
- 返回主菜单

---
*阶段 5 | Lesson 24.3/26 | 上一课: Lesson 24.2 - 插件与 SDK | 下一课: Lesson 24.4 - AI 绘图 (Draw.io)*
