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
> **适合人群**：想在手机上用微信操控 Claude Code 的所有人
>
> **项目地址**：[github.com/chenhg5/cc-connect](https://github.com/chenhg5/cc-connect)

## 学习目标

- 从零搭建微信 ↔ Claude Code 的桥接服务
- 配置自定义 API 提供商和环境变量
- 掌握会话管理与上下文溢出防护（auto-compress、context indicator、reset-on-idle）
- 设置 daemon 常驻运行，开机自启
- 用 cron 定时任务实现无人值守自动化

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

```bash
# 方式一：npm（推荐，最简单）
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

这是最关键的一步。下面是一个**完整的、可用的配置模板**：

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
admin_from = ""     # 管理员 wxid，拥有 /dir 等敏感命令权限
```

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

### 聊天中创建

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

**Q: 和 SSH + Claude Code CLI 比呢？**
A: cc-connect 更适合移动场景——微信扫码即用，支持图片/语音，聊天式交互。SSH 更适合开发者日常——低延迟、终端体验。

**Q: 能用来做 CI/CD 通知吗？**
A: 可以。cc-connect 支持 webhook 模式，GitHub Actions 等 CI 工具可以在构建完成时发微信通知。配置 `[webhook]` 段即可。

**Q: 支持多个项目吗？**
A: 支持。一个 cc-connect 进程可以管理多个 `[[projects]]`，每个项目独立的 agent + 平台 + work_dir。

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
