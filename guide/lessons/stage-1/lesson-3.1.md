# Lesson 3.1: Status Line——你的实时仪表盘

## 本课目标

- 理解 Status Line 的工作原理：一个持久显示在终端底部的自定义状态栏
- 掌握用 `/statusline` 一句话生成状态栏的方法
- 了解 Status Line 可以展示的完整数据字段
- 学会配置实用的状态栏：上下文进度条、费用追踪、Git 状态

## 核心内容

### 什么是 Status Line

上一课我们学了 `/context`、`/cost` 等命令来**主动检查**上下文状态。但检查是间歇性的——你需要记得去查。

Status Line 解决了这个问题：它是一个**始终显示在终端底部的自定义状态栏**，实时展示你关心的信息。

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  你和 Claude 的对话内容                                 │
│  ...                                                   │
│  ...                                                   │
│                                                        │
├──────────────────────────────────────────────────────┤
│  [Opus 4.6] 📁 cc4pm | 🌿 main +2~3 | ▓▓▓▓░░░░░░ 38% │  ← Status Line
└──────────────────────────────────────────────────────┘
```

**关键特性**：
- **不消耗 API tokens** —— Status Line 在本地运行，完全免费
- **自动更新** —— 每次 Claude 回复后刷新
- **完全自定义** —— 你的脚本输出什么，它就显示什么
- **支持多行** —— 可以显示两行甚至更多信息
- **支持颜色** —— 用 ANSI 转义码让关键信息醒目

### 最快的方式：/statusline 命令

一句话搞定：

```bash
/statusline show model name and context percentage with a progress bar
```

Claude Code 会自动：
1. 生成一个脚本文件到 `~/.claude/`
2. 更新你的 `settings.json` 配置
3. 状态栏立即生效

**更多示例**：

```bash
# 显示模型 + 上下文 + 费用
/statusline show model, context bar, and session cost in USD

# 显示 Git 分支 + 修改文件数
/statusline show git branch with staged and modified file counts

# 多行：第一行项目信息，第二行上下文进度
/statusline two lines: first line shows model and git branch,
second line shows context progress bar with cost and duration

# 删除状态栏
/statusline remove
```

> `/statusline` 接受自然语言描述，Claude 帮你生成完整脚本。和 Lesson 8 的 Hook 一样——零代码基础，一句话搞定自动化。

### 工作原理

理解原理能帮你自定义更复杂的状态栏：

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  Claude Code                                           │
│  ├── 每次助手回复后                                     │
│  ├── 收集当前会话的 JSON 数据                            │
│  │   （模型、上下文占用、费用、目录、Git 状态等）          │
│  ├── 通过 stdin 发送给你的脚本                           │
│  ├── 你的脚本读取 JSON，提取需要的字段                    │
│  ├── 脚本 print 输出文本                                │
│  └── Claude Code 把输出显示在终端底部                     │
│                                                        │
│  数据流：                                               │
│  Claude → JSON stdin → 你的脚本 → stdout → 状态栏        │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**更新时机**：
- 每次 Claude 回复完成后
- 权限模式切换时
- Vim 模式切换时
- 300ms 防抖（快速连续更新只触发一次）

### 可用数据字段

Status Line 接收的 JSON 包含丰富的会话数据：

#### 模型与环境

| 字段 | 说明 | 示例值 |
|------|------|--------|
| `model.display_name` | 当前模型名称 | `"Claude Opus 4.6"` |
| `model.id` | 模型标识符 | `"claude-opus-4-6"` |
| `workspace.current_dir` | 当前工作目录 | `"/Users/mac/project"` |
| `workspace.project_dir` | Claude 启动目录 | `"/Users/mac/project"` |
| `session_id` | 会话唯一 ID | `"abc-123-def"` |
| `version` | Claude Code 版本 | `"2.1.63"` |

#### 上下文窗口（最常用）

| 字段 | 说明 |
|------|------|
| `context_window.used_percentage` | 上下文已用百分比（最常用） |
| `context_window.remaining_percentage` | 上下文剩余百分比 |
| `context_window.context_window_size` | 窗口总大小（默认 200000） |
| `context_window.total_input_tokens` | 累计输入 tokens |
| `context_window.total_output_tokens` | 累计输出 tokens |
| `exceeds_200k_tokens` | 是否超过 200K tokens |

#### 费用与时间

| 字段 | 说明 |
|------|------|
| `cost.total_cost_usd` | 会话总费用（美元） |
| `cost.total_duration_ms` | 会话总时长（毫秒） |
| `cost.total_api_duration_ms` | API 等待总时长 |
| `cost.total_lines_added` | 代码新增行数 |
| `cost.total_lines_removed` | 代码删除行数 |

#### 速率限制

| 字段 | 说明 |
|------|------|
| `rate_limits.five_hour.used_percentage` | 5 小时限额已用百分比 |
| `rate_limits.seven_day.used_percentage` | 7 天限额已用百分比 |
| `rate_limits.five_hour.resets_at` | 5 小时限额重置时间 |

#### 其他

| 字段 | 说明 |
|------|------|
| `vim.mode` | Vim 模式（NORMAL / INSERT） |
| `agent.name` | 当前代理名称 |
| `worktree.name` | 工作树名称 |
| `transcript_path` | 对话记录文件路径 |

### 手动配置方式

如果你想完全控制，可以手动创建脚本：

#### 第 1 步：创建脚本

```bash
# ~/.claude/statusline.sh
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

echo "[$MODEL] 📁 ${DIR##*/} | ${PCT}% context"
```

#### 第 2 步：设置可执行权限

```bash
chmod +x ~/.claude/statusline.sh
```

#### 第 3 步：添加到 settings.json

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

也可以不用脚本文件，直接内联命令：

```json
{
  "statusLine": {
    "type": "command",
    "command": "jq -r '\"[\\(.model.display_name)] \\(.context_window.used_percentage // 0)% context\"'"
  }
}
```

### 实用配方

#### 配方 1：上下文进度条（最推荐）

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# 构建进度条
BAR_WIDTH=10
FILLED=$((PCT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /▓}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /░}"

echo "[$MODEL] $BAR $PCT%"
```

效果：`[Opus 4.6] ▓▓▓▓░░░░░░ 38%`

#### 配方 2：Git 状态 + 颜色

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')

GREEN='\033[32m'
YELLOW='\033[33m'
RESET='\033[0m'

if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    STAGED=$(git diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
    MODIFIED=$(git diff --numstat 2>/dev/null | wc -l | tr -d ' ')

    GIT_STATUS=""
    [ "$STAGED" -gt 0 ] && GIT_STATUS="${GREEN}+${STAGED}${RESET}"
    [ "$MODIFIED" -gt 0 ] && GIT_STATUS="${GIT_STATUS}${YELLOW}~${MODIFIED}${RESET}"

    echo -e "[$MODEL] 📁 ${DIR##*/} | 🌿 $BRANCH $GIT_STATUS"
else
    echo "[$MODEL] 📁 ${DIR##*/}"
fi
```

效果：`[Opus 4.6] 📁 cc4pm | 🌿 main +2~3`（+2 绿色，~3 黄色）

#### 配方 3：多行仪表盘（全信息）

... (此处省略部分代码) ...

#### 配方 4：ccc Supervisor 模式监控

如果你安装了 `ccc` (Claude Code Supervisor)，可以实时查看审查器是否开启：

```bash
/statusline 帮我配置statusline脚本，里面调用 `ccc supervisor-mode` 命令。
输出内容格式：... | 🛡️ Supervisor: [on/off]
```

效果：`[Opus 4.6] 📁 cc4pm | 🛡️ Supervisor: on`

### 演示案例：立即配置你的 Status Line

```bash
cd cc4pm
claude

# 最简单的方式——一句话搞定
/statusline show model name, context progress bar with percentage,
and session cost. Use colors: green under 50%, yellow 50-80%, red above 80%

# 验证效果——随便和 Claude 对话几轮
"列出 agents/ 目录下的前 5 个代理"

# 观察底部状态栏的变化：
# - 上下文百分比随对话增长
# - 费用在累积
# - 颜色在变化
```

### 动手试试

**练习 1：配置基础状态栏**

```bash
claude

/statusline show model and context percentage with a progress bar
# → 观察底部出现状态栏
# → 多和 Claude 对话几轮，观察百分比变化
```

**练习 2：添加 Git 信息**

```bash
/statusline show model, git branch with colored staged/modified counts,
and context bar

# → 做一些文件修改，观察 Git 状态变化
```

**练习 3：多行仪表盘**

```bash
/statusline two lines:
line 1: model name, directory, git branch
line 2: context progress bar, session cost, duration in minutes

# → 完整的实时仪表盘！
```

## 常见问题

**Q: Status Line 会消耗 API tokens 吗？**

A: 不会。Status Line 完全在本地运行——你的脚本读取 Claude Code 提供的 JSON 数据，在本地处理后输出到终端。没有任何 API 调用，零成本。

**Q: 支持哪些脚本语言？**

A: 任何可以从 stdin 读取 JSON 并输出文本的语言：Bash、Python、Node.js、Go 等。Bash + jq 是最常见的组合。Python 和 Node.js 有内置的 JSON 解析，不需要额外依赖。

**Q: 状态栏多久更新一次？**

A: 每次 Claude 完成一条回复后自动更新。有 300ms 防抖——快速连续的更新会合并为一次。修改脚本后，需要等下一次 Claude 回复才能看到变化。

**Q: 怎么删除状态栏？**

A: 运行 `/statusline remove`，或者手动从 `settings.json` 中删除 `statusLine` 字段。

**Q: 在 Windows 上能用吗？**

A: 可以，但需要用 PowerShell 或 Git Bash 脚本替代 Bash 脚本。语法不同但原理相同。

## 下一步

- [1] 进入下一课：Lesson 3.2 - 效率工作流：快捷键、编辑器与 tmux
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 3.1/26 | 上一课: Lesson 3 - 主动管理上下文 | 下一课: Lesson 3.2 - 效率工作流*
