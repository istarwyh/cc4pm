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

浏览器自动弹出 Google 登录页面。认证文件会保存到 `~/.cli-proxy-api/` 目录。

**⚠️ 有 Clash/V2Ray 等代理软件时（macOS 常见场景）：**

直接运行 `cliproxyapi --login` 可能遇到两种失败：
- 若代理**未运行**：token 交换时访问 `oauth2.googleapis.com` 超时
- 若代理**已运行**：回调 `localhost:8085` 被代理拦截，浏览器提示 `localhost refused to connect`

正确做法——**带上代理变量，同时排除 localhost**：

```bash
http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890 \
  NO_PROXY=127.0.0.1,localhost \
  cliproxyapi --login
```

> 把 `7890` 替换为你实际的代理端口（ClashX 默认 7890，V2Ray 常见 10809）。

**登录模式选择：** 认证成功后会提示选择模式：

```
1. Code Assist  (GCP project, manual selection)
2. Google One   (personal account, auto-discover project)
```

个人用户输入 `2`，CLIProxyAPI 会自动发现并绑定 GCP 项目，无需手动操作。成功后凭证文件保存为 `~/.cli-proxy-api/gemini-<邮箱>-<项目ID>.json`。

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

> **提示**：Homebrew 安装后配置文件已自动生成（内容全为注释的模板）。只需修改两处即可用于 Gemini OAuth：将 `host: ""` 改为 `host: "127.0.0.1"`，将 `api-keys` 下的占位 key 替换为 `sk-local-gemini`。

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

**⚠️ 有 Clash/V2Ray 代理时，`brew services` 启动的后台服务不继承 shell 代理变量**，导致 CLIProxyAPI → Google 这段无法访问。必须手动带代理启动：

```bash
# 带代理启动（国内必须）
http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890 \
  NO_PROXY=127.0.0.1,localhost \
  cliproxyapi &
```

建议加到 `~/.zshrc` 中作为函数复用：

```bash
function cliproxyapi-start() {
  http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890 \
    NO_PROXY=127.0.0.1,localhost no_proxy=127.0.0.1,localhost \
    /usr/local/opt/cliproxyapi/bin/cliproxyapi "$@" &
  echo "CLIProxyAPI started (PID $!)"
}
```

> **两段流量的代理规则刚好相反：**
> - CLIProxyAPI → `googleapis.com`：**需要**代理（Google 被墙）
> - Claude Code → `127.0.0.1:8317`：**不需要**代理（本地请求，代理会拦截）
>
> `NO_PROXY=127.0.0.1,localhost` 同时满足两个要求——对外走代理，本地绕过。

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

**方式一：直接设环境变量**（适合专用该链路时）

```bash
# 添加到 ~/.zshrc
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-local-gemini
export ANTHROPIC_MODEL=gemini-3.1-pro-preview
# 本地请求绕过代理
export NO_PROXY=127.0.0.1,localhost,$NO_PROXY
export no_proxy=127.0.0.1,localhost,$no_proxy
```

**方式二：通过 `ccc` provider 管理**（推荐，方便多链路切换）

在 `~/.claude/ccc.json` 的 `providers` 中添加：

```json
"gemini": {
  "env": {
    "ANTHROPIC_API_KEY": "sk-local-gemini",
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8317",
    "ANTHROPIC_MODEL": "gemini-3.1-pro-preview",
    "NO_PROXY": "127.0.0.1,localhost"
  }
}
```

然后切换：
```bash
ccc use gemini
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
| 复杂推理、架构设计 | `gemini-3.1-pro-preview` | OPUS |
| 轻量任务、批量处理 | `gemini-3.1-flash-lite-preview` | HAIKU |
| 尝鲜最新能力 | `gemini-3.1-pro-preview` | OPUS |

如果你想用最新的 Gemini 3 系列替代：
```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL=gemini-3.1-pro-preview
export ANTHROPIC_DEFAULT_SONNET_MODEL=gemini-3.1-flash-preview
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gemini-3.1-flash-lite-preview
```

### 8. 进阶：混合多 Provider 与生态大一统

CLIProxyAPI 的强大之处在于它可以把**各种前沿大模型的 API 和工具链，全都统一到 Claude Code 的生态下**。

这反映出一个非常重要的趋势：**Claude Code 正在成为目前最强、最通用的 Agent Runtime（代理运行环境）**。围绕着它的生态正在变得越来越强大，它不仅仅是一个只能跑 Anthropic 模型的命令行工具，而是一个可以驱动各种底层 LLM 的超级大脑外壳。

#### 8.1 整合第三方模型 (以 OpenRouter 为例)
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

#### 8.2 代理 GitHub Copilot (Codex)
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
A: 有两个地方都需要处理：

1. **登录时**：必须带上代理变量（访问 Google OAuth 需要代理），同时用 `NO_PROXY` 排除 localhost（避免回调被代理拦截）：
   ```bash
   http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890 \
     NO_PROXY=127.0.0.1,localhost cliproxyapi --login
   ```
2. **运行时**：Claude Code 请求 `127.0.0.1:8317` 时必须绕过代理，否则会被拦截报 502。在 `~/.zshrc` 的 alias 或 `export` 中加入 `NO_PROXY=127.0.0.1,localhost` 即可（上面的配置已包含）。

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
*阶段 4 | Lesson 23.6/26 (阶段内 9/9) | 上一课: Lesson 23.5 - ccc 实战 | 下一课: Lesson 24 - 高级特性（阶段 5）*
