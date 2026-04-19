# Lesson 5: CLAUDE.md：项目的 AI 记忆

## 本课目标

- 理解 CLAUDE.md 的作用：每次对话开始时自动加载的项目指令
- 掌握 CLAUDE.md 的文件层级和加载规则
- 学会判断什么该写进 CLAUDE.md、什么不该写
- 了解 MEMORY.md 自动记忆机制与 CLAUDE.md 的区别

## 核心内容

### 什么是 CLAUDE.md

CLAUDE.md 是一个**特殊文件**，Claude Code 会在每次对话开始时**自动加载**它的内容。

你可以把它理解为"给 AI 的项目手册"——每次 Claude 上班，它第一件事就是读这份手册。

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  每次启动 claude 时：                               │
│                                                   │
│  1. 加载系统提示词（Anthropic 内置）                 │
│  2. 加载 CLAUDE.md ← 你写的项目指令                 │
│  3. 加载 Rules（规则文件）                          │
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

### Claude Code 项目目录全景：五层扩展体系

理解了 CLAUDE.md 文件层级后，让我们看看一个**成熟的 Claude Code 项目**完整的目录结构。这五层扩展体系各有分工，协同运作：

```
Project/
├── CLAUDE.md                      # 项目契约（自动加载）
├── .claude/
│   ├── rules/                     # 规则：路径/语言/文件类型约束
│   │   ├── core.md                #   核心编码规范
│   │   ├── config.md              #   配置文件处理规则
│   │   └── release.md             #   发布相关约束
│   ├── skills/                    # 技能：任务型工作流（按需加载）
│   │   ├── runtime-diagnosis/     #   统一收集日志、状态和依赖
│   │   ├── config-migration/      #   配置迁移回滚防污
│   │   ├── release-check/         #   发布前校验、smoke test
│   │   └── incident-triage/       #   线上故障分诊
│   ├── agents/                    # 代理：自定义 Subagent
│   │   ├── reviewer.md            #   代码审查专家
│   │   └── explorer.md            #   代码探索助手
│   └── settings.json              # 配置：权限、Hooks、环境变量
└── docs/
    └── ai/
        ├── architecture.md        # 架构知识（按需读取）
        └── release-runbook.md     # 发布手册（按需读取）
```

#### 各层职责对比

| 层 | 加载时机 | 职责 | 类比 |
|---|---------|------|------|
| **CLAUDE.md** | 每次对话自动 | 项目契约：测试命令、架构约定、特殊规则 | 员工手册首页 |
| **Rules** | 每次对话自动 | 编码约束：安全规则、代码风格、Git 规范 | 公司制度文件 |
| **Skills** | 用户触发 `/skill-name` | 任务工作流：诊断流程、迁移步骤、检查清单 | 操作手册（需要时翻阅） |
| **Agents** | Claude 自主或用户触发 | 专家角色：在独立上下文中执行特定任务 | 可以派遣的专家团队 |
| **settings.json** | 启动时 | 运行时配置：权限、Hooks、环境变量、MCP | 系统设置面板 |

#### 为什么这样分层？

```
              加载频率 ↑
                      │
    CLAUDE.md ●───────│─── 每次必加载，必须精简
    Rules     ●───────│─── 每次必加载，按主题拆分
                      │
    ──────────────────│──── 分界线：上方"常驻"，下方"按需" ────
                      │
    Skills    ○───────│─── 按需加载，可以很详细
    Agents    ○───────│─── 按需启动，独立上下文
    docs/ai/  ○───────│─── Claude 需要时自己去读
                      │
              加载频率 ↓
```

**核心原则**：常驻层（CLAUDE.md + Rules）要精简，因为每次都消耗上下文。按需层（Skills + Agents + docs）可以很详细，因为只在需要时加载。

> **延伸阅读**：在 **Lesson 23（阶段 4）**中，你将看到这些目录中的真实内容——cc4pm 的 44 个 Rules 文件（9 通用 + 7 语言 × 5）如何分工协作，21 个 Hooks 如何在 6 个触发点自动执行质量检查。在 **Lesson 24（阶段 5）**中，你还将了解 23 个 MCP 服务器的配置方式（`mcp-configs/mcp-servers.json`）。现在只需记住这个五层结构，后面会用真实例子填充它。

> **完整的可视化讲解请打开** [lesson-5-directory-guide.html](lesson-5-directory-guide.html)

### 精简原则

**目标：30-100 行。超过 200 行，信噪比开始下降。**

对 CLAUDE.md 中的每一行，问自己：

> "如果删掉这一行，Claude 会不会犯错？"

如果答案是"不会"——删掉它。

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  CLAUDE.md 的信噪比曲线：                         │
│                                                  │
│  信息量 ↑                                        │
│         │      ╱──── 最佳区间                     │
│         │    ╱       (30-100 行)                  │
│         │  ╱                                      │
│         │╱                                        │
│  ───────┼──────────────────────→ 行数             │
│         │         ╲                               │
│         │          ╲──── 过载区间                  │
│  有效性 ↓               (200+ 行)                 │
│                         Claude 开始忽略内容        │
│                                                  │
└─────────────────────────────────────────────────┘
```

**IMPORTANT、YOU MUST 等强调标记**：对真正关键的规则使用强调，但不要滥用。如果每条规则都是 IMPORTANT，等于没有 IMPORTANT。

**复杂规则外置**：如果规则太多，不要全塞进 CLAUDE.md。把它们拆分到 `.claude/rules/` 目录下：

```
.claude/
├── CLAUDE.md           # 精简版，30-100 行
└── rules/
    ├── security.md     # 安全规则
    ├── testing.md      # 测试规则
    └── git-workflow.md # Git 工作流规则
```

Rules 目录下的文件也会被自动加载，但与 CLAUDE.md 分开管理，更清晰。

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

## 演示案例：解读 cc4pm 的 CLAUDE.md

让我们用 cc4pm 自身的 [CLAUDE.md](../../../../../CLAUDE.md) 作为范例，分析它的最佳实践。

### 推荐的 CLAUDE.md 结构模板

经过大量实践验证，以下六段式结构是 CLAUDE.md 的黄金模板：

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

**六段式的设计哲学**：

| 章节 | 用途 | 信噪比价值 |
|------|------|-----------|
| **Project Contract** | 一句话定位，防止 Claude 误解项目性质 | 高 |
| **Build And Test** | Claude 猜不到的命令 | 最高 |
| **Architecture Boundaries** | 代码无法自描述的约定 | 高 |
| **NEVER** | 红线，防止不可逆操作 | 最高 |
| **ALWAYS** | 正向约束，确保质量 | 高 |
| **Compact Instructions** | 压缩时的"保命信息" | 关键 |

> 注意 `Compact Instructions` 章节——当上下文过大触发 `/compact` 时，Claude 需要知道哪些信息必须保留。这是很多人忽略但极其实用的设计。

### cc4pm 的 CLAUDE.md 对照分析

对照推荐模板，分析当前 cc4pm 的 [CLAUDE.md](../../../../../CLAUDE.md)：

| 推荐章节 | cc4pm 现状 | 评价 |
|---------|-----------|------|
| Project Contract | `## Project Overview` | 有，但可以更精简 |
| Build And Test | `## Running Tests` | 有，包含具体命令 |
| Architecture Boundaries | `## Architecture` + `## Development Notes` | 有，信息充分 |
| NEVER | 缺失 | 可以补充红线 |
| ALWAYS | 缺失 | 可以补充正向约束 |
| Compact Instructions | 缺失 | 建议补充 |

整体约 60 行，在最佳范围内。引用 CONTRIBUTING.md 而非内联——这是正确做法。可以按六段式模板进一步优化。

### 高级技巧：让 CLAUDE.md 自我进化

#### 技巧 1：纠错后让 Claude 自更新

每次你纠正 Claude 的一个错误，不要只是纠正这一次——让它把教训写进 CLAUDE.md：

```
"Update your CLAUDE.md so you don't make that mistake again."
```

这是一个**自增强循环**：
```
Claude 犯错 → 你纠正 → Claude 更新 CLAUDE.md
→ 下次启动时加载新规则 → 不再犯同样的错
→ 越用越顺
```

用久了你会发现 Claude 越来越少犯相同的错误。但要注意：**定期 review CLAUDE.md**，时间一长总会有些条目慢慢过时或变得多余。

#### 技巧 2：用 /insights 总结行为规律

```bash
/insights
```

Claude Code 官方提供的 `/insights` 命令会分析你的使用模式，总结行为规律和改进建议。它可以帮你发现：
- 哪些操作你经常重复（应该写成规则或技能）
- 哪些纠正你频繁做出（应该写进 CLAUDE.md）
- 哪些工作流可以优化

结合 `/insights` 的输出来优化 CLAUDE.md，形成**数据驱动的持续改进**。

#### 技巧 3：定期 Review 清理

建议每月做一次 CLAUDE.md 审查：

```bash
claude
"审查当前项目的 CLAUDE.md：
 1. 哪些条目已经过时？（项目已经不用的命令、已删除的文件）
 2. 哪些条目是多余的？（Claude 已经能从代码推断）
 3. 哪些经常犯的错误还没写进去？
 给出具体的增删建议。"
```

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

### 练习 3：理解层级覆盖

```bash
claude

"检查 cc4pm 项目中是否存在子目录级别的 CLAUDE.md 文件。
 搜索所有目录下的 CLAUDE.md，列出它们的位置和内容摘要。"
```

## 常见问题

**Q: CLAUDE.md 和 README.md 有什么区别？**

A: README.md 是给**人**看的——项目介绍、安装步骤、使用说明。CLAUDE.md 是给 **AI** 看的——让 Claude Code 理解项目的特殊规则和约定。两者的受众不同，内容也应该不同。不要把 README 复制到 CLAUDE.md 里。

**Q: 团队成员不用 Claude Code，CLAUDE.md 会影响他们吗？**

A: 完全不影响。CLAUDE.md 只有 Claude Code 会读取，对其他工具和编辑器透明。把它提交到 Git 里没有任何副作用，但能让团队中使用 Claude Code 的成员获得一致的 AI 体验。

**Q: CLAUDE.md 和 .claude/rules/ 怎么选？**

A: 简单规则（10-20 条以内）直接写在 CLAUDE.md 里。当规则多到影响可读性时，拆分到 `.claude/rules/` 目录。Rules 的优势是可以按主题组织（security.md、testing.md），且同样自动加载。

**Q: MEMORY.md 会无限增长吗？**

A: Claude 只会自动加载前 200 行。如果记忆积累过多，你可以手动清理 `~/.claude/projects/<project>/memory/` 目录，或者让 Claude 整理："读取你的记忆文件，删除过时的信息，保留仍然有用的。"

**Q: 多人团队中，CLAUDE.md 容易冲突吗？**

A: CLAUDE.md 通常变动不频繁（设定好就很少改），所以 Git 冲突的概率很低。建议团队指定一个人负责维护，其他人通过 PR 提交修改建议。

## 下一步

- [1] 进入下一课：Lesson 6 - 命令与技能系统
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 5/26 (阶段内 5/10) | 上一课: Lesson 4.1 - 压力光谱 | 下一课: Lesson 6 - 命令与技能*
