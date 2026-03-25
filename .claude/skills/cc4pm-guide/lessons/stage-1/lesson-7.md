# Lesson 7: 代理系统：你的 AI 专家团

## 本课目标

- 理解子代理（Subagents）的工作原理，以及它与直接对话的本质区别
- 掌握 Claude Code 的三种内置子代理和各自适用场景
- 了解 cc4pm 的 18 个自定义代理阵容
- 学会在正确的场景下使用子代理来保护上下文窗口

## 核心内容

### 什么是子代理（Subagents）

在前几课中，我们一直在和 Claude 的"主对话"打交道。你说一句，它做一件事，所有的文件读取、命令执行、思考过程都堆在同一个上下文窗口里。

**子代理是完全不同的工作方式。**

子代理是在**独立上下文窗口**中运行的专业 AI 助手。它有自己的系统提示词、指定的工具权限、独立的工作空间。

```
┌─────────────────────────────────────────────────────┐
│              你的主对话（Main Context）                │
│                                                      │
│  你: "分析一下所有代理文件的格式"                       │
│                                                      │
│  Claude: 好的，我派一个子代理去做这件事。               │
│                                                      │
│  ┌────────────────────────────────────────┐           │
│  │    子代理（独立上下文窗口）              │           │
│  │                                        │           │
│  │  读取 agents/planner.md               │           │
│  │  读取 agents/architect.md             │           │
│  │  读取 agents/code-reviewer.md         │           │
│  │  读取 agents/security-reviewer.md     │           │
│  │  ... 读取全部 18 个文件 ...            │           │
│  │  分析格式、提取信息、整理表格           │           │
│  │                                        │           │
│  │  → 只返回最终摘要给主对话               │           │
│  └────────────────────────────────────────┘           │
│                                                      │
│  Claude: 以下是分析结果...（简洁的表格）               │
│                                                      │
│  ✅ 主上下文只消耗了摘要的 tokens                      │
│  ✅ 18 个文件的内容没有污染主对话                       │
│  ✅ 你可以继续用干净的上下文做其他事                    │
└─────────────────────────────────────────────────────┘
```

**核心收益：探索过程留在子代理内部，不污染主对话的上下文。**

如果不用子代理，读取 18 个文件的内容会直接塞进你的主上下文，消耗大量 tokens，让后续的工作质量下降。用子代理，你只得到精炼的结果。

### 三种内置子代理

Claude Code 内置了三种子代理，覆盖最常见的使用场景：

| 子代理类型 | 权限 | 适用场景 | 特点 |
|-----------|------|---------|------|
| **Explore** | 只读（Read, Grep, Glob） | 搜索代码、分析架构、理解现状 | 最安全，不会修改任何东西 |
| **Plan** | 只读 + 规划能力 | Plan Mode 下的上下文收集 | 专为研究阶段设计 |
| **General-purpose** | 完整工具集 | 复杂的多步骤任务 | 最强大，可读写执行 |

**你不需要手动选择类型**——Claude 会根据你的请求自动判断该派哪种子代理。

### 子代理的工作原理

理解这四个关键点，你就掌握了子代理的本质：

**1. 每次调用都是全新的上下文窗口**

子代理不继承主对话的历史。它拿到的只有父级发送的一段提示词。这意味着它不会被之前的对话干扰——这是一个优势，不是缺陷。

**2. 父级发送提示 → 子代理独立工作 → 只返回最终摘要**

```
父级: "分析 agents/ 目录下所有代理的 YAML 前置元数据"
  ↓
子代理独立工作:
  - 调用 Glob 找到 18 个 .md 文件
  - 调用 Read 逐个读取
  - 提取 name, description, tools, model 字段
  - 整理成表格
  ↓
返回给父级: "共 18 个代理，按功能分为 4 类..."（精炼摘要）
```

**3. 中间过程留在子代理内部**

子代理读了多少文件、执行了多少搜索、走了哪些弯路——这些全部留在它自己的上下文窗口里。主对话看不到这些中间步骤，也不需要看到。

**4. 子代理不能再嵌套子代理**

这是一个设计限制，防止无限嵌套。子代理必须在自己的上下文窗口内完成所有工作。

### 自定义代理格式

cc4pm 的每个代理都是一个 Markdown 文件，使用 YAML 前置元数据定义：

```markdown
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

# Security Reviewer

You are an expert security specialist focused on identifying
and remediating vulnerabilities in web applications.

## Core Responsibilities

1. **Vulnerability Detection** — Identify OWASP Top 10 issues
2. **Secrets Detection** — Find hardcoded API keys, passwords
3. **Input Validation** — Ensure all user inputs are sanitized
...
```

四个关键字段：

| 字段 | 含义 | 示例 |
|------|------|------|
| `name` | 代理名称，用于调用 | `security-reviewer` |
| `description` | 功能描述，Claude 据此判断何时使用 | `Reviews code for security vulnerabilities` |
| `tools` | 可用的工具列表 | `["Read", "Grep", "Glob"]`（只读）或包含 `"Bash", "Write"` |
| `model` | 使用的模型 | `opus`（深度推理）或 `sonnet`（均衡高效） |

**注意 tools 的选择**：
- 只需要分析代码的代理 → 只给 `Read, Grep, Glob`（最安全）
- 需要修改代码的代理 → 加上 `Write, Edit`
- 需要执行命令的代理 → 加上 `Bash`（谨慎使用）

### 演示案例：探索 cc4pm 的 18 个代理

这是一个非常适合用子代理的典型场景——需要读取大量文件，但我们只关心汇总结果。

```bash
cd cc4pm
claude

# 让 Claude 用子代理来完成调研
"用子代理分析 agents/ 目录下的所有代理定义，给我一份表格：
 代理名称 | 描述 | 可用工具 | 使用的模型"
```

**你会观察到**：Claude 会派出一个 Explore 子代理，它在独立上下文中逐个读取所有代理文件，然后只把整理好的表格返回给主对话。

**预期输出**（精简版）：

| 代理名称 | 描述 | 工具 | 模型 |
|----------|------|------|------|
| planner | 需求分析和实现规划 | Read, Grep, Glob | opus |
| architect | 系统架构设计 | Read, Grep, Glob | opus |
| code-reviewer | 代码质量审查 | Read, Grep, Glob, Bash | sonnet |
| security-reviewer | 安全漏洞检测 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| tdd-guide | 测试驱动开发 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| e2e-runner | Playwright E2E 测试 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| build-error-resolver | 构建错误修复 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| database-reviewer | 数据库设计审查 | Read, Grep, Glob | sonnet |
| doc-updater | 文档自动更新 | Read, Write, Edit, Grep, Glob | sonnet |
| refactor-cleaner | 重构和代码清理 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| chief-of-staff | 项目协调和任务分配 | Read, Grep, Glob | opus |
| loop-operator | 自改进循环操作 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| harness-optimizer | 编排流程优化 | Read, Write, Edit, Grep, Glob | sonnet |
| python-reviewer | Python 代码审查 | Read, Grep, Glob, Bash | sonnet |
| go-reviewer | Go 代码审查 | Read, Grep, Glob, Bash | sonnet |
| kotlin-reviewer | Kotlin 代码审查 | Read, Grep, Glob, Bash | sonnet |
| go-build-resolver | Go 构建错误修复 | Read, Write, Edit, Bash, Grep, Glob | sonnet |
| kotlin-build-resolver | Kotlin 构建错误修复 | Read, Write, Edit, Bash, Grep, Glob | sonnet |

**按功能分类来理解**：

```
┌─ 规划与分析 ─────────────────────┐
│  planner          需求规划        │
│  architect        架构设计        │
│  chief-of-staff   项目协调        │
├─ 质量保障 ───────────────────────┤
│  code-reviewer    通用代码审查     │
│  security-reviewer 安全审查       │
│  python-reviewer  Python 审查     │
│  go-reviewer      Go 审查         │
│  kotlin-reviewer  Kotlin 审查     │
│  database-reviewer 数据库审查     │
├─ 开发与测试 ─────────────────────┤
│  tdd-guide        测试驱动开发     │
│  e2e-runner       端到端测试      │
│  build-error-resolver 构建修复    │
│  go-build-resolver Go 构建修复    │
│  kotlin-build-resolver Kotlin 构建修复 │
│  refactor-cleaner 重构清理        │
├─ 自动化与协调 ───────────────────┤
│  doc-updater      文档更新        │
│  loop-operator    自改进循环      │
│  harness-optimizer 流程优化       │
└──────────────────────────────────┘
```

### 创建你自己的子代理

使用 `/agents` 命令即可查看和创建代理：

```bash
/agents
# → 显示已有代理列表
# → 选择 "Create new agent" 交互式创建
```

`/agents` 会引导你填写 name、description、tools、model 和系统提示词，自动在 `.claude/agents/` 目录下生成 `.md` 文件。你也可以直接在该目录下手动新建文件。

#### 动手试试：用 /agents 创建一个"项目探索者"

```bash
/agents
# → 选择 "Create new agent"
# → name: project-scout
# → description: 快速探索项目结构和关键信息，返回精炼摘要
# → tools: Read, Grep, Glob（只读权限，最安全）
# → model: sonnet
# → 系统提示词：
#   "你是快速项目探索专家。扫描目录结构、读取配置文件、
#    统计关键数据，返回不超过 20 行的结构化摘要。"
```

创建后立即使用：

```bash
"用 project-scout 子代理探索当前项目，给我一份快速摘要"
```

观察：子代理在独立上下文中读取大量文件，只返回精炼摘要——你的主上下文保持干净。

### 动手试试

**练习 1：用子代理做代码调研**

```bash
claude

# 试试这个——让子代理去读大量代码，你只拿结果
"用子代理查看 agents/ 里使用 opus 模型的代理有哪些，
 分析一下：为什么这些代理需要用更强的模型？
 它们的任务有什么共同特点？"
```

观察子代理返回的结果后，注意你的主上下文依然很干净——输入 `/cost` 查看 token 消耗。

**练习 2：对比有无子代理的差异**

```bash
# 方式 A：不用子代理（直接在主对话中操作）
claude
"读取 agents/ 目录下所有代理文件，给我每个代理的名称和描述"
# 注意 /cost 显示的 token 消耗

/clear

# 方式 B：用子代理
"用子代理读取 agents/ 目录下所有代理文件，给我每个代理的名称和描述"
# 再看 /cost —— 主对话消耗的 token 显著更少
```

### 什么时候用子代理

| 场景 | 是否使用子代理 | 原因 |
|------|--------------|------|
| 探索不熟悉的代码库 | 用 | 需要读大量文件，只要结论 |
| 调研某个技术方案的可行性 | 用 | 研究过程很长，结论很短 |
| 代码审查 | 用 | 独立上下文 = 无偏见审查 |
| 并行调查多个问题 | 用 | 每个子代理独立工作 |
| 修改一个已知的小 bug | 不用 | 改动简单，直接做更快 |
| 需要基于对话历史做决策 | 不用 | 子代理看不到主对话历史 |
| 连续迭代同一段代码 | 不用 | 需要保持上下文连贯性 |

**记住一个原则**：如果一个任务会"读很多、产出少"——用子代理。如果一个任务需要"基于之前的对话继续"——留在主对话。

## 常见问题

**Q: 子代理能看到我之前的对话吗？**

A: 不能。子代理每次都是全新的上下文窗口，只接收父级发送的那段提示词。这是刻意的设计——独立上下文意味着不受之前对话的误导，但也意味着你需要在提示词中提供足够的信息。

**Q: 我怎么知道 Claude 是否派了子代理？**

A: 你会在终端看到子代理的启动信息，包括它使用的工具调用。最终只有摘要结果出现在你的主对话中。

**Q: 我可以自己定义代理吗？**

A: 可以。在 `agents/` 目录下创建一个 Markdown 文件，按照 YAML 前置元数据的格式定义 name、description、tools、model，然后写上系统提示词。下一节课的 Hooks 和 Rules 会进一步讲解如何定制 Claude Code 的行为。

**Q: 代理和 Skills 有什么区别？**

A: 代理运行在**独立的上下文窗口**中（隔离），技能在**当前上下文**中加载（共享）。代理适合需要独立完成的专业任务；技能适合提供领域知识和方法论指导。

## 下一步

- [1] 进入下一课：Lesson 7.1 - Agent Teams：多 Claude 协作团队
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 7/10 | 上一课: Lesson 6.1 - Skill 深度 | 下一课: Lesson 7.1 - Agent Teams*
