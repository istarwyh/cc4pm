# Lesson 23: 自动化工作流：Hooks、Rules 和质量门禁

## 本课目标

- 理解 Hooks 系统如何在开发过程中自动执行质量检查
- 掌握 Rules（规则）系统的分层架构和核心规则
- 学会质量门禁（Quality Gate）的工作原理
- 理解"不需要人记住的事，就让系统自动做"的自动化思想

## 核心内容

### 为什么需要自动化？

你在 Lesson 22 学了 /tdd、/code-review、/e2e——这些都需要开发者**主动执行**。但人会忘记、会偷懒、会赶工期跳过。

**自动化的目的**：把"应该做但容易忘"的事变成"系统自动做"。

> **基础回顾**：如果你对 Hook 的基本概念（事件类型、退出码、同步 vs 异步）不太熟悉，建议先回顾 **Lesson 8（阶段 1）Hooks 与 Rules：自动化守护**。本课将在那个基础上展开 cc4pm 全部 21 个 Hook 的完整细节。

```
手动方式：
  开发者写完代码 → 忘了格式化 → 忘了类型检查 → 忘了跑测试
  → 提交了有问题的代码 → 上线后发现 → 紧急修复

自动化方式：
  开发者写完代码 → 系统自动格式化 → 自动类型检查 → 自动跑质量门禁
  → 发现问题立刻告警 → 开发者当场修复 → 从不提交有问题的代码
```

### Hooks 系统——事件驱动的自动化

Hooks（钩子）是 cc4pm 的核心自动化机制。它在特定事件发生时自动执行预设操作。

#### Hook 的 6 个触发时机

cc4pm 实际配置了 **21 个 Hook**，分布在 6 个触发点。以下是你机器上 `hooks/hooks.json` 的真实配置：

```
SessionStart（会话开始时）— 1 个 Hook
  ↓ session-start.js：加载上次会话状态、检测包管理器、报告可用技能

PreToolUse（工具执行前）— 7 个 Hook
  ↓ auto-tmux-dev.js：拦截 dev server 命令，自动转到 tmux 运行
  ↓ pre-bash-tmux-reminder.js：长时间命令提醒用 tmux
  ↓ pre-bash-git-push-reminder.js：git push 前提醒先 review
  ↓ doc-file-warning.js：创建非标准文档时警告
  ↓ suggest-compact.js：每 50 次工具调用建议手动压缩上下文
  ↓ observe.sh：持续学习观察器（异步，10s 超时）
  ↓ insaits-security-wrapper.js：AI 安全监控（需 ECC_ENABLE_INSAITS=1）

PreCompact（上下文压缩前）— 1 个 Hook
  ↓ pre-compact.js：压缩前保存状态快照

PostToolUse（工具执行后）— 7 个 Hook
  ↓ post-bash-pr-created.js：检测 gh pr create，记录 PR URL
  ↓ post-bash-build-complete.js：构建完成后异步分析（30s 超时）
  ↓ quality-gate.js：编辑文件后运行质量门禁（异步，30s）
  ↓ post-edit-format.js：自动检测 Biome/Prettier 格式化 JS/TS
  ↓ post-edit-typecheck.js：编辑 .ts/.tsx 后自动运行 tsc 类型检查
  ↓ post-edit-console-warn.js：编辑后检测 console.log 并警告
  ↓ observe.sh：持续学习结果采集（异步，10s 超时）

Stop（每次 AI 回复后）— 4 个 Hook
  ↓ check-console-log.js：检查所有修改文件的 console.log
  ↓ session-end.js：持久化会话状态（异步，10s）
  ↓ evaluate-session.js：评估会话是否有可提取的模式（异步）
  ↓ cost-tracker.js：记录 Token 用量和成本到 ~/.claude/metrics/（异步）

SessionEnd（会话结束时）— 1 个 Hook
  ↓ session-end-marker.js：会话结束标记（非阻塞）
```

#### 实际运行的 Hooks（完整清单）

以下是 cc4pm 真实部署的全部 21 个 Hook：

| Hook 脚本 | 触发时机 | 做什么 | 说明 |
|-----------|---------|--------|-------------|
| session-start.js | SessionStart | 加载上次会话、检测包管理器(npm/pnpm/yarn/bun)、列出已学技能 | 新会话自动恢复之前的工作状态 |
| auto-tmux-dev.js | PreToolUse | 拦截 `npm run dev` 等命令，自动在 tmux 中启动 | 开发服务器不会因关窗口而停止 |
| pre-bash-tmux-reminder.js | PreToolUse | npm install/pytest/docker 等长命令建议用 tmux | 长任务不会阻塞 AI 对话 |
| pre-bash-git-push-reminder.js | PreToolUse | git push 前提醒先 review | 确保代码审查不被跳过 |
| doc-file-warning.js | PreToolUse | 创建非标准 .md 文件时警告（允许 README/CLAUDE/AGENTS 等） | 文档不会乱放 |
| suggest-compact.js | PreToolUse | 每 50 次工具调用建议压缩上下文 | 长会话不会因上下文溢出而降质 |
| observe.sh | PreToolUse | 持续学习观察器，采集工具使用数据 | AI 在后台积累经验 |
| insaits-security-wrapper.js | PreToolUse | AI 安全监控：检测凭证泄露、提示注入、行为异常（23 种异常类型） | 需开启 `ECC_ENABLE_INSAITS=1` |
| pre-compact.js | PreCompact | 上下文压缩前保存当前状态快照 | 压缩不会丢失关键信息 |
| post-bash-pr-created.js | PostToolUse | 检测 `gh pr create`，提取 PR URL，提供 review 命令 | PR 创建后自动给你 review 链接 |
| post-bash-build-complete.js | PostToolUse | 构建完成后异步分析构建结果 | 构建状态自动报告 |
| quality-gate.js | PostToolUse | 编辑文件后：Biome/Prettier 格式化 + gofmt + ruff | 代码质量有底线保障 |
| post-edit-format.js | PostToolUse | 编辑 JS/TS 后自动检测并运行 Biome 或 Prettier | 代码风格始终一致 |
| post-edit-typecheck.js | PostToolUse | 编辑 .ts/.tsx 后自动找 tsconfig 并运行 tsc | 类型错误当场发现 |
| post-edit-console-warn.js | PostToolUse | 编辑后检查新增的 console.log 并显示行号 | 调试代码不会溜进生产 |
| observe.sh (post) | PostToolUse | 持续学习结果采集 | AI 在后台学习什么操作有效 |
| check-console-log.js | Stop | 检查所有被修改文件中的 console.log | 每次回复后二次确认 |
| session-end.js | Stop | 提取会话摘要（任务、文件、工具），保存到 ~/.claude/sessions/ | 工作进度永不丢失 |
| evaluate-session.js | Stop | 评估会话是否有可提取的经验模式（>10 条消息才触发） | 自动发现值得记住的经验 |
| cost-tracker.js | Stop | 按模型记录 Token 用量和成本到 ~/.claude/metrics/costs.jsonl | 可追踪 AI 使用成本 |
| session-end-marker.js | SessionEnd | 会话结束生命周期标记 | 系统内部用，无需关注 |

**同步 vs 异步**：大部分 Hook 是同步执行的（等结果再继续），但 `quality-gate`、`observe.sh`、`session-end`、`evaluate-session`、`cost-tracker` 标记为异步——在后台运行，不阻塞你的工作。

#### Hook 的配置方式

Hooks 在 `hooks/hooks.json` 中配置。以下是项目中 `post-edit-format` 的真实配置：

```json
{
  "matcher": "Edit",
  "hooks": [
    {
      "type": "command",
      "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/run-with-flags.js\" \"post:edit:format\" \"scripts/hooks/post-edit-format.js\" \"standard,strict\""
    }
  ],
  "description": "Auto-format JS/TS files after edits (auto-detects Biome or Prettier)"
}
```

**关键设计**：
- `run-with-flags.js` 是一个**条件执行框架**——根据 `ECC_HOOK_PROFILE` 决定是否运行
- `"standard,strict"` 表示这个 Hook 在 standard 和 strict 模式下才生效，minimal 模式下跳过
- 脚本会自动检测项目用 Biome 还是 Prettier，优先使用本地 `node_modules/.bin/` 中的版本

**异步 Hook 的真实配置**（不阻塞 AI）：

```json
{
  "matcher": "Edit|Write|MultiEdit",
  "hooks": [
    {
      "type": "command",
      "command": "node ... quality-gate.js ...",
      "async": true,
      "timeout": 30
    }
  ],
  "description": "Run quality gate checks after file edits"
}
```

**matcher 语法**：
```
"Bash"                    # 精确匹配 Bash 工具
"Edit|Write|MultiEdit"    # 匹配多个工具（OR）
"Bash|Write|Edit|MultiEdit"  # InsAIts 安全监控匹配的 4 种工具
"*"                       # 匹配所有工具（observe.sh 用这个）
```

#### Hook 退出码的含义

```
exit 0  → 通过（警告类 Hook 也用 0，只提醒不阻止）
exit 2  → 阻止操作（工具不会执行！）
其他    → 错误（记录日志，继续执行）
```

**真实例子**：`insaits-security-wrapper.js` 检测到凭证泄露时返回 `exit 2`，直接阻止代码写入。`doc-file-warning.js` 发现非标准文档时返回 `exit 0`——只警告，不阻止。

#### Hook Profile 环境变量

```
ECC_HOOK_PROFILE=minimal    → 只运行 session-start/end（4 个 Hook）
ECC_HOOK_PROFILE=standard   → 运行大部分 Hook（默认，17 个）
ECC_HOOK_PROFILE=strict     → 运行全部 Hook（21 个）

ECC_DISABLED_HOOKS=post:edit:format,stop:cost-tracker
  → 单独禁用指定的 Hook

ECC_ENABLE_INSAITS=1
  → 启用 AI 安全监控（需要 pip install insa-its）
```

### Rules 系统——永远生效的代码标准

Rules（规则）是 cc4pm 的另一个核心机制。和 Hooks 不同，Rules 不是事件触发的，而是**始终生效**的——AI 代理在写代码时会自动遵循这些规则。

#### 分层架构

cc4pm 的规则系统包含 **通用规则（9 个文件）** 和 **7 种语言专用规则**（每种 5 个文件），共 44 个规则文件：

```
rules/
├── common/                    ← 通用规则（所有项目，9 个文件）
│   ├── coding-style.md        ← 编码风格：不可变优先、800行上限
│   ├── security.md            ← 安全标准：OWASP 8 项清单
│   ├── testing.md             ← 测试要求：80% 覆盖率 + TDD
│   ├── git-workflow.md        ← Git 工作流：feat/fix/docs 前缀
│   ├── performance.md         ← 性能优化：模型选择策略
│   ├── patterns.md            ← 设计模式：Repository + API Response
│   ├── hooks.md               ← Hook 使用规范
│   ├── development-workflow.md ← 开发全流程：Research→Plan→TDD→Review
│   └── agents.md              ← 代理使用指南：何时用哪个代理
│
├── typescript/                ← TypeScript 专用（5 个文件）
│   ├── coding-style.md        ← 类型推断、Zod 验证、禁 any
│   ├── testing.md             ← Playwright E2E
│   ├── patterns.md            ← ApiResponse<T>、Custom Hooks
│   ├── hooks.md               ← Prettier + tsc + console.log
│   └── security.md            ← process.env 验证
│
├── python/                    ← Python 专用
│   ├── coding-style.md        ← PEP 8、frozen dataclass、black+ruff
│   ├── testing.md             ← pytest + Devel::Cover 80%
│   ├── patterns.md            ← Protocol、Context Manager
│   ├── hooks.md               ← black/ruff + mypy 类型检查
│   └── security.md            ← bandit 安全扫描
│
├── golang/                    ← Go 专用
│   ├── coding-style.md        ← gofmt、accept interface/return struct
│   ├── testing.md             ← table-driven tests + race detection
│   ├── patterns.md            ← Functional Options、小接口
│   ├── hooks.md               ← gofmt + go vet + staticcheck
│   └── security.md            ← gosec + context.Context
│
├── swift/                     ← Swift 专用
│   ├── coding-style.md        ← Swift 6 concurrency、Sendable
│   ├── testing.md             ← Swift Testing framework
│   ├── patterns.md            ← Protocol-Oriented + Actor Pattern
│   ├── hooks.md               ← SwiftFormat + SwiftLint
│   └── security.md            ← Keychain Services（禁 UserDefaults）
│
├── kotlin/                    ← Kotlin 专用
│   ├── coding-style.md        ← null safety、sealed types、禁 !!
│   ├── testing.md             ← kotlin.test + Turbine + runTest
│   ├── patterns.md            ← Koin/Hilt DI、ViewModel + Flow
│   ├── hooks.md               ← ktlint + detekt + gradlew build
│   └── security.md            ← EncryptedSharedPreferences
│
├── php/                       ← PHP 专用
│   ├── coding-style.md        ← PSR-12、strict_types、PHPStan
│   ├── testing.md             ← PHPUnit/Pest
│   ├── patterns.md            ← Thin Controller、DTO/Value Object
│   ├── hooks.md               ← Pint/PHP-CS-Fixer + PHPStan
│   └── security.md            ← prepared statements、password_hash
│
└── perl/                      ← Perl 专用
    ├── coding-style.md        ← use v5.36、Moo + Types::Standard
    ├── testing.md             ← Test2::V0 + prove + Devel::Cover
    ├── patterns.md            ← DBIx::Class、Path::Tiny
    ├── hooks.md               ← perltidy + perlcritic
    └── security.md            ← taint mode、三参数 open
```

**优先级**：语言专用规则 > 通用规则（有冲突时以语言规则为准）

**真实设计**：每种语言的规则文件**不是通用规则的复制粘贴**，而是针对语言特性的专门定制。比如 Swift 的安全规则强调 Keychain Services 而非 process.env，Kotlin 强调 null safety（禁止 `!!`）而非 TypeScript 的 `unknown` 类型窄化。

#### 核心通用规则

##### 编码风格（coding-style.md）

```
不可变优先（CRITICAL）：
  ❌ modify(original, field, value)    // 修改原始对象
  ✅ update(original, field, value)    // 返回新对象

文件组织：
  推荐：200-400 行/文件
  上限：800 行/文件
  超出 → 拆分为多个文件

错误处理：
  所有外部调用必须有 try-catch
  错误信息不能泄露敏感数据
```

##### 安全标准（security.md）

```
提交前安全清单：
  □ 没有硬编码的密钥/密码
  □ 所有用户输入已验证
  □ 防止 SQL 注入
  □ 防止 XSS 攻击
  □ 有 CSRF 保护
  □ 认证/授权已验证
  □ API 有速率限制
  □ 错误信息不泄露敏感数据
```

##### 测试要求（testing.md）

```
最低覆盖率：80%
TDD 工作流：RED → GREEN → REFACTOR（强制执行）
测试类型：单元测试 + 集成测试 + E2E 测试
关键代码：100% 覆盖
```

##### Git 工作流（git-workflow.md）

```
提交信息格式：
  feat: 新功能
  fix:  Bug 修复
  docs: 文档更新
  refactor: 重构
  test: 测试
  chore: 杂项

PR 工作流：
  1. 分析完整提交历史（不只是最后一个提交！）
  2. 撰写 PR 描述
  3. 代码审查
  4. 合并
```

### 质量门禁（Quality Gate）

质量门禁是 Hooks 和 Rules 的结合——在关键节点自动检查代码是否达标。

以下是 `quality-gate.js` 脚本的**真实工作逻辑**：

```
代码变更发生（Edit / Write / MultiEdit）
    ↓
quality-gate.js 启动（异步，30s 超时）
    ↓
┌─────────────────────────────────────────────┐
│ 检测文件类型和项目工具                         │
│  .ts/.tsx/.js/.jsx → 跳过（post-edit-format 已处理）│
│  .json/.md → 走 Biome 或 Prettier            │
│  .go → 走 gofmt                              │
│  .py → 走 ruff format                        │
├─────────────────────────────────────────────┤
│ 检查 1: 代码格式化                            │
│  Biome check --write（格式化+Lint 一步完成）   │
│  或 Prettier --write                         │
│  或 gofmt -w                                 │
│  或 ruff format                              │
│  → 不通过则自动修复                            │
├─────────────────────────────────────────────┤
│ 检查 2: Lint（Biome 模式下已包含）             │
│  → 有错误则告警                               │
├─────────────────────────────────────────────┤
│ post-edit-typecheck.js（独立 Hook）           │
│  自动找到最近的 tsconfig.json（最多上溯 20 层）│
│  运行 tsc --noEmit --pretty false            │
│  只显示与编辑文件相关的错误                     │
│  → 类型错误则阻止                              │
├─────────────────────────────────────────────┤
│ post-edit-console-warn.js（独立 Hook）        │
│  检查编辑文件中的 console.log                  │
│  显示最多 5 个匹配行及行号                     │
│  → 有则警告                                   │
└─────────────────────────────────────────────┘
    ↓
全部通过 → 可以提交
有阻止项 → 必须修复
```

**环境变量微调**：
```
ECC_QUALITY_GATE_FIX=1     → 自动修复格式问题（默认行为）
ECC_QUALITY_GATE_STRICT=1  → 严格模式，Lint 警告也阻止
```

### 三层自动化的协作

```
Rules（规则）      → 定义标准     → "代码应该长什么样"
Hooks（钩子）      → 执行检查     → "自动检查是否达标"
Quality Gate（门禁）→ 决定通过     → "不达标就不能提交"
```

**实际例子**：

```
1. Rules 规定：文件不超过 800 行
2. Hooks 在每次编辑后检查文件行数
3. Quality Gate 在提交前验证所有文件行数

开发者写了一个 850 行的文件
  → PostToolUse Hook 检测到超标
  → 立刻提醒开发者拆分文件
  → 开发者拆分后，Quality Gate 通过
  → 代码可以提交
```

### 自动化配置的三个层级

```
Level 1: 开箱即用（install.sh 安装后自动生效）
  → session-start/end、格式化、类型检查、安全规则
  → 对应 "minimal,standard,strict"（所有 Profile 都启用）

Level 2: 项目定制（修改 hooks.json）
  → 添加项目特定的 Hook
  → 调整 Rule 的严格程度
  → 对应 "standard,strict"（minimal 模式下不运行）

Level 3: 环境变量精确控制
  → ECC_HOOK_PROFILE=minimal  （4 个核心 Hook：session-start/end + evaluate + cost）
  → ECC_HOOK_PROFILE=standard （17 个 Hook，默认值）
  → ECC_HOOK_PROFILE=strict   （全部 21 个 Hook）
  → ECC_DISABLED_HOOKS=hook1,hook2  （精确禁用特定 Hook）
  → ECC_ENABLE_INSAITS=1            （开启 AI 安全监控）
  → ECC_QUALITY_GATE_STRICT=1       （质量门禁严格模式）
  → COMPACT_THRESHOLD=50            （压缩建议阈值，默认 50 次调用）
```

### 自动化速查指南

| 你想确保的事情 | 谁来做 | 具体脚本 |
|--------------|--------|---------|
| 代码风格统一 | PostToolUse Hook | post-edit-format.js（自动检测 Biome/Prettier） |
| TypeScript 类型安全 | PostToolUse Hook | post-edit-typecheck.js（找 tsconfig 运行 tsc） |
| 没有安全漏洞 | /code-review + InsAIts | insaits-security-wrapper.js（23 种异常检测） |
| 测试覆盖率达标 | /tdd + Testing Rule | common/testing.md（80% 强制要求） |
| 提交信息规范 | Git Workflow Rule | common/git-workflow.md（feat/fix/docs 格式） |
| 不提交调试代码 | Stop + PostToolUse | check-console-log.js + post-edit-console-warn.js |
| 会话状态保存 | Stop + SessionStart | session-end.js + session-start.js |
| 构建不报错 | PostToolUse | quality-gate.js（Biome/Prettier/gofmt/ruff） |
| AI 使用成本可控 | Stop Hook | cost-tracker.js（记录到 costs.jsonl） |
| AI 持续学习 | Pre/PostToolUse | observe.sh（采集工具使用数据） |
| 长会话不降质 | PreToolUse | suggest-compact.js（50 次调用提醒压缩） |

## 阶段 4 总结

恭喜你完成了阶段 4！让我们回顾一下：

```
Lesson 21: 工程协作概览
  ✅ 理解了 cc4pm 18 个专业代理的分工
  ✅ 掌握了 /plan 的规划流程
  ✅ 理解了"规划→测试→开发→审查"完整流程

Lesson 22: 测试与代码审查
  ✅ 掌握了 /tdd 的 RED→GREEN→REFACTOR 循环
  ✅ 理解了 /e2e 端到端测试和 Playwright
  ✅ 学会了 /code-review 的四级审查标准
  ✅ 了解了 /build-fix 自动修复构建错误

Lesson 23: 自动化工作流
  ✅ 理解了 Hooks 的 6 个触发时机和 21 个实际 Hook
  ✅ 掌握了 Rules 的分层架构（9 通用 + 7 语言 × 5 = 44 规则文件）
  ✅ 理解了 Quality Gate 的真实工作逻辑
  ✅ 了解了 Hook Profile 和环境变量控制
```

## 🛠️ 实操练习

完成以下练习，掌握自动化工作流工具。

### 练习 1：查看 Hooks 配置

```bash
# 查看当前 Hooks 配置
cat .claude/hooks/hooks.json
```

**任务**：
1. 了解 6 种 Hook 触发时机
2. 识别哪些 Hook 在你的项目中启用
3. 理解 Hook 的 exit code 机制

**Hook 触发时机速览**：

| 时机 | 说明 | 典型用途 |
|------|------|---------|
| PreToolUse | 工具调用前 | 权限检查、压缩提醒 |
| PostToolUse | 工具调用后 | 格式化、类型检查 |
| SessionStart | 会话开始 | 加载上下文 |
| Stop | 会话结束 | 保存状态、记录成本 |
| Notification | 通知事件 | 外部集成 |
| SubagentStop | 子代理结束 | 结果验证 |

### 练习 2：查看 Rules 配置

```bash
# 查看通用规则
ls rules/common/

# 查看语言特定规则
ls rules/golang/
ls rules/python/
```

**任务**：
- 了解 9 个通用规则文件
- 了解语言特定规则的结构

### 练习 3：运行 Quality Gate

```bash
# 运行质量门禁
/quality-gate
```

**任务**：
- 运行质量门禁检查
- 查看检查结果（格式化、类型检查、Lint）
- 理解阻止项和警告项的区别

### 练习 4：调整 Hook Profile

```bash
# 设置 Hook Profile
export ECC_HOOK_PROFILE=strict

# 禁用特定 Hook
export ECC_DISABLED_HOOKS=suggest-compact
```

**检查清单**：
- [ ] 查看了 `hooks.json` 配置
- [ ] 了解了 6 种 Hook 触发时机
- [ ] 查看了 Rules 目录结构
- [ ] 运行了 Quality Gate
- [ ] 了解了 Hook Profile 环境变量

---

## 常见问题

**Q: 这些自动化会不会拖慢开发速度？**

A: 每次 Hook 执行只需要 1-5 秒。而一个没被发现的 Bug 上线后修复需要 1-5 天。自动化的核心是"花 5 秒检查，省 5 天修复"。

**Q: 如果自动化规则太严格怎么办？**

A: 可以通过 ECC_HOOK_PROFILE 调整严格程度（minimal/standard/strict）。也可以在 hooks.json 中禁用特定 Hook。关键是找到"质量"和"速度"的平衡点——对于 MVP 阶段可以用 minimal，产品稳定后切换到 strict。

**Q: Rules 会被 AI 代理自动遵守吗？**

A: 是的。Rules 文件安装到 ~/.claude/rules/ 后，所有 AI 代理在生成代码时都会自动参考这些规则。你不需要每次提醒——规则是"始终生效"的。

## 下一步

- [1] 进入阶段 5：Lesson 24 - 高级特性与持续学习
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 23/26 (阶段内 3/3) | 上一课: Lesson 22 - 测试与审查 | 下一课: Lesson 23.1 - Harness 设计哲学*
