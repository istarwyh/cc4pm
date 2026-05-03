---
number: 24.2
title: "插件架构与 SDK"
short_title: "插件与 SDK"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.2: 插件架构与 Claude Code SDK

> **前置课程**：Lesson 24（高级特性）、Lesson 24.1（MCP 生态）
>
> **预计用时**：20 分钟
>
> **适合人群**：想了解 Claude Code 扩展体系全貌、或需要编程式集成的人

## 学习目标

- 理解 Plugin 与 MCP 的区别和适用场景
- 掌握插件市场、mgrep 语义搜索的使用方法
- 了解 Claude Code SDK 的三种调用方式
- 知道多平台支持的实际含义

## Plugin vs MCP——两种扩展方式

MCP 连接的是外部服务。**插件（Plugin）是一种更高级的打包方式**——它可以同时包含技能、MCP、钩子，甚至 LSP（语言服务器协议），打包成一个可安装的单元。

```
MCP 只做一件事：
  连接外部服务（GitHub、Supabase、Vercel...）

Plugin 可以做很多事：
  ├── 包含技能（工作流定义）
  ├── 包含 MCP（外部集成）
  ├── 包含 Hook（自动化触发）
  └── 包含 LSP（语言智能——类型检查、补全、跳转定义）
```

**选择依据**：

| 你需要什么 | 用什么 | 例子 |
|-----------|--------|------|
| 连接一个外部 API | MCP | GitHub、Supabase、Vercel |
| 一套完整的工作流 | Plugin | hookify（对话式创建 Hook） |
| 语言智能（补全、类型检查） | Plugin（含 LSP） | typescript-lsp、pyright-lsp |
| 搜索增强 | Plugin | mgrep |

## 插件市场与安装

**官方插件仓库**：`https://github.com/anthropics/claude-plugins-official`——这是 Anthropic 维护的唯一官方插件市场，包含内部插件和经过审核的社区插件。

```bash
# 从官方市场安装插件（推荐方式）
/plugin install {plugin-name}@claude-plugins-official

# 或者在交互模式中浏览
/plugin → Discover

# 添加第三方市场
claude plugin marketplace add istarwyh/cc4pm

# 查看已安装的插件
/plugins
```

> **安全提醒**：安装前请确认你信任该插件。Anthropic 不控制第三方插件的内容，也无法保证其行为符合预期。

### 插件来源：内部 vs 外部

| 类型 | 维护者 | 说明 |
|------|--------|------|
| **内部插件** (`/plugins`) | Anthropic 团队 | 质量有保障，跟随 Claude Code 主版本更新 |
| **外部插件** (`/external_plugins`) | 社区/合作伙伴 | 需经质量与安全审核才能进入官方市场 |

> 著名的 `skill-creator` 就在官方仓库里——用 `/plugin install skill-creator@claude-plugins-official` 安装。

### 标准插件结构

每个插件遵循统一的目录规范：

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 插件元数据（必需）
├── .mcp.json            # MCP 服务器配置（可选）
├── commands/            # 斜杠命令（可选）
├── agents/              # 代理定义（可选）
├── skills/              # 技能定义（可选）
└── README.md            # 文档
```

理解这个结构有两个实用价值：
1. **评估插件质量**：看到 `.claude-plugin/plugin.json` 存在，说明遵循了官方规范
2. **自己开发插件**：按这个结构组织你的技能和工具，就能发布到市场

### 值得了解的插件类型

| 插件类型 | 代表 | 说明 |
|---------|------|------|
| **LSP 插件** | `typescript-lsp`、`pyright-lsp` | 给 Claude 提供实时类型检查和代码补全——不需要打开 IDE，Claude 也能获得编辑器级别的代码智能 |
| **搜索插件** | `mgrep` | 比内置 ripgrep 更强的语义搜索——支持本地搜索和网络搜索 |
| **工作流插件** | `hookify` | 用对话方式创建 Hook，不用手写 JSON |
| **文档插件** | `context7` | 查询最新技术文档（也作为 MCP 提供） |

## mgrep——比 grep 更好的搜索

`mgrep` 是一个通过插件市场安装的增强搜索工具，由 [Mixedbread](https://www.mixedbread.ai/) 提供。它比 Claude Code 内置的 ripgrep 搜索更智能：

```bash
# 本地代码搜索（语义理解，不只是文本匹配）
mgrep "处理用户认证的函数"

# 网络搜索（AI 联网搜索最新信息）
mgrep --web "Next.js 15 App Router 最新变化"
```

**安装方式**：

```bash
# 先添加 Mixedbread 市场
claude plugin marketplace add mixedbread-ai/mgrep

# 然后安装
/plugins → 找到 Mixedbread-Grep → 安装
```

**mgrep vs 内置搜索 vs Grep MCP**：

| 工具 | 搜索范围 | 搜索方式 | 适用场景 |
|------|---------|---------|---------|
| 内置 ripgrep | 本地文件 | 文本匹配 | 快速查找文件中的字符串 |
| mgrep | 本地 + 网络 | 语义理解 | "处理认证的函数"这种模糊搜索 |
| Grep MCP | GitHub | 关键词 | 搜索真实项目的代码案例 |

## 插件与上下文窗口的关系

**重要提醒**：和 MCP 一样，每个启用的插件都会占用上下文窗口。

```
经验法则：
  配置 20-30 个插件/MCP → 保存在配置中备用
  同时启用 < 10 个       → 实际工作时只开需要的
  活动工具 < 80 个       → 超过会明显影响 Claude 的表现

管理方式：
  /plugins  → 查看所有插件的启用/禁用状态
  /mcp      → 查看所有 MCP 的启用/禁用状态
```

不需要每个项目都开全部插件。按项目需求选 4-5 个即可。

## 多平台支持

cc4pm 的插件系统可以跨多个 AI 开发工具使用：

| 平台 | 支持度 | 特点 |
|------|--------|------|
| **Claude Code** | 原生（主要平台） | 完整支持所有功能 |
| **Cursor IDE** | 完整支持 | DRY 适配器模式，复用 Hook 脚本 |
| **Codex** | 一等支持 | AGENTS.md + .codex/ 结构 |
| **OpenCode** | 完整支持 | 31+ 命令，11+ Hook 事件 |

**这意味着什么**：你的团队可以同时使用 Claude Code、Cursor、Codex 等不同工具，但共享同一套规则、技能和模式。换工具不用重新配置。这就是"一次配置，处处生效"。

## Claude Code SDK——编程式集成

Claude Code 不只是终端工具——它提供 **SDK**（软件开发工具包），支持 CLI、TypeScript 和 Python 三种方式以编程方式调用。

```
终端版 Claude Code：人类对话式使用
SDK 版 Claude Code：程序自动调用，集成到工作流中
```

### 三种调用方式

**CLI 方式**（最简单）：

```bash
claude -p "分析这个文件的安全性" < src/auth.ts
```

**TypeScript SDK**：

```typescript
import { query } from '@anthropic-ai/claude-code';
const result = await query({
  prompt: "审查以下代码的安全性",
  options: { allowedTools: ["read", "grep"] }
});
```

**Python SDK**：

```python
from anthropic_claude_code import query
result = await query(
    prompt="审查以下代码的安全性",
    options={"allowedTools": ["read", "grep"]}
)
```

### 权限模型

SDK 默认只有只读权限（读文件、搜索）。需要写入能力时，在 `options.allowedTools` 中显式添加 `"edit"`、`"write"` 等工具。

### PM 何时关心 SDK？

当你想让 Hook 中的检查更智能时——比如用 SDK 启动一个独立的 Claude 实例来审查代码变更（Lesson 23 的重复代码预防 Hook 就是这么实现的）。

```
没有 SDK：
  Hook 脚本只能用 grep/regex 做简单的文本检查

有 SDK：
  Hook 脚本启动一个 Claude 实例，用 AI 理解代码语义
  → 能发现"这段逻辑和那边重复了"这种深层问题
```

## 组件统计

| 组件 | 数量 | 说明 |
|------|------|------|
| 代理 | 18 | 专业化的 AI 助手 |
| 技能 | 56+ | 工作流定义和领域知识 |
| 命令 | 40+ | 用户可调用的斜杠命令 |
| 规则 | 9 通用 + 7 语言 × 5 | 共 44 个规则文件 |
| Hook | 21 | 6 个触发点的事件驱动自动化 |
| MCP | 23 | 外部工具集成（command + http 两种类型） |

## 安装方式

```bash
# 方式 1：插件市场（推荐）
/plugin marketplace add istarwyh/cc4pm
/plugin install everything-claude-code@everything-claude-code

# 方式 2：手动安装
git clone https://github.com/istarwyh/cc4pm.git
./install.sh typescript python  # 按需选择语言规则
```

## 🛠️ 实操练习

### 练习 1：探索插件系统

```bash
# 查看插件市场
/plugins

# 安装插件
/plugin marketplace add <plugin-name>
```

**检查清单**：
- [ ] 查看了可用的插件列表
- [ ] 安装了一个感兴趣的插件

### 练习 2：尝试 SDK 调用

```bash
# 用 CLI 方式调用 Claude Code
claude -p "列出当前目录下的所有 TypeScript 文件"
```

**任务**：
1. 用 CLI 方式完成一次简单查询
2. 理解 SDK 的只读权限模型

---

## 常见问题

**Q: Plugin 和 MCP 该选哪个？**

A: 如果你只需要连接一个外部 API，用 MCP（更轻量）。如果你需要一整套工作流（技能 + 钩子 + 工具），用 Plugin。两者可以共存。

**Q: SDK 需要单独安装吗？**

A: CLI 方式不需要，直接用 `claude -p` 即可。TypeScript/Python SDK 需要安装对应的 npm/pip 包：`@anthropic-ai/claude-code` 或 `anthropic-claude-code`。

**Q: 多平台支持意味着我可以在 Cursor 里用 cc4pm 吗？**

A: 是的。cc4pm 的规则、技能和 Hook 脚本可以在 Cursor 中复用，通过 DRY 适配器模式实现。

## 下一步

- [1] 进入下一课：Lesson 24.3 - LLM Wiki
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 24.2/26 | 上一课: Lesson 24.1 - MCP 生态 | 下一课: Lesson 24.3 - LLM Wiki*
