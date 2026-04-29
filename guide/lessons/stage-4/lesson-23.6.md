# Lesson 23.6: CLIProxyAPI 实战——用 Gemini 免费额度驱动 Claude Code

## 本课目标

- 理解 CLIProxyAPI 的定位：一个多模型代理服务器，将 Gemini/GPT/Claude 统一为一个本地 API
- 掌握 Gemini CLI OAuth 登录，利用 Google 免费额度零成本调用 Gemini 模型
- 完成从安装、配置到 Claude Code 对接的全流程
- 了解多账号轮询、配额自动切换等进阶技巧

> **这堂课解决什么问题？**
> Claude Code 原生只能连接 Anthropic 付费 API。Lesson 23.5 介绍了 `ccc` 将国产大模型接入的方案，但那依赖第三方 API Key。CLIProxyAPI 走的是另一条路——通过 **Gemini CLI 的 OAuth 免费额度**，让你在不花一分钱的情况下获得 Gemini 2.5 Pro / Flash 的能力，并且 Claude Code 的操作体验完全不变。

## 核心内容

### 1. CLIProxyAPI 是什么？

CLIProxyAPI（[原项目仓库](https://github.com/router-for-me/CLIProxyAPI)）是一个轻量级代理服务器，它把多种 AI 模型提供商的接口统一成 OpenAI / Claude 兼容格式。

**除了本课重点介绍的 Gemini CLI OAuth 免费额度，它还支持接入和整合以下资源：**
- **Antigravity**（支持特殊的免 key 渠道）
- **Google AI Studio**（直接配置 Gemini API Key）
- **Codex / Codex Compatibility**（GitHub Copilot 补全后端代理）
- **Gemini Compatibility**（兼容 Gemini 格式的其他平台）
- **OpenAI / Claude Compatibility** 等第三方聚合平台



```
┌───────────────────────────────────────────────────────┐
│                    你的 AI 工具                        │
│  Claude Code / Codex / Gemini CLI / 任意 OpenAI 客户端 │
└──────────────────────┬────────────────────────────────┘
                       │ http://127.0.0.1:8317
                       ▼
┌───────────────────────────────────────────────────────┐
│                  CLIProxyAPI                           │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐ │
│  │Gemini   │  │Claude    │  │OpenAI   │  │国产模型 │ │
│  │OAuth    │  │API Key   │  │兼容     │  │(Kimi等) │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └───┬────┘ │
└───────┼────────────┼────────────┼────────────┼───────┘
        ▼            ▼            ▼            ▼
   Google AI    Anthropic    OpenRouter    月之暗面...
```

**核心价值：**
- **免费额度利用**：Gemini CLI OAuth 走 Google 免费配额，不需要 API Key
- **多账号负载均衡**：多个 Google 账号轮询，突破单账号速率限制
- **统一入口**：一个端口，所有模型

### 2. 安装

```bash
# macOS (Homebrew)
brew install cliproxyapi

# Linux (一键安装)
curl -fsSL https://raw.githubusercontent.com/router-for-me/Cli-Proxy-API/main/install.sh | bash

# Arch Linux
yay -S cli-proxy-api-bin

# Docker
docker run -d -p 8317:8317 -v ~/.cli-proxy-api:/root/.cli-proxy-api cliproxyapi/cliproxyapi
```

安装后验证：
```bash
cliproxyapi --version
# CLIProxyAPI Version: 6.9.30 ...
```

### 3. Gemini CLI OAuth 登录

这是关键步骤——通过 Google OAuth 获取免费额度的认证令牌：

```bash
cliproxyapi --login
```

浏览器自动弹出 Google 登录页面。登录后选择项目（直接回车用默认项目即可），认证文件会保存到 `~/.cli-proxy-api/` 目录。

**远程环境（无浏览器）：**
```bash
cliproxyapi --login --no-browser
# 手动复制打印的 URL 到浏览器完成登录
```

**多账号（推荐）：** 重复执行 `--login` 登录不同 Google 账号，CLIProxyAPI 会自动轮询分发请求，有效突破单账号的速率限制（RPM/TPM）。

### 4. 配置文件

配置文件路径：
- **macOS Homebrew Intel**：`/usr/local/etc/cliproxyapi.conf`
- **macOS Homebrew Apple Silicon**：`/opt/homebrew/etc/cliproxyapi.conf`
- **手动指定**：`cliproxyapi --config /path/to/config.yaml`

最小化配置（只使用 Gemini OAuth 免费额度）：

```yaml
# 仅允许本地访问
host: "127.0.0.1"
port: 8317

# OAuth 认证目录（登录后自动生成凭证文件）
auth-dir: "~/.cli-proxy-api"

# 本地认证 key（Claude Code 连接时使用）
api-keys:
  - "sk-local-gemini"

# 请求失败重试
request-retry: 3

# 多账号轮询策略
routing:
  strategy: "round-robin"

# 配额用尽时自动切换
quota-exceeded:
  switch-project: true
  switch-preview-model: true
```

> **注意**：不需要配置 `gemini-api-key`。我们走的是 OAuth 免费额度，不是付费 API Key。

### 5. 启动服务

```bash
# macOS Homebrew（后台服务）
brew services start cliproxyapi

# 或前台运行（方便看日志）
cliproxyapi --config /usr/local/etc/cliproxyapi.conf
```

验证服务是否正常：
```bash
# 注意：如果你有本地代理（如 Clash），需要绕过
curl --noproxy '*' http://127.0.0.1:8317/v1/models \
  -H "Authorization: Bearer sk-local-gemini"
```

成功时会返回可用的 Gemini 模型列表：
```json
{
  "data": [
    {"id": "gemini-2.5-pro", "owned_by": "google"},
    {"id": "gemini-2.5-flash", "owned_by": "google"},
    {"id": "gemini-2.5-flash-lite", "owned_by": "google"},
    {"id": "gemini-3-pro-preview", "owned_by": "google"}
  ]
}
```

### 6. 对接 Claude Code

在 `~/.zshrc`（或 `~/.bashrc`）中添加环境变量：

```bash
# CLIProxyAPI → Gemini CLI OAuth (供 Claude Code 使用)
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-local-gemini
export ANTHROPIC_DEFAULT_OPUS_MODEL=gemini-2.5-pro
export ANTHROPIC_DEFAULT_SONNET_MODEL=gemini-2.5-flash
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gemini-2.5-flash

# 确保本地请求不走代理（如果你有 Clash 等代理软件）
export NO_PROXY=127.0.0.1,localhost,$NO_PROXY
export no_proxy=127.0.0.1,localhost,$no_proxy
```

生效并重启 Claude Code：
```bash
source ~/.zshrc
claude
```

此时 Claude Code 的所有请求链路变为：

```
Claude Code → localhost:8317 (CLIProxyAPI) → Gemini OAuth → Google AI
```

### 7. 模型选择建议

CLIProxyAPI 会暴露 OAuth 账号下所有可用的 Gemini 模型。根据场景选择：

| 场景 | 推荐模型 | 映射到 |
|------|----------|--------|
| 复杂推理、架构设计 | `gemini-2.5-pro` | OPUS |
| 日常编码、快速迭代 | `gemini-2.5-flash` | SONNET / HAIKU |
| 轻量任务、批量处理 | `gemini-2.5-flash-lite` | HAIKU |
| 尝鲜最新能力 | `gemini-3-pro-preview` | OPUS |

如果你想用最新的 Gemini 3 系列替代：
```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL=gemini-3-pro-preview
export ANTHROPIC_DEFAULT_SONNET_MODEL=gemini-3-flash-preview
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gemini-2.5-flash-lite
```

### 8. 接入 Google AI Studio（WebSocket 方案）

除了 Gemini CLI OAuth，CLIProxyAPI 还支持通过 **AI Studio WebSocket** 接入——借用浏览器登录态，走 AI Studio 账号的免费配额。

#### 工作原理

```
浏览器（你登录的 Google 账号）
    │  WebSocket  ws://127.0.0.1:8317/v1/ws
    ▼
CLIProxyAPI（本地，同一个 8317 端口）
    │
    ▼
Google AI（以你的 AI Studio 账号身份请求）
```

本质上和在 AI Studio 网页直接聊天是同一回事——CLIProxyAPI 通过 WebSocket 把浏览器的登录态"借"过来，Google 看到的请求者是你的账号，走的是 AI Studio 的免费配额。

#### 和 Gemini CLI OAuth 的关系

两者**不冲突**，同在 8317 端口下作为不同 Provider 共存：

| | Gemini CLI OAuth | AI Studio WebSocket |
|--|--|--|
| 认证方式 | 离线 token 文件 | 浏览器实时会话 |
| 浏览器需要开着 | 否 | **是** |
| 配额来源 | Gemini CLI 免费配额 | AI Studio 免费配额 |
| 稳定性 | 高（token 长期有效） | 依赖浏览器标签 |

两者同时在线时，CLIProxyAPI 按 `round-robin` 轮询，相当于**双倍免费额度**，一条断了另一条自动顶上。

#### 接入步骤

**Step 1：确认 CLIProxyAPI 正在运行**

```bash
curl --noproxy '*' http://127.0.0.1:8317/v1/models \
  -H "Authorization: Bearer sk-local-gemini"
# 返回模型列表即正常
```

**Step 2：在浏览器登录 Google 账号，打开 AI Studio App**

```
https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL
```

> Brave 浏览器需关闭 Shields；其他带广告拦截器的浏览器同理。

**Step 3：修改 WebSocket 连接地址**

AI Studio App 默认连接 `ws://127.0.0.1:8317`（根路径），但 CLIProxyAPI 的 WebSocket 端点实际在 `/v1/ws`。需要在 App 的 `config.ts` 中将 `WEBSOCKET_PROXY_URL` 改为：

```
ws://127.0.0.1:8317/v1/ws
```

> **为什么要加路径？** CLIProxyAPI 在根路径 `/` 只提供 HTTP REST（返回 200），WebSocket 升级握手（101）只在 `/v1/ws` 响应。

**Step 4：验证连接**

App 显示 `WebSocket Proxy Status: CONNECTED` 即成功。可用以下命令端到端验证：

```bash
curl --noproxy '*' http://127.0.0.1:8317/v1/chat/completions \
  -H "Authorization: Bearer sk-local-gemini" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-flash","messages":[{"role":"user","content":"Reply with exactly: OK"}],"max_tokens":10}'
```

返回 `"content":"OK"` 且 `finish_reason: stop` 说明链路完整。

#### 安全说明

- 配置 `host: "127.0.0.1"` 时，端口仅本机可访问，外网无法触达
- 请求以你的 Google 账号身份发出，消耗你的 AI Studio 配额
- 不要将 `sk-local-gemini` 分享给他人，不要将 `host` 改为 `0.0.0.0`
- 浏览器标签关闭后 WebSocket 断开，AI Studio Provider 自动下线

### 10. 进阶：混合多 Provider 与生态大一统

CLIProxyAPI 的强大之处在于它可以把**各种前沿大模型的 API 和工具链，全都统一到 Claude Code 的生态下**。

这反映出一个非常重要的趋势：**Claude Code 正在成为目前最强、最通用的 Agent Runtime（代理运行环境）**。围绕着它的生态正在变得越来越强大，它不仅仅是一个只能跑 Anthropic 模型的命令行工具，而是一个可以驱动各种底层 LLM 的超级大脑外壳。

#### 10.1 整合第三方模型 (以 OpenRouter 为例)
你可以同时配置 Gemini OAuth（免费）+ OpenRouter（付费兜底）：

```yaml
# config.yaml 追加
openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    api-key-entries:
      - api-key: "sk-or-v1-你的key"
    models:
      - name: "deepseek/deepseek-chat"
        alias: "deepseek-v3"
      - name: "google/gemini-2.5-pro"
        alias: "openrouter-gemini-pro"
```
这样当 Gemini OAuth 额度耗尽时，可以手动或自动切换到 OpenRouter。

#### 10.2 代理 GitHub Copilot (Codex)
如果你在使用带有 Copilot 的编辑器，CLIProxyAPI 甚至能拦截和接管它的后端请求，只需一行命令授权：

```bash
cliproxyapi --codex-login
```
*(如果没有浏览器，加上 `--no-browser` 会打印出带有 token 的验证链接。本地 OAuth 回调端口默认为 `1455`。)*

通过这种方式，你的本地开发工具链（包括 Claude Code、Copilot 等）的底层模型，都可以被你完全掌控和按需切换，再也不必受限于单一平台的配额或定价。

## 成本对比

| 方案 | 每日成本 | 适合场景 |
|------|---------|---------|
| Anthropic 原生 API | $5-50+ | 需要 Claude 原生能力 |
| ccc + 国产模型 (Lesson 23.5) | $0.5-5 | 国内网络、重复性任务 |
| **CLIProxyAPI + Gemini OAuth** | **$0** | 日常开发、学习、个人项目 |
| CLIProxyAPI + OpenRouter 兜底 | $0-5 | 免费为主，付费兜底 |

## 常见问题

**Q: Gemini OAuth 的免费额度有多少？**
A: Google 免费配额有 RPM（每分钟请求数）和 TPM（每分钟 token 数）限制，具体额度随 Google 政策调整。多账号轮询可以有效缓解。当配额耗尽时，CLIProxyAPI 会自动尝试切换项目或预览模型。

**Q: 响应质量和直连 Claude API 有差异吗？**
A: 底层模型从 Claude 换成了 Gemini，所以**是不同的模型**。Gemini 2.5 Pro 在代码生成方面表现优秀，但在某些 Claude 特有的能力（如长文分析、特定指令遵循）上可能有差异。建议复杂任务仍使用 Claude 原生 API。

**Q: 本地有代理软件（Clash/V2Ray）怎么办？**
A: 必须设置 `NO_PROXY=127.0.0.1,localhost`，否则 Claude Code 的请求会被代理拦截导致 502 错误。已包含在上面的环境变量配置中。

**Q: 和 Lesson 23.5 的 ccc 可以一起用吗？**
A: 可以。CLIProxyAPI 负责提供模型接口，ccc 负责 Supervisor 审查。你可以让 CLIProxyAPI 作为底层 Provider，ccc 作为上层质量控制。

## 🛠️ 实操练习

### 练习 1：完成基础对接
1. 安装 CLIProxyAPI：`brew install cliproxyapi`
2. 登录 Gemini OAuth：`cliproxyapi --login`
3. 写入最小配置文件
4. 启动服务并验证模型列表
5. 配置环境变量，用 Claude Code 发一条消息确认链路通畅

### 练习 2：多账号轮询
用第二个 Google 账号再次执行 `cliproxyapi --login`，然后观察 `~/.cli-proxy-api/` 目录下的凭证文件。连续发送多条请求，观察 CLIProxyAPI 日志中的账号切换。

### 练习 3：对比模型表现
分别用 `gemini-2.5-pro` 和 `gemini-2.5-flash` 完成同一个编码任务（如"给这个文件加单元测试"），对比响应速度和质量。思考什么场景该用哪个模型。

## 下一步

- [1] 进入阶段 5：高级应用与持续优化
- [2] 返回 Lesson 23.5 对比 ccc 方案
- [3] 退出学习

---
*阶段 4 | Lesson 23.6/26 | 上一课: Lesson 23.5 - ccc 实战 | 下一课: Lesson 24 - 高级特性（阶段 5）*
