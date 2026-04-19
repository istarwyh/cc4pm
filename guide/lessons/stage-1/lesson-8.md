# Lesson 8: Hooks 与 Rules：自动化守护

## 本课目标

- 理解 Hooks 和 Rules 的本质区别，以及它们各自解决什么问题
- 掌握 Hook 的五种事件类型和退出码机制
- 了解 cc4pm 预置的完整 Hooks 体系
- 理解 Rules 的组织方式和加载机制
- 学会让 Claude 帮你编写自定义 Hooks

## 核心内容

### Hooks vs CLAUDE.md 指令——确定性 vs 建议性

这是本课最重要的认知：

| | CLAUDE.md / Rules | Hooks |
|--|-------------------|-------|
| **本质** | 建议性指令 | 确定性脚本 |
| **执行保证** | Claude **应该**遵守（但偶尔可能忽略） | **一定**会执行（零例外） |
| **执行者** | Claude AI（解读并遵循） | 操作系统（直接运行脚本） |
| **适合放** | 编码风格、设计原则、最佳实践 | 安全检查、格式化、日志记录 |
| **类比** | 公司文化手册——大家应该遵守 | 门禁系统——没有卡进不了门 |

**为什么这个区别重要？**

假设你有一条规则："不要在代码中留下 console.log"。

- 写在 CLAUDE.md 中：Claude **通常**会遵守，但忙起来可能漏掉
- 写成 Hook：每次编辑文件后**自动**检测 console.log，发现就提醒——100% 不会漏

**原则：对于必须保证执行的事情，用 Hook；对于指导性的建议，用 Rules/CLAUDE.md。**

### 实战示例：阻止读取 .env 文件

这是 Hook 最经典的用例——**阻止 Claude 读取包含敏感信息的 .env 文件**：

```javascript
// hooks/read_hook.js — PreToolUse Hook
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 检查 read 或 grep 工具是否试图访问 .env
if (data.tool_input?.file_path?.includes('.env') ||
    data.tool_input?.path?.includes('.env')) {
  console.error('🚫 禁止访问 .env 文件——包含敏感凭证');
  process.exit(2);  // Exit 2 = 阻止操作
}

process.exit(0);  // 其他文件正常放行
```

配置（在 `settings.local.json` 中）：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "read|grep",
      "hooks": [{
        "type": "command",
        "command": "node ./hooks/read_hook.js"
      }]
    }]
  }
}
```

**关键点**：
- Hook 通过 stdin 接收 JSON（包含 tool_name 和 tool_input）
- `console.error()` 的输出会反馈给 Claude，让它知道为什么被阻止
- 修改 Hook 后需要**重启 Claude**才能生效

### Hook 事件类型

Hooks 在 Claude 工作流的不同节点自动触发：

```
┌─────────────────────────────────────────────────┐
│            Claude Code 工作流中的 Hook 节点       │
│                                                  │
│  SessionStart ──→ 会话开始时触发                  │
│       │           加载上下文、检测环境              │
│       ▼                                          │
│  UserPromptSubmit ──→ 用户提交提示词前触发         │
│       │                可以修改或过滤用户输入       │
│       ▼                                          │
│  PreToolUse ──→ 工具执行前触发                    │
│       │          可以允许、警告、或阻止操作         │
│       ▼                                          │
│  [工具执行]                                       │
│       │                                          │
│       ▼                                          │
│  PostToolUse ──→ 工具执行后触发                   │
│       │           自动格式化、类型检查、日志        │
│       ▼                                          │
│  Stop ──→ Claude 回复完成后触发                   │
│            持久化状态、检查遗留问题                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

五种事件类型详解：

| 事件 | 触发时机 | 典型用途 |
|------|---------|---------|
| **SessionStart** | 新会话开始 | 加载上次的工作上下文、检测包管理器 |
| **UserPromptSubmit** | 用户提交提示词前 | 过滤敏感信息、添加上下文 |
| **PreToolUse** | 工具（Read/Write/Bash等）执行前 | 安全检查、权限控制、提醒 |
| **PostToolUse** | 工具执行后 | 自动格式化、类型检查、质量门禁 |
| **Stop** | Claude 完成一次回复后 | 持久化会话状态、检查遗留问题 |

### PreToolUse 的退出码——三种控制方式

PreToolUse 是最强大的 Hook 类型，因为它可以**阻止操作发生**：

```
┌──────────────────────────────────────────┐
│         PreToolUse 退出码                 │
│                                          │
│  Exit 0  → ✅ 允许操作（静默通过）         │
│                                          │
│  Exit 1  → ⚠️  警告但允许                │
│             Claude 会看到警告信息          │
│             操作照常执行                   │
│                                          │
│  Exit 2  → 🚫 阻止操作                   │
│             操作不会执行                   │
│             用于安全强制执行               │
│                                          │
└──────────────────────────────────────────┘
```

**实际场景举例**：

```
Exit 0 的场景：文件不在受保护目录 → 静默放行
Exit 1 的场景：检测到 git push → 提醒"确认你已经审查过改动"
Exit 2 的场景：试图写入 migrations/ 目录 → 直接阻止
```

### 演示案例：解读 cc4pm 的 hooks.json

cc4pm 预置了一套完整的自动化守护体系。让我们深入看看：

```bash
cd cc4pm
claude

"读一下 hooks/hooks.json，告诉我 cc4pm 设置了哪些自动化守护：
 - 有哪些 PreToolUse hooks？它们防止什么？
 - 有哪些 PostToolUse hooks？它们自动做什么？
 - 有哪些 SessionStart 和 Stop hooks？"
```

**cc4pm 的 Hook 全景**：

#### PreToolUse Hooks（操作前守护）

| Hook | 匹配工具 | 作用 |
|------|---------|------|
| auto-tmux-dev | Bash | 自动在 tmux 中启动开发服务器 |
| tmux-reminder | Bash | 提醒长时间运行的命令应该用 tmux |
| git-push-reminder | Bash | git push 前提醒审查变更 |
| doc-file-warning | Write | 警告创建非标准的文档文件 |
| suggest-compact | Edit/Write | 在逻辑间隔建议手动压缩上下文 |
| observe (async) | 所有工具 | 捕获工具使用记录用于持续学习 |
| insaits-security | Bash/Write/Edit | AI 安全监控（可选启用） |

#### PostToolUse Hooks（操作后自动化）

| Hook | 匹配工具 | 作用 |
|------|---------|------|
| pr-created | Bash | PR 创建后记录 URL 并提供审查命令 |
| build-complete (async) | Bash | 构建完成后的异步分析 |
| quality-gate (async) | Edit/Write | 文件编辑后运行质量门禁检查 |
| post-edit-format | Edit | JS/TS 文件编辑后自动格式化（Biome/Prettier） |
| post-edit-typecheck | Edit | TypeScript 文件编辑后自动类型检查 |
| post-edit-console-warn | Edit | 编辑后检测 console.log 并警告 |
| observe (async) | 所有工具 | 捕获工具执行结果用于持续学习 |

#### SessionStart Hooks

| Hook | 作用 |
|------|------|
| session-start | 加载上次会话上下文、检测包管理器 |

#### Stop Hooks（回复完成后）

| Hook | 作用 |
|------|------|
| check-console-log | 检查修改过的文件中是否有 console.log |
| session-end | 持久化当前会话状态 |
| evaluate-session | 评估会话中是否有可提取的经验模式 |
| cost-tracker | 追踪 token 消耗和成本指标 |

**注意 `async: true` 的标记**——这些 Hook 在后台异步运行，不阻塞 Claude 的响应。适合耗时但非阻塞的任务（如构建分析、持续学习记录）。

> **深入学习**：本课介绍了 Hook 和 Rule 的基本概念。在 **Lesson 23（阶段 4）**中，你将深入了解 cc4pm 全部 21 个 Hook 的真实运行逻辑——包括 `run-with-flags.js` 条件执行框架、Hook Profile 环境变量（`minimal/standard/strict`）、Quality Gate 质量门禁的完整检测流水线，以及 44 个 Rules 文件的语言专用规则（TypeScript/Python/Go/Swift/Kotlin/PHP/Perl 各 5 个文件的特定工具链）。

### 记忆持久化 Hooks

除了代码质量守护，Hooks 还有一个重要用途——**跨会话记忆持久化**。大多数人不知道这些 Hook 组合：

| Hook 类型 | 用途 | 触发时机 |
|-----------|------|---------|
| **PreCompact** | 压缩前保存重要状态到文件 | 上下文压缩即将发生时 |
| **Stop（会话结束）** | 将学习成果持久化到文件 | Claude 完成最后一次回复时 |
| **SessionStart** | 自动加载之前保存的上下文 | 新会话开始时 |

三个 Hook 形成闭环：Stop 保存 → SessionStart 加载 → PreCompact 防丢失。这样即使跨会话，Claude 也能"记住"关键决策和进展。

> 这些 Hook 的完整实现见 cc4pm 的 `hooks/` 目录。关键设计：用 **Stop** 而非 UserPromptSubmit 做持久化——UserPromptSubmit 每条消息都触发（增加延迟），Stop 只在会话结束时运行一次。

### Rules 系统

Rules 是另一层自动化——它们不是脚本，而是**每次对话都自动加载的指导方针**。

#### Rules 的组织结构

```
rules/
├── common/                  # 通用规则（所有语言/项目都适用）
│   ├── agents.md           # 代理使用规范
│   ├── coding-style.md     # 编码风格
│   ├── development-workflow.md  # 开发流程
│   ├── git-workflow.md     # Git 提交规范
│   ├── hooks.md            # Hook 编写规范
│   ├── patterns.md         # 代码模式和设计原则
│   ├── performance.md      # 性能最佳实践
│   ├── security.md         # 安全规则
│   └── testing.md          # 测试规范
├── typescript/             # TypeScript 专用规则
├── python/                 # Python 专用规则
├── golang/                 # Go 专用规则
├── kotlin/                 # Kotlin 专用规则
├── swift/                  # Swift 专用规则
├── php/                    # PHP 专用规则
└── perl/                   # Perl 专用规则
```

#### Rules vs CLAUDE.md

| | Rules（`.claude/rules/`） | CLAUDE.md |
|--|--------------------------|-----------|
| **存放位置** | `.claude/rules/` 或 `~/.claude/rules/` | 项目根目录 |
| **加载方式** | 每个文件自动加载 | 整个文件加载 |
| **组织方式** | 模块化，一个文件一个主题 | 一个文件包含所有内容 |
| **适合内容** | 可复用的规则（跨项目） | 项目特定的指令 |
| **版本控制** | 可以按分支不同 | 通常整个项目统一 |

**推荐实践**：
- 通用的编码规范 → 放在 `~/.claude/rules/`（全局生效）
- 项目特定的约定 → 放在 CLAUDE.md 或 `.claude/rules/`

### 演示案例：浏览 cc4pm 的 Rules

```bash
cd cc4pm
claude

"列出 rules/ 目录的结构，以及 rules/common/ 下每个规则文件的核心内容（每个文件用一句话概括）"
```

**预期输出**：

| 规则文件 | 核心内容 |
|---------|---------|
| agents.md | 代理的选择和调用规范，何时用子代理 |
| coding-style.md | 命名约定、文件组织、代码格式要求 |
| development-workflow.md | 探索→规划→执行的开发流程规范 |
| git-workflow.md | 提交消息格式、分支命名、PR 流程 |
| hooks.md | Hook 的编写规范和最佳实践 |
| patterns.md | 常用设计模式和代码组织原则 |
| performance.md | 性能优化的基本准则 |
| security.md | 安全编码的强制规则（输入验证、密钥管理等） |
| testing.md | 测试覆盖率要求、测试编写规范 |

### Claude 可以帮你写 Hooks

你不需要自己从零写 Hook 脚本——Claude 本身就是最好的 Hook 编写助手。

```bash
claude

# 示例 1：自动格式化
"帮我写一个 PostToolUse hook，在每次编辑 .py 文件后自动运行 black 格式化"

# 示例 2：安全防护
"帮我写一个 PreToolUse hook，阻止对 migrations/ 目录的任何写入操作，
 退出码用 2（直接阻止），并输出警告信息'请勿直接修改 migration 文件'"

# 示例 3：提醒机制
"帮我写一个 PreToolUse hook，在 git push 之前检查是否有未提交的测试文件，
 如果有就返回退出码 1 警告"
```

### 实操演示：macOS 任务完成通知

这是一个可以立刻体验的 Hook——每次 Claude 完成回复后，Mac 系统弹出通知提醒你。

#### 效果

```
Claude 完成一次回复
  ↓
Stop Hook 触发
  ↓
macOS 弹出系统通知 🔔
  "Claude Code 任务完成"
  ↓
你去泡咖啡也不怕错过！
```

#### 操作步骤

直接让 Claude 帮你配置：

```bash
claude

"帮我在 settings.json 中添加一个 Stop hook：
 每次 Claude 回复完成后，用 osascript 发送 macOS 系统通知，
 标题是 'Claude Code'，内容是 '✅ 任务已完成，回来看看结果吧'"
```

Claude 会在 `.claude/settings.json`（或 `~/.claude/settings.json`）中添加类似这样的配置：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"✅ 任务已完成，回来看看结果吧\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

配置完成后，每次 Claude 完成回复，你的 Mac 右上角都会弹出通知。特别适合让 Claude 跑长任务时——你可以切到其他窗口工作，不用一直盯着终端。

> 这就是 Hooks 的魅力：**零代码基础**，让 Claude 帮你写，一句话搞定自动化。

### 动手试试

**练习 1：阅读 cc4pm 的 hooks.json**

```bash
cd cc4pm
claude

"读取 hooks/hooks.json，告诉我：
 1. 哪些 hook 是异步的（async: true）？为什么它们适合异步？
 2. 哪些 hook 使用了 timeout？各自超时多长时间？
 3. 如果我想添加一个新的 PostToolUse hook，应该怎么做？"
```

**练习 2：阅读一条 Rule**

```bash
"读取 rules/common/security.md，总结 cc4pm 对安全编码有哪些强制要求"
```

**练习 3：设计一个 Hook（思考练习）**

想一想你的日常工作中，有哪些事情是"必须每次都做但经常忘记"的？比如：

- 提交代码前检查是否有 TODO 注释
- 编辑配置文件后验证格式是否正确
- 写入日志文件后检查是否包含敏感信息

把你想到的场景告诉 Claude，让它帮你设计 Hook 方案。

## 常见问题

**Q: Hooks 会拖慢 Claude 的速度吗？**

A: 同步 Hook 会增加一点延迟（通常毫秒级），但确保了质量。异步 Hook（`async: true`）在后台运行，完全不阻塞 Claude 的响应。cc4pm 把耗时的 Hook（如构建分析、持续学习）都设为异步。

**Q: Hook 脚本报错了怎么办？**

A: Hook 脚本报错不会导致 Claude 崩溃。PreToolUse Hook 报错时默认允许操作继续（安全降级）。你可以在终端看到错误信息进行排查。

**Q: 我需要会写 Node.js 才能用 Hooks 吗？**

A: 不需要。cc4pm 的 Hook 已经预置好了，直接使用即可。如果你想自定义，可以让 Claude 帮你写——告诉它你想要什么效果，它会生成完整的 Hook 脚本。

**Q: Rules 太多会影响性能吗？**

A: 会。Rules 每次对话都加载，占用上下文窗口空间。官方建议：如果删掉某条 Rule 后 Claude 照样能做对，就删掉它。只保留 Claude 确实需要被提醒的规则。

## 下一步

- [1] 进入下一课：Lesson 9 - 环境搭建：安装与验证
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 8/26 (阶段内 8/10) | 上一课: Lesson 7.1 - Agent Teams | 下一课: Lesson 9 - 环境搭建*
