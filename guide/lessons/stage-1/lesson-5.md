# Lesson 5: CLAUDE.md：上下文治理的入口

## 本课目标

- 理解 CLAUDE.md 的作用：上下文治理的项目级入口
- 掌握 CLAUDE.md 的文件层级和加载规则
- 学会判断什么该写进 CLAUDE.md、什么不该写
- 了解上下文需求如何从 CLAUDE.md 延伸到 Memory、Rules 和 AGENTS.md

## 核心内容

### 什么是 CLAUDE.md

CLAUDE.md 是一个**特殊文件**，Claude Code 会在每次对话开始时**自动加载**它的内容。

你可以把它理解为"给 AI 的项目手册"——每次 Claude 上班，它第一件事就是读这份手册。

更准确地说，CLAUDE.md 是**上下文治理的入口层**。它不负责保存所有知识，而是回答一个最高频的问题：每次进入这个项目，Claude 必须先知道哪些项目级事实和红线？

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  每次启动 claude 时：                               │
│                                                   │
│  1. 加载系统提示词（Anthropic 内置）                 │
│  2. 加载 CLAUDE.md ← 你写的项目指令                 │
│  3. 加载全局 Rules / 相关路径规则                    │
│  4. 进入交互模式，等待你的输入                       │
│                                                   │
│  CLAUDE.md 里写什么，Claude 就"记住"什么             │
│                                                   │
└──────────────────────────────────────────────────┘
```

CLAUDE.md 适合放那些 **Claude 无法从代码本身推断出来**的信息：
- 怎么运行测试（项目特定的命令）
- 代码风格的特殊偏好
- 架构决策的背景
- 开发环境的特殊配置

### 文件层级：从全局到局部

CLAUDE.md 不只是一个文件，而是一个**分层体系**。Claude Code 会按层级依次加载：

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  ~/.claude/CLAUDE.md          全局级别            │
│  ↓ 适用于你所有项目的通用规则                      │
│  ↓ 比如：你偏好的代码风格、常用工具                 │
│                                                  │
│  /project-root/CLAUDE.md      项目级别            │
│  ↓ 适用于整个项目，提交到 Git 供团队共享            │
│  ↓ 比如：项目架构、测试命令、部署流程               │
│                                                  │
│  /project-root/src/CLAUDE.md  子目录级别           │
│  ↓ 当 Claude 操作该目录下的文件时自动加载           │
│  ↓ 比如：src/ 下的编码约定、API 设计规范           │
│                                                  │
│  @path/to/import              导入语法            │
│    在 CLAUDE.md 中引用其他文件的内容                │
│    比如：@docs/api-guidelines.md                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

**层级的实际意义**：

| 层级 | 文件位置 | 谁维护 | 是否提交 Git | 典型内容 |
|------|---------|--------|-------------|---------|
| 全局 | `~/.claude/CLAUDE.md` | 你个人 | 否 | 个人偏好、常用工具链 |
| 项目 | `./CLAUDE.md` | 团队 | 是 | 项目架构、测试命令、规范 |
| 父目录 | 上级目录的 CLAUDE.md | 视情况 | 视情况 | Monorepo 中的共享规则 |
| 子目录 | 子目录的 CLAUDE.md | 团队 | 是 | 模块特定的约定 |

### 什么该写、什么不该写

这是最关键的判断。写多了，Claude 反而会忽略重要指令；写少了，Claude 会反复犯同样的错。

#### 该写（Claude 猜不到的）

```markdown
## Running Tests
# Claude 不知道你的项目用什么测试框架、怎么跑测试
node tests/run-all.js

## Code Style
# 你的项目有特殊的风格偏好
- 用 tabs 而非 spaces（违反多数默认风格）
- 函数名用 snake_case（如果 Claude 默认用 camelCase）

## Architecture
# 项目特有的架构决策
- agents/ 下的文件使用 YAML frontmatter 格式
- hooks 使用 JSON 格式，不是 YAML

## Dev Environment
# 本地开发的特殊注意事项
- 数据库在 Docker 容器中，先运行 docker compose up
- 需要设置 .env 文件，模板在 .env.example

## Gotchas
# 容易踩的坑
- 不要修改 scripts/install.js，它是自动生成的
- tests/ 下的文件名必须以 .test.js 结尾
```

#### 不该写（Claude 能从代码推断的）

```markdown
# ❌ 这些不需要写：

## 语言和框架
"这是一个 Node.js 项目"
# → Claude 看到 package.json 就知道了

## 标准约定
"JavaScript 变量用 camelCase"
# → 这是默认约定，不写 Claude 也会遵循

## 详细 API 文档
"POST /api/users 接受以下字段：name (string), email (string)..."
# → 太长了，用链接代替：@docs/api-reference.md

## 频繁变化的信息
"当前版本号是 2.3.1"
# → 下次发版就过时了，Claude 可以从 package.json 读

## 长篇教程
"如何使用 React Hooks：首先..."
# → 这是公共知识，Claude 已经知道
```

### 从入口到分层：CLAUDE.md 先管总纲

CLAUDE.md 最适合放**项目级常驻总纲**：启动、测试、架构边界、团队红线、压缩时必须保留的信息。

但它不是唯一上下文载体。把整个 `.claude/` 目录看成一个 **LLM Wiki**——一个为 AI 组织的结构化知识库，CLAUDE.md（或 AGENTS.md）就是这个 Wiki 的**首页**：

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  .claude/ = LLM Wiki（AI 的项目知识库）            │
│                                                  │
│  CLAUDE.md         ← 首页：每次必读的总纲         │
│  skills/*.md       ← 专题页：按需加载的工作流      │
│  rules/*.md        ← 规范页：路径触发的专项约束    │
│  memory/*.md       ← 经验页：跨会话积累的认知      │
│  agents/*.md       ← 角色页：独立上下文的专家      │
│  docs / 代码 / Git ← 参考区：现查的事实源          │
│                                                  │
│  首页精简，详情分散到各页面                         │
│  → 上下文高效，知识不丢失                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

这个视角能帮你统一判断信息归属：不是"塞进哪个配置文件"，而是"写在 Wiki 的哪一页"。随着项目变复杂，不同需求会自然分化：

| 需求 | 更适合的载体 |
|------|--------------|
| 项目级常驻说明 | CLAUDE.md |
| 个人偏好、协作习惯、历史原因 | Memory |
| 不同语言、目录、文件类型的专项约束 | `.claude/rules` |
| 多 Agent / 多工具共享项目说明 | AGENTS.md |
| 当前真实接口、函数、配置、任务状态 | 代码 / docs / Git / Issue |

这个 Wiki 有两个运作层面：

```text
系统层面（被动发现）：
  Wiki 的文档结构 + 交叉引用 + QMD 本地索引 → AI 能主动搜索和发现关联

微操层面（主动指向）：
  你知道某个任务和哪些历史上下文有关 → 用 @docs/xxx.md 直接告诉 Claude
  “先读这份 PRD 和上周的技术评审，再动手”
```

**系统层面**：Wiki 把需求文档、产品文档、技术方案按结构存放，文档之间层层引用形成知识图谱。再结合 QMD 这样的本地语义索引工具，AI 就能在项目知识中主动发现关联——即使你没有明确指出。

**微操层面**：系统能发现关联，但你往往更清楚”这个需求和以前哪个决策有关”。这时候不要等 AI 自己搜，直接用 `@path` 语法指向相关文档，让 AI 基于完整上下文做判断。Wiki 的价值在微操时体现为：你要指的文档，恰好已经被 Wiki 结构化地组织好了。

所以本课先把 CLAUDE.md 这个入口写好。上下文分层的完整方法在 **Lesson 5.1**。

### 精简原则

**目标：30-100 行。超过 200 行，信噪比开始下降。**

对 CLAUDE.md 中的每一行，问自己：

> "如果删掉这一行，Claude 会不会犯错？"

如果答案是"不会"——删掉它。

信噪比曲线：30-100 行是最佳区间，信息密度最高；超过 200 行进入过载区间，Claude 开始忽略内容，有效性不升反降。

**IMPORTANT、YOU MUST 等强调标记**：对真正关键的规则使用强调，但不要滥用。如果每条规则都是 IMPORTANT，等于没有 IMPORTANT。

**复杂规则外置**：如果规则太多，不要全塞进 CLAUDE.md。把它们拆分到 `.claude/rules/` 目录下：

```
.claude/
├── CLAUDE.md           # 精简版，30-100 行
└── rules/
    ├── security.md     # 全局安全规则
    ├── testing.md      # 全局测试规则
    └── api-contract.md # 可用 paths 限定到 API 文件
```

Rules 可以是全局规则，也可以通过 `paths` 按相关文件触发。不要把所有规则都当成常驻上下文；路径触发的写法会在 Lesson 5.1 展开。

### MEMORY.md 和自动记忆

除了你手写的 CLAUDE.md，Claude Code 还有一个**自动记忆**机制：

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  CLAUDE.md  ←  你写的，项目指令                    │
│  ↓ 告诉 Claude "你应该怎么做"                     │
│                                                  │
│  MEMORY.md  ←  Claude 自己写的，跨会话笔记         │
│  ↓ Claude 记录 "我学到了什么"                     │
│  ↓ 存储在 ~/.claude/projects/<project>/memory/    │
│  ↓ 前 200 行自动加载到新会话                       │
│                                                  │
│  两者互补，不要混淆：                              │
│  CLAUDE.md = 项目规范（团队共享）                   │
│  MEMORY.md = AI 的个人笔记（本地的）               │
│                                                  │
└─────────────────────────────────────────────────┘
```

你可以主动让 Claude 记住某些信息：

```bash
claude
"记住：这个项目的部署地址是 staging.example.com，
 部署账号找运维组的小王。把这个写入你的记忆。"
# → Claude 会把这条信息写入 MEMORY.md
# → 下次启动时自动加载
```

但 Memory 只适合记录个人化线索，不适合替代代码事实。比如”用户喜欢先看结论”可以记；”某函数现在在哪个文件”不要记，应该让 Claude 现查代码。

> 详细的 Memory / Rules / AGENTS.md 分层方法，会在 **Lesson 5.1：上下文治理分层** 展开。

## 演示案例：解读 cc4pm 的 CLAUDE.md

用 cc4pm 自身的 [CLAUDE.md](../../../../../CLAUDE.md) 作为范例。经过大量实践验证，以下六段式结构是 CLAUDE.md 的黄金模板：

```markdown
# Project Contract

一句话定位：这个项目是什么、为谁服务。

## Build And Test

# 构建、测试、Lint——Claude 必须知道的命令
npm run build
npm test
npm run lint

## Architecture Boundaries

# 项目结构中 Claude 猜不到的约定
- agents/ 使用 YAML frontmatter 格式
- hooks 使用 JSON 格式
- skills/ 每个子目录包含 SKILL.md

## NEVER

# 明确的红线——Claude 绝不能做的事
- NEVER modify scripts/install.js (auto-generated)
- NEVER commit .env files
- NEVER use `rm -rf` on project directories

## ALWAYS

# 必须遵守的正面约束
- ALWAYS run tests before suggesting commit
- ALWAYS follow existing naming conventions (kebab-case)
- ALWAYS check CONTRIBUTING.md for file format specs

## Compact Instructions

# 当 Claude 执行 /compact 压缩上下文时，必须保留的关键信息
- Test command: node tests/run-all.js
- Package manager: npm (detected automatically)
- File format: agents=YAML frontmatter, hooks=JSON
```

**六段式的设计哲学**：`Build And Test` 和 `NEVER` 信噪比最高（Claude 猜不到的命令和不可逆操作的红线）；`Compact Instructions` 是很多人忽略的关键设计——当 `/compact` 触发时，Claude 需要知道哪些信息必须保留。

### cc4pm 的 CLAUDE.md 对照分析

对照推荐模板，cc4pm 的 [CLAUDE.md](../../../../../CLAUDE.md) 有 Project Contract、Build And Test、Architecture Boundaries，但缺少 NEVER、ALWAYS 和 Compact Instructions。整体约 60 行，在最佳范围内。引用 CONTRIBUTING.md 而非内联——这是正确做法。

### 下一步：让上下文治理继续生长

当你纠正 Claude 的错误时，不要急着把所有教训都塞回 CLAUDE.md。先判断它属于哪一类：

```text
所有人都要遵守的项目红线       → CLAUDE.md
只和你的长期协作偏好有关       → Memory
只在某类文件或目录下成立       → .claude/rules
需要团队正式确认的架构决策     → docs / ADR
会随代码变化的当前事实         → 现查代码、Git、Issue
```

这就是上下文治理从“一个入口文件”继续生长的方式。

## 动手试试

### 练习 1：用 /init 生成 CLAUDE.md

如果你有自己的项目，可以让 Claude 自动生成一份 CLAUDE.md：

```bash
# 进入你的项目目录
cd /path/to/your/project
claude

# 输入：
/init
# Claude 会分析你的代码库，自动生成一份 CLAUDE.md
# 包括：项目描述、构建命令、测试命令、架构概述
```

> `/init` 生成的是起点，不是终点。生成后你应该审查并精简它。

### 练习 2：评估一份 CLAUDE.md 的质量

```bash
cd cc4pm
claude

"假设你是一个 CLAUDE.md 审计专家。
 读取当前项目的 CLAUDE.md，用以下评分标准打分（1-5 分）：
 - 信息必要性：是否每条信息都是 Claude 猜不到的？
 - 精简程度：行数是否在 30-100 行的最佳范围？
 - 结构清晰度：是否易于快速扫描？
 - 可操作性：是否包含可直接运行的命令？
 给出总分和改进建议。"
```

### 练习 3：用 LLM Wiki 视角审视你的项目

```bash
claude

"检查当前项目的 .claude/ 目录结构，用 LLM Wiki 的视角分析：
 CLAUDE.md 是否起到了'首页'的作用？
 Skills、Rules、Memory 是否合理分层？
 有哪些信息应该从首页移到专题页？"
```

> 这个练习帮助你建立"Wiki 思维"：每次写 CLAUDE.md 时，想的不是"还要加什么"，而是"哪些应该链接到其他页面"。

## 常见问题

**Q: CLAUDE.md 和 README.md 有什么区别？**

A: README.md 是给**人**看的——项目介绍、安装步骤、使用说明。CLAUDE.md 是给 **AI** 看的——让 Claude Code 理解项目的特殊规则和约定。两者的受众不同，内容也应该不同。不要把 README 复制到 CLAUDE.md 里。

**Q: 团队成员不用 Claude Code，CLAUDE.md 会影响他们吗？**

A: 完全不影响。CLAUDE.md 只有 Claude Code 会读取，对其他工具和编辑器透明。把它提交到 Git 里没有任何副作用，但能让团队中使用 Claude Code 的成员获得一致的 AI 体验。

**Q: CLAUDE.md 和 .claude/rules/ 怎么选？**

A: 项目级、所有任务都相关的短规则直接写在 CLAUDE.md 里。语言、目录、文件类型相关的专项规则，拆到 `.claude/rules/`。Lesson 5.1 会专门讲 `paths` 触发写法。

**Q: MEMORY.md 会无限增长吗？**

A: Claude 只会自动加载前 200 行。如果记忆积累过多，你可以手动清理 `~/.claude/projects/<project>/memory/` 目录，或者让 Claude 整理："读取你的记忆文件，删除过时的信息，保留仍然有用的。"

**Q: 多人团队中，CLAUDE.md 容易冲突吗？**

A: CLAUDE.md 通常变动不频繁（设定好就很少改），所以 Git 冲突的概率很低。建议团队指定一个人负责维护，其他人通过 PR 提交修改建议。

**Q: "整个 .claude/ 是一个 LLM Wiki"是什么意思？**

A: 把 `.claude/` 目录想象成一个为 AI 编写的 Wiki 百科。CLAUDE.md 是首页——每次 Claude 进入项目必读；Skills 是专题文章，需要时才翻阅；Rules 是行为规范手册；Memory 是 Claude 自己的工作笔记。这种视角能帮你决定每条信息应该放在 Wiki 的哪一页，避免把所有内容堆在首页。详见 Lesson 24.3 的 LLM Wiki 深度讲解。

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入补充课：Lesson 5.1 - 上下文治理分层
- 返回主菜单
- 退出学习

---
*阶段 1 | Lesson 5/26 (阶段内 5/10) | 上一课: Lesson 4.1 - 压力光谱 | 下一课: Lesson 5.1 - 上下文治理分层*
