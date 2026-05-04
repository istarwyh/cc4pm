---
number: 24.6
title: "cc-connect 实战：通过微信远程控制 Claude Code"
short_title: "微信远程控制 CC"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.6: cc-connect 实战——通过微信远程控制 Claude Code

> **前置课程**：Lesson 1（cc4pm 全景）
>
> **预计用时**：25 分钟
>
> **适合人群**：想在手机上用微信操控本机 AI Agent 的所有人——程序员看 CI、运营整理 Excel、销售分类邮件、PM 跟进飞书 / 钉钉里的项目都适用
>
> **项目地址**：[github.com/chenhg5/cc-connect](https://github.com/chenhg5/cc-connect)

## 为什么这件事现在值得学

从手机遥控本机 AI Agent 这两年已经从极客玩具变成趋势——OpenClaw 率先在产品维度跑通了这件事（原生 iOS/Android 客户端、语音唤醒、Canvas 画布，GitHub 367k 星），OpenAI Codex、Cursor Agent、Claude Code、各家本地大模型也都在往这个方向卷。原因不复杂：你信任的代码、文档、表格都在自己的 Mac 上，但你不可能 24 小时守着电脑。

这件事对程序员的价值是显然的（地铁里看 CI、出差时审 PR），但对其他岗位的价值常被低估：

- **运营/销售**：在 Mac 上的 Excel、CRM 导出表格，外出时让 Claude 做一次按渠道汇总
- **产品/PM**：把飞书或钉钉里本周延期的项目卡片摘出来发到微信
- **设计/写作**：路上读到一篇好文章，让本机 Claude 把它和你 Obsidian 库里相关笔记交叉引用一下
- **任何人**：定时归档 Downloads、汇总未回复邮件、整理本周日历

cc-connect 走的是另一条路：不造客户端，造管子——把微信、飞书、钉钉这些你已经在用的 App 和 Claude Code、Codex 这些 Agent 接在一起，**主打真实生产力**。M 个 IM 平台 × N 个 Agent，今天微信 + Claude Code，明天换 Telegram + Codex，配置层基本不动。

## 学习目标

- 从零搭建微信 ↔ Claude Code 的桥接服务
- 理解配置三层心智模型（providers / projects / platforms）
- 掌握会话管理与上下文溢出防护（auto-compress、context indicator、reset-on-idle）
- 设置 daemon 常驻运行，开机自启
- 用 cron 定时任务实现无人值守自动化
- 学会"配置交给 Claude 自己改"这套元方法，少手敲 TOML

## 一分钟理解架构

```
你在微信发消息
    ▼
腾讯 ilink 网关（官方接口，无需公网 IP）
    ▼
cc-connect 进程（本地运行）
    ├── 消息收发（ilink HTTP 长轮询）
    ├── 会话路由 & 权限管理
    └── Claude Code 子进程（stdin/stdout JSONL）
            ▼
      读代码、写文件、执行命令...
            ▼
      结果回传到你的微信
```

核心：cc-connect 是一个 **Go 编写的桥接服务**，一头连微信（通过腾讯官方 ilink 接口），一头连本地的 Claude Code CLI（通过子进程 + JSONL 流）。不需要公网 IP，不需要逆向工程。

## 第一步：安装 cc-connect

### 方式零：让 AI Agent 一句话装完（最推荐）

最省事——直接把下面这句话发给 Claude Code（或任何 AI coding agent），它会自己读官方 INSTALL.md，自己装、自己配、装完跑通验证：

```
Follow https://raw.githubusercontent.com/chenhg5/cc-connect/refs/heads/main/INSTALL.md to install and configure cc-connect.
```

为什么这是最优解：INSTALL.md 是项目作者持续更新的"事实文档"，AI 拿到 URL 自己 fetch、自己跟着步骤来，比你照着教程手动敲少踩坑——版本变了、参数改了它会跟着改。这也是 cc4pm 一直强调的"工具配置交给 AI"的典型用法。

如果你坚持自己来，三种手动方式：

```bash
# 方式一：npm（最简单）
npm install -g cc-connect

# 方式二：Go
go install github.com/chenhg5/cc-connect@latest

# 方式三：下载预编译二进制
# https://github.com/chenhg5/cc-connect/releases
```

验证安装：

```bash
cc-connect --version
```

## 第二步：初始化配置

```bash
# 创建配置目录
mkdir -p ~/.cc-connect

# 用 Web UI 配置（推荐，可视化操作）
cc-connect web
```

浏览器会打开管理面板，可以可视化创建项目、添加平台、管理 provider。也可以手动编辑：

```bash
# 或者手动创建配置文件
vim ~/.cc-connect/config.toml
```

## 第三步：编写 config.toml

这是最关键的一步。下面是一个**完整的、可用的配置模板**——但请先看下面这条总原则。

> **总原则：整个 TOML 都不必你亲自改**
>
> 模板放在这里是为了你心里有全貌，不是要你照抄。和方式零（丢 INSTALL.md URL）的玩法一样，后面所有配置动作都可以扔给 Claude：
>
> - "把我的微信 wxid `o9cq...` 加到 `admin_from`" → Claude 读 config.toml、改字段、保存
> - "把 cc-connect 装成开机自启" → 它跑 `daemon install` 给你看
> - "切到第三方中转 `api.xxx.com`" → 它知道要加 `base_url`、改 Bearer 认证
> - "加一个每周一早 8 点汇总销售数据的任务" → 它直接调 `CronCreate`
>
> 你的工作是**说清楚想要什么**，TOML 怎么写、命令怎么敲、字段在哪一层是 Claude 该操心的事。后面章节出现的命令和配置，本质上都是给你"知道发生了什么"用的。


```toml
# ~/.cc-connect/config.toml

# ==================== 全局设置 ====================
language = "zh"           # 消息语言：en / zh / auto

[log]
level = "info"

# ==================== API 提供商 ====================
# 直连 Anthropic 官方（需要 ANTHROPIC_API_KEY 环境变量）
[[providers]]
name = "anthropic"
api_key = "${ANTHROPIC_API_KEY}"
agent_types = ["claudecode"]

# 如果用第三方中转，改成这样：
# [[providers]]
# name = "relay"
# api_key = "sk-your-relay-key"
# base_url = "https://api.relay-service.com/v1"
# model = "claude-sonnet-4-20250514"
# agent_types = ["claudecode"]
# [providers.env]
# HTTP_PROXY = "http://127.0.0.1:7890"

# ==================== 项目 ====================
[[projects]]
name = "my-project"
admin_from = ""         # 管理员 wxid，拥有 /dir 等敏感命令权限

[projects.agent]
type = "claudecode"
provider_refs = ["anthropic"]       # 引用上面的 provider 名称

[projects.agent.options]
work_dir = "/Users/you/my-project"  # 项目目录（CLAUDE.md 从这里加载）
mode = "acceptEdits"                # 默认权限模式

# ==================== 平台：微信 ====================
[[projects.platforms]]
type = "weixin"
allow_from = ""     # 留空 = 不限制；或填 wxid（微信发 /whoami 获取）
```

> **权限模型**：cc-connect 区分普通用户和管理员。`/dir`（切换工作目录）等敏感操作需要管理员权限。配置方法：
> 1. 如果已配 `allow_from`，直接复用该值；否则微信发 `/whoami` 获取 wxid
> 2. 把 wxid 填入 `[[projects]]` 层级的 `admin_from` 字段（多个管理员用逗号分隔）
> 3. `allow_from`（platform 层级）控制谁能使用 bot；`admin_from`（project 层级）控制谁能执行敏感命令
>
> ```toml
> [[projects]]
> name = "my-project"
> admin_from = "wxid_abc123"               # 管理员
>
> [[projects.platforms]]
> type = "weixin"
> allow_from = "wxid_abc123,wxid_def456"   # 只允许这两个用户使用
> ```

> **自定义环境变量**：如果你需要给 Claude Code 子进程注入额外的环境变量（比如代理、自定义 API 地址、数据库连接等），在对应的 provider 下加 `[providers.env]` 段：
>
> ```toml
> [[providers]]
> name = "my-provider"
> api_key = "sk-xxx"
> base_url = "https://api.example.com/v1"
>
> [providers.env]
> ANTHROPIC_BASE_URL = "https://api.example.com/v1"
> HTTP_PROXY = "http://127.0.0.1:7890"
> DATABASE_URL = "postgresql://localhost/mydb"
> ```
>
> 这些变量会直接注入 Claude Code 子进程的环境，Claude 在执行命令时可以直接使用。

### Provider 配置详解

环境变量的注入链路：

```
providerEnvLocked()
    ├── ANTHROPIC_BASE_URL  = provider.base_url
    ├── ANTHROPIC_AUTH_TOKEN = provider.api_key  （有 base_url 时用 Bearer 认证）
    ├── ANTHROPIC_MODEL      = provider.model
    └── provider.env.*       → 直接注入子进程（你的自定义变量）
```

| 配置项 | 作用 | 示例 |
|---|---|---|
| `base_url` | 自定义 API 端点 | `https://api.relay.com/v1` |
| `api_key` | API 密钥 | `sk-xxx` |
| `model` | 默认模型 | `claude-sonnet-4-20250514` |
| `thinking` | 控制 thinking 模式 | `"disabled"` （不支持 thinking 的中转） |
| `env` | 任意自定义环境变量 | `HTTP_PROXY`, `CUSTOM_VAR` 等 |

> **为什么要用 Bearer 认证？** 当你配了 `base_url` 指向第三方中转时，Claude Code 会用 `ANTHROPIC_AUTH_TOKEN`（Bearer）而不是 `ANTHROPIC_API_KEY`（x-api-key），避免对 api.anthropic.com 的密钥校验卡住。

## 第四步：绑定微信

```bash
cc-connect weixin setup --project my-project
```

1. 终端显示二维码
2. 用微信扫码确认
3. 自动写入 token 到 config.toml

## 第五步：启动服务

```bash
# 前台运行（调试用，能看到日志输出）
cc-connect

# 或指定项目
cc-connect start --project my-project
```

### 验证是否成功

1. 在微信中给绑定的账号发一条消息，比如 `你好`
2. 等 1-3 秒，应该收到 Claude 的回复
3. 发 `/whoami` 查看你的 wxid（用于配置 `allow_from` 白名单）
4. 发 `/status` 查看当前会话状态、模型、provider 信息

### 出错了？查日志

```bash
# 前台运行时，日志直接输出到终端
cc-connect

# 已经在跑 daemon？看日志
cc-connect daemon logs -f

# 或直接看日志文件
cat ~/.cc-connect/logs/cc-connect.log | tail -50
```

常见问题：

| 现象 | 原因 | 解决 |
|---|---|---|
| 发消息没回复 | `claude` 命令找不到 | 确认 `which claude` 有输出 |
| 扫码后 token 失效 | ilink 会话过期 | 重新 `cc-connect weixin setup` |
| 回复很慢 | API 中转延迟或模型选择 | 检查 provider 配置 |
| 权限报错 | Claude Code 模式太严格 | 发 `/mode acceptEdits` 放宽 |

### 常用微信命令

> **最重要的命令是 `/help`**——在微信里发 `/help` 可以查看所有可用命令的完整列表和说明。

| 命令 | 作用 |
|---|---|
| `/help` | 查看所有命令（最重要，忘了就发这个） |
| `/new [name]` | 新建会话（可选命名） |
| `/list` | 列出所有会话 |
| `/switch` | 切换到其他会话 |
| `/name` | 给当前会话命名 |
| `/current` | 查看当前会话信息 |
| `/history` | 查看历史消息 |
| `/search` | 搜索会话 |
| `/dir <path>` | 切换工作目录（需要 admin 权限，见下方 `admin_from`） |
| `/whoami` | 查看你的 wxid（用于配置白名单） |
| `/mode` | 查看/切换权限模式 |
| `/model` | 切换模型 |
| `/compress` | 压缩上下文 |
| `/status` | 查看当前会话状态、模型、provider 信息 |
| `/cron` | 定时任务管理（add/del/enable/disable） |

### `/dir` 实战：运行时切换工作目录

`/dir` 是最实用的微信端命令之一——不用改配置、不用重启服务，直接在聊天里切换 Claude Code 的工作目录。

**两种目录切换方式对比**：

| 方式 | 操作 | 适用场景 | 是否需要重启 |
|------|------|----------|-------------|
| 配置文件 | 编辑 `config.toml` 的 `work_dir` | 永久切换默认项目目录 | 是 |
| `/dir` 命令 | 微信里发 `/dir <path>` | 运行时临时切换到其他项目 | 否 |

**使用步骤**：

1. 获取你的 wxid。如果 config.toml 中已经配置了 `allow_from`，直接复用该值即可，无需再发 `/whoami`：
   ```toml
   # 已有配置 → 直接把 allow_from 的值复制给 admin_from
   allow_from = "o9cq800IQyoglQzOCaarDlrTCPQc@im.wechat"
   admin_from = "o9cq800IQyoglQzOCaarDlrTCPQc@im.wechat"  # 复用同一个值
   ```
   如果没有配过 `allow_from`，先在微信里发 `/whoami` 获取 wxid
2. 在 config.toml 的 `[[projects]]` 层级配置管理员权限：
   ```toml
   [[projects]]
   name = "my-project"
   admin_from = "wxid_abc123"                # 管理员，可执行 /dir 等敏感命令

   [[projects.platforms]]
   type = "weixin"
   allow_from = "wxid_abc123"                # 允许使用的用户
   ```
3. 重启服务：`cc-connect daemon restart`
4. 微信里发 `/dir /path/to/another-project` 即可切换

**典型场景**：

```
你：/dir /Users/me/project-alpha
Bot：✅ 工作目录已切换到 /Users/me/project-alpha

你：看看当前的 git status
Bot：（Claude Code 在 project-alpha 目录下执行 git status）

你：/dir /Users/me/project-beta
Bot：✅ 工作目录已切换到 /Users/me/project-beta
```

> **注意**：`/dir` 切换后，Claude Code 子进程会加载新目录的 `CLAUDE.md`，但**不会自动清除之前的上下文**。如果两个项目差异很大，建议 `/dir` 后再发 `/new` 开一个干净的会话。

> **多管理员**：`admin_from` 支持多个 wxid，用逗号分隔：
> ```toml
> [[projects]]
> name = "my-project"
> admin_from = "wxid_abc123,wxid_def456"
> ```

## 会话管理与上下文溢出防护

每次微信发消息，cc-connect 都会追加到同一个 Claude Code 子进程的会话里。如果不干预，上下文会持续累积直到爆满。cc-connect 提供了**三层防御机制**。

### 第一层：Auto-Compress（自动压缩）

在 config.toml 中开启：

```toml
[projects.auto_compress]
enabled = true
max_tokens = 12000      # token 数超过阈值自动触发 /compress
min_gap_mins = 30       # 两次自动压缩之间最少间隔 30 分钟
```

| 参数 | 默认值 | 说明 |
|---|---|---|
| `enabled` | `false` | 默认关闭，需手动开启 |
| `max_tokens` | `12000` | 估算 token 阈值，超过即触发压缩 |
| `min_gap_mins` | `30` | 最小压缩间隔，防止频繁压缩 |

> **实现原理**：cc-connect 通过 `ContextCompressor` 接口调用 Claude Code 的 `/compact` 命令。不同 Agent 支持度不同——Claude Code 原生支持，Gemini CLI 和 Codex 不支持（返回空字符串，cc-connect 会回复"不支持压缩"）。

### 第二层：手动 /compress

在微信里直接发 `/compress`，cc-connect 会转发给 Claude Code 执行上下文压缩。适合你感觉到回复变慢或质量下降时主动操作。

### 第三层：Context Indicator（上下文指示器）

cc-connect 可以在回复末尾自动附加 `[ctx: ~75%]` 这样的标记，让你实时看到上下文占用比例。配置项：

```toml
[projects]
show_context_indicator = true   # 在回复末尾显示上下文占用百分比
```

这样你就能在爆掉之前主动 `/compress` 或 `/new` 开新会话。

### 会话生命周期管理

| 方式 | 命令/配置 | 说明 |
|---|---|---|
| 主动新建 | `/new [name]` | 立即开新会话，旧会话保留可 `/switch` 回去 |
| 查看历史 | `/list` | 列出所有会话 |
| 切换会话 | `/switch` | 切换到其他历史会话 |
| 空闲重置 | `reset_on_idle_mins` | 会话空闲超过指定时间自动重置 |

`reset_on_idle_mins` 配置示例：

```toml
[projects]
reset_on_idle_mins = 120   # 空闲 2 小时后自动重置会话
```

### 推荐配置

```toml
# 完整的会话管理配置
[[projects]]
name = "my-project"

[projects.auto_compress]
enabled = true
max_tokens = 12000
min_gap_mins = 30

[projects]
reset_on_idle_mins = 120
show_context_indicator = true
```

### 会话溢出的兜底机制

即使 cc-connect 没配 auto-compress，Claude Code 自身也有**自动 compaction**——当上下文接近极限（通常 80-95%）时，会自动压缩早期消息。但自动 compaction 会丢失一些上下文细节，所以建议始终开启 `auto_compress`。

```
会话累积 → auto_compress 兜底 → Claude Code 自动 compaction 兜底
         ↑ 手动 /compress       ↑ 最终防线
```

## 第六步：Daemon 常驻运行

前台运行一关终端就没了。让 cc-connect 作为系统服务常驻：

```bash
# 安装为系统服务（macOS 用 launchd，Linux 用 systemd）
cc-connect daemon install --config ~/.cc-connect/config.toml

# 管理命令
cc-connect daemon start       # 启动
cc-connect daemon stop        # 停止
cc-connect daemon restart     # 重启
cc-connect daemon status      # 查看状态
cc-connect daemon logs -f     # 实时查看日志
cc-connect daemon uninstall   # 卸载服务
```

**原理**：自动生成 macOS 的 plist 文件（`~/Library/LaunchAgents/com.cc-connect.service.plist`）或 Linux 的 systemd unit 文件，配置 `RunAtLoad=true`（开机自启）和 `KeepAlive`（崩溃自动重启）。

## 第七步：Cron 定时任务

让 Claude Code 定时自动执行任务，结果自动发到微信：

### 最简单：直接用人话说

你不需要记住 cron 表达式。Claude Code 自带 `CronCreate` 工具，会把自然语言翻译成 cron。微信里直接说什么都行，几个跨岗位的例子：

```
（程序员）每个工作日早上 9 点检查 CI 状态，把失败的测试列给我

（销售）每周一早 8 点把上周客户邮件按"待回复 / 已成交 / 流失风险"分类

（运营）每周一早 9 点把上周销售数据按渠道汇总成 Excel 发到我的微信

（PM）每周五下午 5 点扫一遍飞书或钉钉里本周延期或停滞的项目卡片

（任何人）每天晚 10 点把 Downloads 里当天可归档的文件移到对应目录
```

Claude 自己把这些翻译成 `0 9 * * 1-5`、`0 8 * * 1` 之类的表达式并创建任务，到点自动跑、结果发回微信——比手敲 `*/30 * * * *` 自然得多。

> **小知识**：`CronCreate` 是 Claude Code 内置的官方工具，不是 cc-connect 加的。把同一个 Claude Code 接到飞书、Telegram、终端任何地方，自然语言下定时任务的能力都还在——cc-connect 改的只是这个能力的"触达通道"，不是能力本身。

### 用 cron 表达式精确控制

如果你已经熟悉 cron 表达式、想要精确控制，也可以手动下发：

```
/cron add 0 6 * * * Summarize GitHub trending repos
```

### CLI 创建

```bash
cc-connect cron add \
  --cron "0 9 * * 1-5" \
  --prompt "检查 CI 状态，汇报失败的测试" \
  --work-dir /Users/you/my-project \
  --mode acceptEdits \
  --desc "工作日 CI 巡检"
```

### 管理命令

```
/cron              # 列出所有定时任务
/cron del <id>     # 删除
/cron enable <id>  # 启用
/cron disable <id> # 禁用
```

### Cron 配置选项

```toml
# config.toml 中的全局 cron 设置
[cron]
silent = false           # true = 不发送"⏰ 任务开始"通知
session_mode = "reuse"   # "reuse" 复用会话 / "new_per_run" 每次新建
```

每个 cron job 可以单独覆盖：

| 参数 | 作用 | CLI 参数 |
|---|---|---|
| `work_dir` | 指定项目目录 | `--work-dir` |
| `mode` | 权限模式 | `--mode` |
| `session_mode` | 会话策略 | `--session-mode` |
| `timeout_mins` | 超时时间（默认 30 分钟） | `--timeout-mins` |

> **会话策略**：`reuse`（默认）复用当前活跃会话，保持上下文连续；`new_per_run` 每次新建会话，适合独立任务，避免污染用户的对话。

### 定时任务 vs Claude Code 原生 Cron

| 维度 | cc-connect cron | Claude Code CronCreate |
|---|---|---|
| 持久化 | `jobs.json`，进程重启恢复 | `.claude/scheduled_tasks.json` |
| 结果回传 | 自动发到微信/飞书 | 只在终端显示 |
| 过期策略 | 不过期 | 7 天自动删除 |
| 适用场景 | 无人值守、定时汇报 | 会话内临时提醒 |

## 支持的平台

cc-connect 不只支持微信，还支持 **11 个聊天平台**：

| 平台 | 文本 | 图片/文件 | 语音 | 群聊 |
|---|---|---|---|---|
| **微信（个人）** | ✅ | ✅ | ✅ | ✅ |
| 飞书 | ✅ | ✅ | ⚠️ | ✅ |
| 钉钉 | ✅ | ✅ | ⚠️ | ✅ |
| Telegram | ✅ | ✅ | ✅ | ✅ |
| Slack | ✅ | ✅ | ⚠️ | ✅ |
| Discord | ✅ | ✅ | ⚠️ | ✅ |
| 企业微信 | ✅ | ✅ | ⚠️ | ✅ |
| LINE | ✅ | ⚠️ | ❌ | ⚠️ |
| QQ | ✅ | ✅ | ⚠️ | ✅ |
| 微博私信 | ✅ | ❌ | ❌ | ❌ |

## 支持的 AI Agent

除了 Claude Code，还支持：

- **Codex**（OpenAI）
- **Cursor Agent**
- **Gemini CLI**
- **Kimi CLI**
- **OpenCode**
- **Devin**
- 任何支持 [Agent Client Protocol (ACP)](https://agentclientprotocol.com/get-started/agents) 的 agent

## FAQ

**Q: 需要公网 IP 吗？**
A: 不需要。ilink 长轮询由客户端主动拉取，家庭网络、公司内网都能用。

**Q: 安全性如何？**
A: 消息走腾讯官方 ilink 网关，Bearer Token 认证。建议配 `allow_from` 白名单 + `default` 权限模式。

**Q: 和打开电脑用 Claude Code 比呢？**
A: cc-connect 解决的是"不在电脑前"的场景——微信扫码即用，支持图片/语音，聊天式交互。坐在电脑前当然直接用 Claude Code CLI 或网页端体验更好，但 cc-connect 的价值在于你出门在外时也能随时处理任务。

**Q: 能用来做 CI/CD 通知吗？**
A: 可以。cc-connect 支持 webhook 模式，GitHub Actions 等 CI 工具可以在构建完成时发微信通知。配置 `[webhook]` 段即可。

**Q: 支持多个项目吗？**
A: 支持。一个 cc-connect 进程可以管理多个 `[[projects]]`，每个项目独立的 agent + 平台 + work_dir。

**Q: `/dir` 提示需要管理员权限怎么办？**
A: `/dir` 是敏感命令，需要管理员权限。如果 config.toml 中已有 `allow_from` 配置，直接把同一个值赋给 `admin_from` 即可；否则先微信发 `/whoami` 获取 wxid。然后 `cc-connect daemon restart` 重启。详见上方「`/dir` 实战：运行时切换工作目录」小节。

**Q: 会话会一直累积吗？上下文爆掉怎么办？**
A: 会累积，但有三层防御：(1) 配置 `auto_compress` 自动压缩；(2) 微信发 `/compress` 手动压缩；(3) Claude Code 自身的自动 compaction 兜底。另外 `reset_on_idle_mins` 可以让空闲会话自动重置。详见"会话管理与上下文溢出防护"章节。

## 拓展阅读

- [cc-connect GitHub 仓库](https://github.com/chenhg5/cc-connect)
- [cc-connect 使用文档（中文）](https://github.com/chenhg5/cc-connect/blob/main/docs/usage.zh-CN.md)
- [微信接入指南](https://github.com/chenhg5/cc-connect/blob/main/docs/weixin.md)
- [配置文件示例](https://github.com/chenhg5/cc-connect/blob/main/config.example.toml)

## 课后思考

1. 你的项目中，哪些任务适合用 cron 定时自动执行？
2. 如果要给团队多人共享 Claude Code，`allow_from` 白名单 + `admin_from` 管理员怎么配合？
3. 除了微信，你还想用哪个平台连接 Claude Code？为什么？

---

## 下一步

- [1] 返回 Lesson 24：高级特性
- [2] 前往 Lesson 25：完整项目实战
- [3] 返回主菜单

---
*阶段 5 | Lesson 24.6/26 | 上一课: Lesson 24.5 - graphify 知识图谱 | 下一课: Lesson 25 - 完整项目实战*
