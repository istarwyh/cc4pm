# Lesson 1.1: Claude Code 工作原理——源码级深度解析

## 本课目标

- 理解 Claude Code 从按下回车到渲染回复的 **11 步完整流程**
- 掌握 System Prompt 的动态组装机制
- 了解 50+ 内置工具的分类体系和权限模型
- 认识源码中的隐藏特性和未发布功能
- 建立 "CC 如何工作" 的准确心智模型，指导日常使用

> **资料来源**：本课内容基于两个优秀的社区资源整理：
> - [Claude Code Unpacked](https://ccunpacked.dev/) — 从源码出发的交互式架构解析（by @razakiau）
> - [learn-cc](https://github.com/istarwyh/learn-cc) — Claude Code 源码还原与学习（4756 个源文件的完整还原）

## 核心内容

### 1. 源码概览：Claude Code 的真实规模

Claude Code 不是一个简单的 CLI 脚本。从 npm 包的 source map 中还原出的源码规模：

```
┌───────────────────────────────────────────────────┐
│        Claude Code 源码统计（v2.1.88）              │
├───────────────────────────────────────────────────┤
│  源文件总数          4,756 个                      │
│  核心源码（src/）     1,902 个文件                  │
│  第三方依赖           2,850 个文件                  │
│  Source Map 大小      57 MB                        │
│  语言                TypeScript + TSX（React CLI）  │
│  UI 框架             Ink（React 的终端版）          │
└───────────────────────────────────────────────────┘
```

核心模块分布：

| 模块 | 文件数 | 职责 |
|------|--------|------|
| `utils/` | 564 | 工具函数——文件 I/O、Git 操作、权限检查、Diff 处理 |
| `components/` | 389 | 终端 UI 组件，基于 Ink 构建 |
| `commands/` | 207 | 所有斜杠命令的实现 |
| `tools/` | 184 | Agent 工具实现——Read、Write、Edit、Bash、Glob、Grep 等 |
| `services/` | 130 | 核心服务——API 客户端、认证、配置、会话管理 |
| `hooks/` | 104 | 生命周期钩子——工具执行前后的拦截与权限控制 |
| `ink/` | 96 | 自研 Ink 渲染引擎，含布局、焦点管理、渲染优化 |
| `skills/` | 20 | 技能加载与执行系统 |
| `bridge/` | 31 | IDE 扩展（VS Code/Cursor）与 CLI 的通信桥接 |
| `tasks/` | 12 | 后台任务与定时任务管理 |

> **为什么这很重要？** 理解规模帮你校准预期：CC 是一个成熟的工程系统，不是玩具脚本。它的行为是经过精心设计的，而非随机的。
>
> 完整源码可在 [learn-cc](https://github.com/istarwyh/learn-cc) 仓库的 `claude-code-source/src/` 目录下浏览。

### 2. Agent Loop 的 11 步完整流程

Lesson 1 介绍了简化版的代理循环。现在来看真实的 11 步流程（来自 [ccunpacked.dev](https://ccunpacked.dev/) 的源码分析）：

```
你按下回车
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  ① User Input                                               │
│     TextInput.tsx 捕获键盘输入                                │
│     非交互模式下从 stdin 管道读取                              │
│                                                              │
│  ② Message Construction                                      │
│     将你的文本包装为 Messages API 格式                         │
│     附加图片、文件引用等附件                                   │
│                                                              │
│  ③ History Assembly                                          │
│     拼接完整对话历史                                          │
│     如果超出窗口限制，触发自动压缩（auto-compaction）          │
│                                                              │
│  ④ System Prompt Assembly  ← 关键步骤，详见下节               │
│     动态组装系统提示词                                        │
│     注入环境信息、规则、技能、CLAUDE.md 等                     │
│                                                              │
│  ⑤ API Call                                                  │
│     发送请求到 Anthropic Messages API                         │
│     携带 tools 定义、system prompt、conversation history      │
│                                                              │
│  ⑥ Token Streaming                                           │
│     流式接收响应 tokens                                       │
│     实时渲染到终端                                            │
│                                                              │
│  ⑦ Tool Decision                                             │
│     模型决定：直接回复文本？还是调用工具？                      │
│     如果返回 tool_use block → 进入工具执行流程                 │
│                                                              │
│  ⑧ Tool Execution Loop                                       │
│     执行工具 → 获取结果 → 结果作为 tool_result 送回模型        │
│     模型再次决策：继续调用工具？还是回复用户？                  │
│     ↻ 这个子循环可能重复多次                                   │
│                                                              │
│  ⑨ Render                                                    │
│     Ink 渲染引擎将 Markdown 渲染到终端                        │
│     代码块语法高亮、diff 着色                                  │
│                                                              │
│  ⑩ Hooks                                                     │
│     触发 PostToolUse / Stop 等生命周期钩子                     │
│     钩子可以拦截、修改或阻止操作                               │
│                                                              │
│  ⑪ Await                                                     │
│     等待用户下一次输入                                        │
│     光标闪烁，循环回到 ①                                      │
└─────────────────────────────────────────────────────────────┘
```

**理解这个流程的实际价值**：

- 你知道为什么 `/clear` 有效——它重置了步骤 ③ 的历史
- 你知道为什么 CLAUDE.md 每次都生效——它在步骤 ④ 每次都被注入
- 你知道为什么有时 Claude 会"忘记"——步骤 ③ 的自动压缩丢弃了早期信息
- 你知道为什么工具调用需要权限——步骤 ⑧ 前有 PreToolUse 钩子拦截

### 3. System Prompt 的动态组装

步骤 ④ 是理解 CC 行为的关键。每次你发送消息，CC 都会**重新组装**一个完整的 System Prompt：

```
┌─────────────────────────────────────────────────┐
│            System Prompt 组装顺序                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. 核心身份                                     │
│     "You are Claude Code, Anthropic's            │
│      official CLI for Claude..."                 │
│     身份定义、安全边界、行为准则                   │
│                                                  │
│  2. 工具定义                                     │
│     所有可用工具的 JSON Schema                    │
│     每个工具的使用说明和参数规范                   │
│                                                  │
│  3. 环境信息                                     │
│     当前工作目录、操作系统、Shell 类型             │
│     Git 仓库状态、当前分支                        │
│     模型名称、日期时间                            │
│                                                  │
│  4. CLAUDE.md 文件                               │
│     ~/.claude/CLAUDE.md（全局）                   │
│     .claude/CLAUDE.md（项目级）                   │
│     当前目录的 CLAUDE.md（如果存在）              │
│     → 三层合并，项目级优先                        │
│                                                  │
│  5. Rules（规则文件）                             │
│     .claude/rules/ 下的所有 .md 文件              │
│     每次对话自动加载，无需手动触发                 │
│                                                  │
│  6. Memory                                       │
│     MEMORY.md 索引文件（自动加载）                │
│     具体记忆文件按需引用                          │
│                                                  │
│  7. Skills / Commands（按需加载）                 │
│     只有被触发的 Skill 才注入上下文                │
│     通过 system-reminder 标签动态追加              │
│                                                  │
│  8. Git Status 快照                              │
│     会话开始时的 git status                       │
│     帮助 Claude 了解当前仓库状态                  │
│                                                  │
│  9. Hooks 配置                                   │
│     已注册的钩子列表                              │
│     告诉 Claude 哪些自动化行为已启用              │
│                                                  │
└─────────────────────────────────────────────────┘
```

**为什么理解这个很重要**：

- **CLAUDE.md 是"每轮都重新注入"的**——所以修改它立即生效，不需要重启
- **Rules 是"静默加载"的**——你看不到加载过程，但它们每轮都在影响 Claude 的行为
- **Skills 是"按需注入"的**——只有你触发 `/xxx` 时才占用上下文空间
- **System Prompt 本身也消耗 tokens**——这就是为什么安装太多 Rules 会挤占你的可用上下文

### 4. 工具系统全景：50+ 内置工具

CC 的工具远不止 Lesson 1 介绍的 7 个基础工具。完整工具清单按功能分为 8 大类：

| 类别 | 工具数 | 代表工具 | 说明 |
|------|--------|---------|------|
| **文件操作** | 6 | Read, Edit, Write, Glob, Grep, NotebookEdit | 你最常接触的工具 |
| **执行** | 3 | Bash, PowerShell, REPL | 运行命令和代码 |
| **搜索与网络** | 4 | WebFetch, WebSearch, ToolSearch, WebBrowser🔒 | 获取外部信息 |
| **代理与任务** | 11 | Agent, SendMessage, TaskCreate/Get/List/Update/Stop/Output, TeamCreate/Delete, ListPeers🔒 | 多代理协作 |
| **规划** | 5 | EnterPlanMode, ExitPlanMode, EnterWorktree, ExitWorktree, VerifyPlanExecution🔒 | 计划与隔离 |
| **MCP** | 4 | mcp, ListMcpResources, ReadMcpResource, McpAuth | 外部工具集成 |
| **系统** | 11 | AskUserQuestion, TodoWrite, Skill, Config, RemoteTrigger🔒, CronCreate🔒, Snip🔒 等 | 内部控制 |
| **实验性** | 8 | Sleep, SendUserMessage, LSP🔒, PushNotification🔒, Monitor🔒 等 | 未正式发布 |

> 🔒 标记的工具是**功能门控**（feature-gated）的，需要特定的 feature flag 才能启用。

**工具执行的权限模型**：

```
用户发指令 → 模型决定调用工具 → 权限检查
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              自动允许          需要确认          被阻止
           （allowedTools     （默认行为，       （被 Hooks
            配置中的工具）      弹出确认框）       或权限拒绝）
                    │               │
                    ▼               ▼
               直接执行       用户按 Y 允许
                                    │
                                    ▼
                              执行工具
                                    │
                                    ▼
                          PostToolUse 钩子
                          （可选的后处理）
```

### 5. 命令系统全景：95+ 斜杠命令

CC 内置的斜杠命令远比文档展示的多。按功能分为 5 大类：

| 类别 | 数量 | 代表命令 |
|------|------|---------|
| **设置与配置** | 12 | `/init`, `/login`, `/config`, `/permissions`, `/model`, `/mcp`, `/hooks` |
| **日常工作流** | 24 | `/compact`, `/memory`, `/plan`, `/resume`, `/clear`, `/vim`, `/skills`, `/tasks` |
| **代码审查与 Git** | 13 | `/review`, `/commit`, `/diff`, `/pr_comments`, `/branch`, `/security-review` |
| **调试与诊断** | 23 | `/status`, `/stats`, `/cost`, `/version`, `/rewind`, `/debug-tool-call` |
| **高级与实验** | 23 | `/advisor`, `/ultraplan`🔒, `/voice`🔒, `/desktop`🔒, `/chrome`🔒, `/teleport` |

### 6. 隐藏特性：源码中的未发布功能

ccunpacked.dev 从源码中发现了多个未正式发布的功能：

| 特性 | 状态 | 说明 |
|------|------|------|
| **Buddy** | 隐藏 | 终端里的虚拟宠物。种类和稀有度由你的账号 ID 决定 |
| **Kairos** | 隐藏 | 持久化模式——跨会话记忆整合，后台自主行动 |
| **UltraPlan** | 功能门控 | 在 Opus 级模型上的长时间规划，最长 30 分钟执行窗口 |
| **Coordinator Mode** | 隐藏 | 主代理拆解任务 → 在隔离的 git worktree 中并行执行 → 收集结果 |
| **Bridge** | 隐藏 | 从手机或浏览器远程控制 Claude Code，支持远程权限审批 |
| **Daemon Mode** | 隐藏 | 后台运行会话（`--bg`），底层使用 tmux |
| **UDS Inbox** | 隐藏 | 会话之间通过 Unix Domain Socket 通信 |
| **Auto-Dream** | 隐藏 | 会话间隙 AI 自动回顾发生了什么，整理学到的知识 |

> **注意**：这些功能随时可能变化、重命名或移除。了解它们的价值在于理解 CC 的设计方向——它正在从"单次对话工具"演进为"持久化的 AI 开发伙伴"。

### 7. 源码学习入口

如果你想更深入地理解 CC 的实现，以下是推荐的入口文件：

| 想了解的内容 | 源码入口 | 说明 |
|-------------|---------|------|
| 应用启动流程 | `src/main.tsx` | 整个应用的入口点 |
| Agent Loop 主循环 | `src/QueryEngine.ts` | 查询引擎——核心循环逻辑 |
| 工具基类 | `src/Tool.ts` | 所有工具的抽象基类 |
| 工具注册 | `src/tools.ts` | 工具注册和发现机制 |
| 命令注册 | `src/commands.ts` | 斜杠命令注册 |
| 任务管理 | `src/Task.ts` | 后台任务生命周期 |
| 子代理系统 | `src/buddy/` | 子代理的创建和管理 |
| 权限控制 | `src/moreright/` | 权限检查和授权逻辑 |
| 上下文管理 | `src/context/` | 上下文窗口管理 |
| 会话历史 | `src/assistant/` | 对话历史的存储和检索 |

> 完整源码仓库：[github.com/istarwyh/learn-cc](https://github.com/istarwyh/learn-cc)
>
> 在 `claude-code-source/src/` 目录下可以浏览所有 TypeScript 源文件。

## 常见问题

**Q: 为什么有时候 Claude 的回答和我的 CLAUDE.md 指令不一致？**

A: System Prompt 的优先级是有层次的。如果 Claude 的核心安全准则与你的 CLAUDE.md 冲突，核心准则优先。另外，当上下文接近上限时，自动压缩可能丢弃 CLAUDE.md 中的部分内容。保持 CLAUDE.md 简洁、重点突出是最佳实践。

**Q: 功能门控的工具和隐藏功能怎么才能用？**

A: 大部分需要特定的 feature flag（通常是服务端控制的）或环境变量。它们处于内部测试阶段，不建议在生产工作流中依赖。了解它们主要是为了理解 CC 的演进方向。

**Q: 知道源码结构对日常使用有什么帮助？**

A: 三个实际好处：(1) 当 CC 行为不符合预期时，你能推理出"为什么"而不是瞎猜；(2) 你能更精准地编写 CLAUDE.md 和 Hooks，因为你知道它们在流程中的位置；(3) 你能更好地做成本控制——理解哪些操作消耗 tokens，哪些不消耗。

## 下一步

- [1] 进入下一课：Lesson 2 - 上下文窗口：你最重要的资源
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 1.1/26 | 上一课: Lesson 1 - cc4pm 全景 | 下一课: Lesson 2 - 上下文窗口*
