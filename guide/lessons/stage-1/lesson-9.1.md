# Lesson 9.1: 环境变量完全手册

> 补充课 · 建议在完成 Lesson 9 后阅读

## 本课目标

- 掌握两种配置方式：shell 导出 vs `settings.json` env 字段
- 了解 63 个环境变量的分类与用途，按需取用
- 熟悉"国内中转站用户"必须设置的兼容性变量，避免报错
- 能够根据自己的场景（Anthropic 直连 / 中转站 / 非 Anthropic 模型）快速生成配置模板

## 核心内容

### 两种配置方式

**方式一：Shell 导出（临时或按项目切换）**

```bash
# 加入 ~/.zshrc 或 ~/.bashrc，永久生效
export DISABLE_AUTOUPDATER=1
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=50000
```

优点：可以按 shell profile 区分不同工作场景（如 `claude-dev`、`claude-review`）。

**方式二：写入 `~/.claude/settings.json` 的 `env` 字段（推荐）**

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "50000",
    "DISABLE_TELEMETRY": "1"
  }
}
```

优点：配置跟随 Claude Code 本身，不依赖 shell 环境，CI 和 IDE 插件模式下也生效。两种方式可并存——`settings.json` 的值会被 shell 中同名变量覆盖。

> Lesson 9 中的 `CLAUDE_CODE_NO_FLICKER` 示例已展示过 settings.json 写法，其他变量同理。

---

### 非 Anthropic 模型兼容（中转站用户必读）

用非 Anthropic 模型时，Claude Code 默认还在尝试 Prompt Cache、扩展思考这些 Anthropic 专有功能。模型和中转站支持不了，这些功能就在白白消耗资源。核心原因不是"不设会报错"，而是你在为永远不会生效的功能付出开销——其中 Prompt Cache 影响最大，中转站普遍不支持 `cache_control` 字段，开着只是在每个请求里多发一堆无效字段。

| 变量 | 值 | 关掉后节省什么 |
|------|-----|------|
| `DISABLE_PROMPT_CACHING` | `1` | 停止发送 `cache_control` 字段；中转站不支持缓存时，开着是纯噪声 |
| `CLAUDE_CODE_DISABLE_THINKING` | `1` | 停止给非 Anthropic 模型发 thinking 请求；模型不支持，token 全白花 |
| `DISABLE_INTERLEAVED_THINKING` | `1` | 停止发送 thinking beta header；减少无效字段，提升稳定性 |
| `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` | `1` | 停止自动切换思考模式；在不支持 thinking 的模型上徒增混乱 |

**中转站完整兼容 Anthropic API 时反过来**：如果你的中转站支持 Prompt Cache 和 thinking 协议，这 4 个变量反而不应该设——特别是缓存，开着能省不少 token。不确定是否支持，先全关，稳定后逐一测试。

---

### 模型路由与成本控制

Claude Code 会根据任务类型自动路由到不同层级的模型。你可以用以下变量覆盖默认路由：

| 变量 | 说明 | 示例 |
|------|------|------|
| `ANTHROPIC_MODEL` | 覆盖所有请求的主模型 | `deepseek-chat` |
| `ANTHROPIC_SMALL_FAST_MODEL` | 轻量后台任务（token 估算、摘要等）用的模型 | `deepseek-chat` |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 覆盖 Opus 层级（深度推理） | `claude-opus-4-6` |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 覆盖 Sonnet 层级（主力编码） | `claude-sonnet-4-6` |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 覆盖 Haiku 层级（轻量快速） | `claude-haiku-4-5-20251001` |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 子 agent 用的模型；可设为便宜模型降低多 agent 成本 | `deepseek-chat` |

**降本小技巧**：主模型用 Sonnet（编码质量），`ANTHROPIC_SMALL_FAST_MODEL` 和 `CLAUDE_CODE_SUBAGENT_MODEL` 设为 Haiku 或 DeepSeek——后台任务和子 agent 占总调用量约 30%，单独路由可节省不少成本。

---

### 网络代理与稳定性

#### 代理配置

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1
```

- `CLAUDE_CODE_PROXY_RESOLVES_HOSTS=1`：SOCKS5 或透明代理时让代理服务器负责 DNS 解析
- `SSL_CERT_FILE=/path/to/ca.crt`：企业内网或使用自签名证书的代理需要指定 CA 证书

#### 超时与重试

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `API_TIMEOUT_MS` | `120000` | 请求总超时（2 分钟）；代理延迟高时调大 |
| `CLAUDE_CODE_MAX_RETRIES` | `5` | 失败后重试次数；不稳定线路多试几次 |
| `CLAUDE_ENABLE_STREAM_WATCHDOG` | `1` | 启用流式响应看门狗，防止无限挂起 |
| `CLAUDE_STREAM_IDLE_TIMEOUT_MS` | `120000` | 流式响应空闲超时；需配合看门狗使用 |
| `CLAUDE_CODE_RESUME_INTERRUPTED_TURN` | `1` | 中断后自动恢复对话，避免会话丢失 |

---

### 推理力度与上下文压缩

#### 控制思考深度（Anthropic 原生模型）

```bash
# 推理力度：low / medium / high / max / auto
export CLAUDE_CODE_EFFORT_LEVEL=low       # 日常任务，省 token
export MAX_THINKING_TOKENS=10000          # 思考 token 预算，日常 10000 够用
```

**优先级**：`CLAUDE_CODE_EFFORT_LEVEL` 环境变量 > 会话内 `/effort` 命令 > 模型默认。
非 Anthropic 模型用户无需设置这两个变量（thinking 已被前述变量关闭）。

#### 自动压缩控制

| 变量 | 说明 |
|------|------|
| `DISABLE_AUTO_COMPACT=1` | 关闭自动上下文压缩；手动 `/compact` 仍可用 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` | 提前触发压缩（上下文用到 50% 时）；上下文窗口小的模型推荐 |

---

### 输出与 Token 上限

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `50000` | 单次最大输出；防止长任务被截断（L9 已覆盖） |
| `CLAUDE_CODE_MAX_CONTEXT_TOKENS` | 按需 | 手动限制上下文窗口；中转站报告不准确时使用 |
| `CLAUDE_CODE_MAX_TURNS` | 按需 | agentic 循环最大轮数；CI 模式下防无限循环 |

---

### 行为开关、界面与遥测

| 变量 | 推荐值 | 说明 |
|------|--------|------|
| `DISABLE_TELEMETRY` | `1` | 关闭所有遥测数据上报 |
| `DISABLE_COST_WARNINGS` | `1` | 隐藏费用警告；中转站定价与官方不同时数字不准确 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1` | 启用实验性 Agent Teams 多 Claude 协作功能 |
| `CLAUDE_PACKAGE_MANAGER` | 按需 | 覆盖包管理器检测（npm/pnpm/yarn/bun） |
| `CLAUDE_CODE_GIT_DIFF_IGNORE` | `*.lock` | git diff 忽略文件模式，减少锁文件噪声 |
| `CLAUDE_CODE_BRIEF` | `1` | 精简输出模式，适合快速查看结果 |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | `1` | 关闭使用反馈调查弹窗 |

---

### MCP、Bash 工具与调试

| 变量 | 说明 |
|------|------|
| `MCP_TIMEOUT=30` | MCP 服务器连接超时（秒） |
| `MCP_TOOL_TIMEOUT=60` | MCP 工具调用超时（秒） |
| `BASH_DEFAULT_TIMEOUT_MS=300000` | Bash 命令默认超时（5 分钟）；长跑任务调大 |
| `BASH_MAX_TIMEOUT_MS=600000` | Bash 命令最大超时上限 |
| `BASH_MAX_OUTPUT_LENGTH=100000` | Bash 输出最大长度 |
| `DEBUG=claude:*` | 全量调试日志；排查请求/响应问题时使用 |
| `CLAUDE_CONFIG_DIR=/custom/path` | 自定义配置目录（默认 `~/.claude`） |

---

### 按场景快速配置模板

把下面对应你场景的块复制到 `~/.claude/settings.json` 的 `env` 字段即可。

#### 场景 A：Anthropic 直连（推荐基础配置）

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "50000",
    "CLAUDE_CODE_MAX_RETRIES": "5",
    "CLAUDE_CODE_NO_FLICKER": "1"
  }
}
```

#### 场景 B：Anthropic API 兼容中转站（代理 Claude 模型）

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-proxy.com/anthropic",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "DISABLE_COST_WARNINGS": "1",
    "API_TIMEOUT_MS": "120000",
    "CLAUDE_CODE_MAX_RETRIES": "5",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "50000"
  }
}
```

#### 场景 C：非 Anthropic 模型（DeepSeek / Qwen / Moonshot 等）

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-chat",
    "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat",
    "CLAUDE_CODE_DISABLE_THINKING": "1",
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "DISABLE_INTERLEAVED_THINKING": "1",
    "DISABLE_PROMPT_CACHING": "1",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "DISABLE_COST_WARNINGS": "1",
    "API_TIMEOUT_MS": "120000",
    "CLAUDE_CODE_MAX_RETRIES": "5",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_TELEMETRY": "1",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "50000"
  }
}
```

> **交互式配置向导**：在 Claude Code 中运行 `/configuring-env`，可以通过问答式引导自动生成并写入配置。这个命令来自 `env-config-plugin`，需要单独安装（见下方"安装配置向导"）。

---

### 安装配置向导（env-config-plugin）

上面的场景模板是静态参考，如果想通过交互式问答来生成配置，可以安装 `env-config-plugin`。

**来源**：[istarwyh/agent-plugins](https://github.com/istarwyh/agent-plugins) 插件市场

**安装方式（三选一）：**

```bash
# 方式 1：一行安装（推荐）
curl -fsSL https://raw.githubusercontent.com/istarwyh/agent-plugins/master/scripts/install.sh | bash -s -- env-config-plugin

# 方式 2：Claude Code CLI
claude plugin marketplace add istarwyh/agent-plugins   # 首次添加市场
claude plugin install env-config-plugin@agent-plugins

# 方式 3：在 Claude Code 中交互安装
/find-skills
# → 搜索 env-config-plugin，按提示安装
```

安装后，在任意项目中运行：

```
/configuring-env
```

向导会自动识别你的场景（Anthropic 直连 / 中转站 / 非 Anthropic 模型），推荐配置，并通过 `update-config` 写入 `settings.json`。

---

## 常见问题

**Q: shell 导出和 settings.json 里的同名变量，哪个优先？**

A: shell 导出优先。如果你在 `~/.zshrc` 里写了 `export DISABLE_AUTOUPDATER=0`，settings.json 里的 `"DISABLE_AUTOUPDATER": "1"` 就不生效。建议选一种方式统一管理，避免混淆。

**Q: 我用的是 VSCode/JetBrains IDE 插件，settings.json 的 env 也生效吗？**

A: 是的。IDE 插件模式下 shell profile 通常不会被加载，`settings.json` 的 `env` 字段是更可靠的配置方式。

**Q: 切换到非 Anthropic 模型后，`/effort` 命令还能用吗？**

A: 命令本身还能输入，但因为 thinking 已被关闭，效果取决于目标模型是否有自己的推理模式控制。DeepSeek-R1 等有内置推理模式的模型，效果因模型而异。

**Q: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 可以设置更高的阈值吗？**

A: 不可以——该变量只能**降低**触发阈值（更早压缩），不能提高。想延迟压缩只能用 `DISABLE_AUTO_COMPACT=1` 完全关闭，然后手动 `/compact`。

**Q: Agent Teams 功能稳定吗，适合日常使用吗？**

A: 目前仍是实验性功能（需 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 开启）。它让多个 Claude 实例在同一 iTerm2 窗口协作，适合复杂任务并行。日常单任务开发不需要开启，等功能稳定后会默认可用。详见 Lesson 7.1。

## 相关概念

- **Lesson 9 — 环境搭建** — 基础安装与 CLAUDE_CODE_NO_FLICKER、CLAUDE_CODE_ATTRIBUTION_HEADER 的详细说明
- **Lesson 3.2 — 效率工作流** — 思考模式的快捷键切换（与 CLAUDE_CODE_EFFORT_LEVEL 互补）
- **Lesson 7.1 — Agent Teams** — CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS 的实战用法
- **Lesson 23.5 / 23.6 — ccc 实战 / CLIProxyAPI** — 国产模型切换与代理配置的深度实践

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 返回 Lesson 9：环境搭建
- 继续 Lesson 10：综合实战
- 返回主菜单

---
*阶段 1 | Lesson 9.1/26 | 上一课: Lesson 9 - 环境搭建 | 下一课: Lesson 10 - 综合实战*
