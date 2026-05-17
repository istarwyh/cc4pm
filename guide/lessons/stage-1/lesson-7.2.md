# Lesson 7.2: Agent View——大屏遥控你的 AI 团队

## 本课目标

- 理解 Agent View 与 subagent、Agent Teams 的层次区别
- 掌握 `claude agents` / `claude --bg` / `/bg` 三个调度入口
- 学会用 dispatch 语法（`@agent`、`@repo`、`/skill`、`#PR`）一键派活
- 理解后台 session 的 supervisor 进程、自动 worktree 隔离与配额规则
- 识别 Research Preview 阶段的限制与回退方法

## 核心内容

### 一句话理解

如果说 subagent 是"你的执行助手"、Agent Teams 是"你拉的圆桌讨论组"，那么 Agent View 就是**一块大屏，把所有后台 Claude 实时摊在你面前，让你只在需要决策时介入**。

```
代理协作三部曲（同 stage 三课串读）：

  Lesson 7    Subagent       单 session 内派生子任务
                              你 ← 主 Claude → 子代理（不显示为独立行）

  Lesson 7.1  Agent Teams    多 session 互发消息讨论
                              你（Lead）↔ Teammate ↔ Teammate

  Lesson 7.2  Agent View     多 session 后台编排 + 总览（本课）
                              你 → ┬─→ session A（PR 修复）
                                   ├─→ session B（flaky 测试调查）
                                   └─→ session C（代码审查）
                              每个 session 独立运行、独立 worktree、独立配额
```

### 三层并排对比

| 维度 | Subagent (L7) | Agent Teams (L7.1) | Agent View (本课) |
|------|---------------|--------------------|--------------------|
| 进程模型 | 主 session 内派生 | 多 session + iTerm2 面板 | 多 session + supervisor 后台守护 |
| 终端依赖 | 跟随主会话 | 必须开着 iTerm2 | **无需终端**，关掉也继续跑 |
| 可见性 | 只看摘要 | 实时分面板 | 表格总览 + 偷看 + 随时 attach |
| 文件隔离 | 共享主 session 工作树 | 共享或手动 worktree | **自动 worktree** |
| 通信 | 单向（主→子→主） | 多向（互发消息） | 各自独立，你统一调度 |
| 适合场景 | 分工明确的子任务 | 多角度决策讨论 | 多个独立长任务并行推进 |

### 启用条件

```bash
# 1. 检查版本
claude --version
# 要求 v2.1.139 或更高
# 若用了 --permission-mode / --model / --effort flag，需要 v2.1.142+

# 2. 不够新就升级
claude update

# 3. 直接打开（无需其他配置，无需环境变量）
claude agents
```

**当前状态**：Research Preview。可用计划：Pro、Max、Team、Enterprise、Claude API plans。界面与快捷键可能调整。

**通过 Bedrock / Vertex AI / Foundry 连接的旧版本**曾不可用——如果运行 `claude agents` 只列出 subagent 名称就退出，先 `claude update`。

### 三种 dispatch 入口

```bash
# A. 从 Agent View 内：打开后在底部输入框敲任务，回车
claude agents

# B. 从已有 session 内：把当前会话送到后台
/bg              # 或 /background
/bg 把测试套件跑一遍，失败的全部修了    # 后台化 + 追加一条指令

# C. 直接从 shell 起后台 session
claude --bg "调查 SettingsChangeDetector 偶现失败的根因"
claude --agent code-reviewer --bg "审 PR 1234"
claude --bg --name "flaky-fix" "..."   # 自定义显示名

# 任意 session 内空 prompt 按 ← 也会后台化当前会话并打开 Agent View
```

### Agent View 输入框的隐藏语法

在底部输入框里，**前缀和提及**决定 session 的启动方式：

| 输入 | 效果 |
|------|------|
| `@<subagent-name> <prompt>` | 用该 subagent 作为 session 主代理（读它的 frontmatter） |
| `<subagent-name> <prompt>` | 同上，无需 `@`（与第一词匹配即可） |
| `@<repo> <prompt>` | 在当前父目录下的某个子仓库里跑 |
| `/<skill> <prompt>` | 让 skill 处理 prompt |
| `#<PR号>` 或完整 PR URL | 跳转到正在处理该 PR 的 session（如有） |
| `Shift+Enter` | dispatch 并立即 attach（看着它干） |
| `a:<name>` / `s:working` / `s:blocked` | 不是 dispatch，是过滤当前列表 |

> PM 技巧：把高频任务（"为本次 commit 写 PR 描述"、"对当前分支跑 e2e"）打包成 **skill**，然后用 `/skill-name` 触发——Agent View 里只需打一个斜杠就能批量 dispatch。

### 看懂 session 状态

每一行最左侧的图标编码两条信息：**颜色 = 进度状态，形状 = 进程是否在跑**。

| 状态 | 含义 |
|------|------|
| 动画 `✽` | Working：正在调工具或生成回复 |
| 黄色 `✻` | Needs input：等你回答问题或授权 |
| 灰底 `∙` | Idle 或进程已退出（仍可 peek/reply/attach，会从断点重启） |
| 绿色 `✻` | Completed |
| 红色 `✻` | Failed |
| `✢` | `/loop` 任务睡眠中，行尾显示运行计数与倒计时 |

当 session 开了 PR，行右侧会多一个状态点：黄=等审/CI、绿=可合并、紫=已合、灰=草稿或关闭。在支持超链接的终端里可以**直接点进 GitHub**。

### 你和 session 的三种交互距离

```
                ┌──────────────────┐
                │   总览（表格）    │  ← 默认视图，不打开任何对话
                │   ↓ Space         │
                │   偷看面板        │  ← 看最近一轮 + 直接回复
                │   ↓ Enter / →     │
                │   完整对话（attach）│  ← 与跑普通 claude 完全一样
                │   ↑ ← (空 prompt) │
                └──────────────────┘
```

- **偷看（Space）**：看最近一轮输出或它等你回答的问题。多选题直接按数字键。`Tab` 让 Claude 给你一个建议回复。`!` 开头当 Bash 命令发。
- **Attach（Enter / →）**：会话接管终端，再按 `←`（空输入时）detach 回总览。Attach 时 Claude 会给一段"你不在的时候发生了什么"摘要。
- **从任何 session 按 `←`（空 prompt）** 都能把当前会话后台化 + 打开 Agent View 并定位到它。

### 关键快捷键（在 Agent View 里按 `?` 查全部）

| 键 | 动作 |
|----|------|
| `↑` `↓` | 上下移动 |
| `Space` | 偷看选中行 |
| `Enter` / `→` | Attach |
| `Shift+Enter` | Dispatch 并立即 attach |
| `Alt+1`..`Alt+9` | 直接 attach 当前分组第 1-9 个 |
| `Ctrl+S` | 按目录/状态切换分组 |
| `Ctrl+T` | 置顶/取消置顶 |
| `Ctrl+R` | 重命名 session |
| `Ctrl+G` | 在 `$EDITOR` 里写 dispatch prompt |
| `Ctrl+X` | 停止 session（两秒内再按一次=删除并清理 worktree） |
| `Esc` | 关偷看 / 清输入 / 退出 |

### 自动 worktree 隔离（与 L3.2 手动 worktree 的关系）

每个后台 session 在第一次写文件前，会**自动**迁入 `.claude/worktrees/<id>/` 独立工作树：

```
你的项目根
├── .claude/worktrees/
│   ├── 7c5dcf5d/   ← session A 写这里
│   ├── a3f201e9/   ← session B 写这里
│   └── ...
├── src/
└── ...
```

这意味着**多个 session 可以并行编辑同一份代码而不会互相覆盖**。但有三个例外不会建 worktree：
1. 工作目录不是 git 仓库
2. session 已经在 `.claude/worktrees/` 下了
3. 写文件路径在工作目录之外

> **删除前一定要 merge 或 push**——按 `Ctrl+X` 两次删除 session 时，worktree 连带未提交修改一起删。需要重定向到指定 subagent 永远跑在独立 worktree 时，在 subagent frontmatter 里加 `isolation: worktree`。

### supervisor 进程 ≠ ccc supervisor

Agent View 的**官方 supervisor**是 Anthropic 自带的、每用户一个的本地守护进程：
- 你 background 第一个 session 或第一次 `claude agents` 时自动启动
- 与你的交互式 session **用同一凭证**，不开新的网络连接（只走模型 API）
- session 闲置约 1 小时后被它停掉进程释放内存（transcript 和 state 仍在磁盘上）
- 所有 session 都跑完且没人 attach 时，它自己退出
- 监听 claude 二进制变化，被 auto-updater 替换后**自动重启进所有 session 不掉**

状态文件：
```
~/.claude/daemon.log                 # supervisor 日志
~/.claude/daemon/roster.json         # 后台 session 列表（用于重启重连）
~/.claude/jobs/<id>/state.json       # 每个 session 的状态
```

> 别把它和 L23.5 的 `ccc supervisor` 搞混——后者是社区方案的"严格模式"封装，与 Agent View 内置的进程守护是两回事。

### 来自 shell 的命令行管理

每个后台 session 有一个 8 位短 ID。脚本化或不想开 Agent View 时直接用：

```bash
claude agents                      # 打开总览
claude agents --cwd /path/to/proj  # 只看该目录下起的 session
claude attach <id>                 # 当前终端 attach
claude logs <id>                   # 最近输出
claude stop <id>                   # 停（也叫 claude kill）
claude respawn <id>                # 重启已停 session（对话保留）
claude respawn --all               # 全部重启（机器睡眠后恢复用这个）
claude rm <id>                     # 删 session + 清理 worktree（要求无未提交）
```

### PM 必读：三条硬限制

Research Preview 阶段的三个"踩坑点"：

1. **配额按 session 独立计费** — 10 个并行 agent ≈ 10 倍消耗你的订阅 quota。便宜模型（Sonnet/Haiku）跑后台是关键省钱手段，可以在 dispatch 时加 `--model sonnet`，或在 attach 后 `/model` 切换。
2. **session 本地运行** — 机器睡眠/关机后正在跑的 session 会变成 Failed 状态。醒来后 attach 任一个就会自动重启，或一次性 `claude respawn --all`。
3. **worktree 跟 session 共生死** — 删除 session = 删 worktree。可以推/合的工作树在 PR 合并后再删。

### PM 典型场景

#### 场景 1：多任务并行推进
早上派 3 个独立任务，下午回来看哪些已经开 PR 等审：

```
claude agents
> 调查 SettingsChangeDetector 偶现失败的根因，开 PR
> @code-reviewer 审最新的 3 个 open PR，给我每个的 critical issue 清单
> /bmad-create-prd 把上周用户访谈的 5 个反馈整理成 PRD
```

回来时只看右侧 PR 状态点——绿点的合并、黄点的回偷看面板回复、红点的 attach 进去看为什么挂了。

#### 场景 2：长任务"放养"

```bash
# 起一个 /loop 任务在后台跑（会显示 ✢ 图标 + 倒计时）
claude --bg "每 30 分钟跑一次 e2e 套件，失败时分析根因并提交 fix PR"
```

`/loop` session 在 Agent View 里显示运行计数和下次倒计时，可以连续跑数小时不打扰你。

#### 场景 3：用 dispatch 语法快速触发 cc4pm 工作流

```bash
claude agents
> @tdd-guide 给 install-manifests.test.js 补全分支覆盖
> /bmad-validate-prd 检查最新 PRD 的实现就绪度
> #2048 attach 进 PR 2048 的修复 session
```

### 动手试试

```bash
# 1. 打开 Agent View
claude agents

# 2. 在底部输入框里依次 dispatch 3 个任务（每条按 Enter）：
读 README.md 然后写一句话总结这个项目的卖点

列出 .claude/agents/ 目录下所有 agent 的名字和职责

为本仓库画一个三层架构图，输出 mermaid 代码

# 3. 用 ↑↓ 浏览各行，Space 偷看输出
# 4. 选定一行按 Enter attach 进去看完整对话
# 5. 在 attach 状态空 prompt 按 ← detach 回总览
# 6. Ctrl+X 两次删掉这三个练习 session
```

**观察**：三个 session 各占一行；状态从 Working（动画 ✽）→ Idle（灰 ∙）。它们各自跑在独立 worktree（`ls .claude/worktrees/`），互不干扰，关掉 Agent View 也继续跑。

**PM 反思**：以前你需要 3 个 tmux 面板 + 一个 todo list 才能管住的并行工作，现在一块大屏 + 偷看面板就够了。**你的认知负担从"轮询每个 agent"变成了"被需要时再介入"**。

## 常见问题

**Q: Agent View 和 Agent Teams 我该用哪个？**

A: 看任务是否需要"成员互相沟通"。
- 多个**独立**的长任务并行推进 → **Agent View**（更省心，无需 iTerm2，关终端也跑）
- 多个角色围绕同一议题**讨论辩论** → **Agent Teams**（多向通信是核心价值）
- 一个 session 内分阶段调度执行 → **Subagent**（最轻量）

**Q: `claude agents` 只列了 subagent 名字就退出了？**

A: 你的版本太老或运行环境不支持。先 `claude update` 升到 v2.1.139+；如果通过 Bedrock/Vertex AI/Foundry 连接还不行，可能这些环境暂未完全支持。

**Q: 怎么完全关掉 Agent View？**

A: 在 `~/.claude/settings.json` 里加 `"disableAgentView": true`，或设环境变量 `CLAUDE_CODE_DISABLE_AGENT_VIEW=1`。企业管理员可通过 managed settings 强制下发。

**Q: 后台 session 用什么模型？怎么改？**

A: 默认用 Agent View 顶部显示的模型（与 `/model` 同源）。改法：
- 打开时 `claude agents --model opus` 改默认
- 单个 session：`claude --bg --model sonnet "..."` 或 attach 后 `/model`
- 永久指定 subagent 模型：subagent frontmatter 里写 `model: claude-haiku-4-5-20251001`

**Q: 与 Claude API 的 "Multiagent Sessions" 是同一个东西吗？**

A: **不是**。API 的 multiagent 是单个 API session 内 coordinator 派生多个 thread（同容器同文件系统、25 并发上限、API 计费）；Agent View 是本地 CLI 的多 session 编排（每个 session 独立进程、独立 worktree、按 session 各自计费）。

**Q: Agent View 里看不到 subagent？**

A: 设计如此。**Agent View 行 = 顶层 session**；session 内部派生的 subagent 和 Agent Teams Teammate 不显示为独立行（要看它们的输出请 attach 到父 session）。

## 相关概念

- **Subagent**（L7）— 单 session 内的子任务
- **Agent Teams**（L7.1）— 多 session 互发消息讨论
- **Git Worktree**（L3.2）— Agent View 自动隔离的基础设施
- **`/loop` 调度任务**（在 L23 自动化工作流相关）— 后台 loop session 显示 ✢ 图标
- **Skill 系统**（L6 / L6.1）— `/skill` 前缀可在 dispatch 时触发
- **Hooks**（L8）— 后台 session 同样触发，可统一记账与告警

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 8 - Hooks 与 Rules：自动化守护
- 回看：Lesson 7.1 - Agent Teams 协作团队
- 返回主菜单
- 退出学习

---
*阶段 1 | Lesson 7.2/26 | 上一课: Lesson 7.1 - Agent Teams | 下一课: Lesson 8 - Hooks 与 Rules*
