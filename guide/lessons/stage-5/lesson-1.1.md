---
number: 24.1
title: "MCP 生态与文档工具"
short_title: "MCP 生态"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.1: MCP 生态与文档工具

> **前置课程**：Lesson 24（高级特性）
>
> **预计用时**：25 分钟
>
> **适合人群**：想让 AI 代理连接外部服务、查文档、搜代码的所有人

## 学习目标

- 掌握 MCP 三层分类体系，按需选配
- 理解 Agent 联网的"搜/看/做"策略
- 学会用 Context7、Grep MCP 两个文档工具提效
- 掌握 MCP 配置与权限管理的实操方法

## MCP 三层分类详解

L24 介绍了 MCP 的概念。这里给出完整的三层分类——**按你的需求选配，不要全开**。

### 第一层：通用推荐（建议所有人启用，无需凭证）

这 6 个 MCP 开箱即用，不需要任何 API Key：

| MCP | 启动命令 | 用途 | 你能让 AI 做什么 |
|-----|---------|------|----------------|
| **memory** | `npx -y @modelcontextprotocol/server-memory` | 跨会话持久化记忆 | "记住我们的项目用 pnpm" |
| **sequential-thinking** | `npx -y @modelcontextprotocol/server-sequential-thinking` | 链式推理增强 | 复杂问题时自动激活深度推理 |
| **context7** | `npx -y @upstash/context7-mcp@latest` | 实时文档查询 | "Next.js 15 的 Server Actions 怎么用？"——查到的是**最新**文档 |
| **token-optimizer** | `npx -y token-optimizer-mcp` | Token 优化 | 处理超长文件/日志时自动压缩 |
| **playwright** | `npx -y @playwright/mcp --browser chrome` | 浏览器自动化 | "打开 localhost:3000 截图" |
| **filesystem** | `npx -y @modelcontextprotocol/server-filesystem /你的项目路径` | 文件系统操作 | 跨目录操作 |

**配置方式**：将 JSON 块复制到 `~/.claude.json` 的 `mcpServers` 字段中：

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### 第二层：常用但需凭证（按需开启）

| MCP | 启动命令 | 需要的凭证 | 你能让 AI 做什么 |
|-----|---------|-----------|----------------|
| **github** | `npx -y @modelcontextprotocol/server-github` | `GITHUB_PERSONAL_ACCESS_TOKEN` | "查 Issue #42 状态"、"给 PR 加 label" |
| **supabase** | `npx -y @supabase/mcp-server-supabase@latest --project-ref=xxx` | 项目 ref | "查 users 表有多少活跃用户" |
| **exa-web-search** | `npx -y exa-mcp-server` | `EXA_API_KEY` | "搜索最新的 React 状态管理方案"——AI 联网搜索 |
| **fal-ai** | `npx -y fal-ai-mcp-server` | `FAL_KEY` | "生成一张记账 App 的首页插画" |
| **magic** | `npx -y @magicuidesign/mcp@latest` | 无 | "生成一个渐变动效按钮组件" |

**凭证配置方式**：在 MCP 的 `env` 字段中填入：

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
    }
  }
}
```

### 第三层：按项目需要选用

以下 MCP 针对特定平台或场景。**按你用的技术栈选 1-3 个**：

#### 部署平台（选你用的那个）

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **vercel** | http: `https://mcp.vercel.com` | "部署到 production"、"查看部署日志" |
| **railway** | `npx -y @railway/mcp-server` | "部署后端服务"、"查看容器日志" |
| **cloudflare-docs** | http: `https://docs.mcp.cloudflare.com/mcp` | "Cloudflare Workers 怎么配置 KV？" |
| **cloudflare-workers-builds** | http: `https://builds.mcp.cloudflare.com/mcp` | "构建并部署 Worker" |

HTTP 类型的 MCP 不需要安装，直接在配置中填 URL：

```json
{
  "vercel": {
    "type": "http",
    "url": "https://mcp.vercel.com"
  }
}
```

#### 数据与搜索

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **clickhouse** | http: `https://mcp.clickhouse.cloud/mcp` | "查询过去 7 天的用户增长数据" |
| **firecrawl** | `npx -y firecrawl-mcp`（需 `FIRECRAWL_API_KEY`） | "抓取竞品首页的内容"——结构化网页抓取 |
| **confluence** | `npx -y confluence-mcp-server`（需 URL + EMAIL + TOKEN） | "搜索 Confluence 里关于 API 设计的文档" |

#### 浏览器自动化

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **browserbase** | `npx -y @browserbasehq/mcp-server-browserbase`（需 API Key） | 云端浏览器会话，适合需要持久登录态的场景 |
| **browser-use** | http: `https://api.browser-use.com/mcp`（需 header Key） | AI 浏览器代理——自动完成复杂的网页操作流程 |

#### 安全

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **insaits** | `python3 -m insa_its.mcp_server`（需 `pip install insa-its`） | AI-to-AI 安全监控：23 种异常检测，100% 本地运行 |

---

### 配置注意事项

```
注意：建议同时启用不超过 10 个 MCP 服务器
原因：每个 MCP 会占用上下文窗口（AI 的"工作记忆"）
超过 10 个 → AI 的理解能力和响应质量会下降

推荐组合（7 个，平衡能力和上下文消耗）：
  第一层全部  → memory + sequential-thinking + context7 + token-optimizer + playwright（5 个）
  第二层选 2  → github + exa-web-search（或按需换成 supabase / fal-ai）
  第三层选 0-2 → 按项目部署平台选

禁用方式：在项目 .claude.json 中用 disabledMcpServers 数组按项目禁用
```

### MCP 权限管理

首次使用 MCP 工具时，Claude 会请求你批准每一个操作。手动审批很快就会变得烦人。

**自动批准 MCP 工具**：在 `settings.local.json` 的 `allow` 数组中添加 MCP 工具前缀：

```json
{
  "allow": [
    "mcp__playwright__*",
    "mcp__github__*"
  ]
}
```

> 格式为 `mcp__<服务器名>__<工具名>`，用 `*` 通配符批准该 MCP 的所有工具。只对你信任的 MCP 使用自动批准。

## Agent 联网策略：搜/看/做

MCP 连接外部服务，但**联网任务的效果取决于 Agent 的策略选择**。Agent 联网本质上只有三种行为——和人类上网一样：

```
搜 → 找到信息在哪           → Search 工具
看 → 读取内容               → Fetch/curl（公开页面）或浏览器（需登录/动态页面）
做 → 在页面上执行操作        → 浏览器自动化（点击、填表、上传）
```

**问题在于**：Agent 默认的联网策略往往不够智能。比如「调研小红书上的风评」，Agent 会先用 WebSearch 搜索（搜不到站内内容）、再用 WebFetch 请求（JS 渲染失败）、反复换关键词浪费 10 轮对话。正确做法是识别到反爬平台后直接用浏览器操作站内搜索。

### 工具选择矩阵

| 场景 | 推荐工具 | 原因 |
|------|---------|------|
| 公开文章/文档 | WebFetch + Jina | 速度快，token 少 |
| 需要登录的平台 | 浏览器（CDP） | 复用用户登录态 |
| 动态渲染页面 | 浏览器 | fetch 拿不到 JS 渲染内容 |
| 反爬严格的站点 | 浏览器 | 原生 Chrome 更难被识别 |
| 搜索引擎查询 | WebSearch | 快速发现信息来源 |

### Web Access Skill——联网策略的最佳实践

社区开源的 `web-access` Skill（[github.com/eze-is/web-access](https://github.com/eze-is/web-access)）是一个典型的「哲学式 Skill」，它不指定具体操作路径，而是：

1. **定义浏览哲学**：四步循环——定义成功标准 → 选最短路径验证 → 过程校验（每步结果都是证据）→ 对照标准确认完成
2. **整合最小完备工具集**：Search + Fetch + 浏览器自动化，覆盖搜/看/做
3. **补充惰性知识**：哪些平台需要浏览器、CDP 连接检测方法、安全边界

**安装方式**：

```bash
# 告诉 Claude Code 安装
"帮我安装 web-access skill，仓库地址是 https://github.com/eze-is/web-access"
```

**前置条件**：
- Chrome 浏览器（最新版）
- 地址栏输入 `chrome://inspect/#remote-debugging`，勾选 Allow remote debugging

**最佳实践**：安装 web-access 后，建议关闭其他浏览器 MCP（如 Playwright、Chrome Devtools MCP），避免模型在工具中"左右互搏"。

### 站点经验沉淀——联网领域的 /learn

Web Access Skill 内置了一个独特的经验沉淀机制：

```
第一次访问某平台:
  Agent 从零探索 → 试错多步 → 发现有效路径 → 完成任务
  → 自动保存该站点的访问策略（URL 模式、反爬特征、有效路径）

第二次访问同一平台:
  Agent 加载已有经验 → 直接走有效路径 → 跳过试错
  → 效率提升约 90%
```

**这是一个 learning loop**：每次操作都在积累经验，让下一次变得更快更准。

经验文件会标注发现日期，当作「提示」而非「事实」。如果平台改版导致经验失效，Agent 会自动回退通用模式并更新经验。

> 这个思路与 cc4pm 的持续学习系统（/learn → /skill-create → /evolve）一脉相承：**让 Agent 在使用中自我进化**。

## 文档工具

MCP 生态中有两个专为"文档与知识"设计的工具，建议产品主理人优先配置：

### Context7——查最新官方文档

AI 的训练数据有截止日期。问"Next.js 15 的 App Router 怎么用"，AI 可能回答的是 13 的旧 API。Context7 解决这个问题——它实时查询库的最新文档。

```bash
# 一行安装
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

**两个核心工具**：

| 工具 | 用途 | 示例 |
|------|------|------|
| `resolve-library-id` | 解析库名到 Context7 ID | 输入 "Next.js" → 返回 `/vercel/next.js` |
| `get-library-docs` | 获取最新官方文档 | 查询 `/vercel/next.js` 的 Server Actions 文档 |

**使用场景**：
```
"Next.js 15 的 middleware 怎么配置？"   → Context7 查最新文档，不是训练旧数据
"Supabase 的 RLS 策略怎么写？"          → 直接拿到官方示例代码
"React 19 的 use() hook 怎么用？"       → 查到正式版 API，不是 RC 版
```

### Grep MCP——搜索真实代码案例

官方文档告诉你 API 长什么样，但**真实项目怎么用**才是最有参考价值的。Grep MCP 让你搜索 GitHub 上的实际使用案例。

```bash
# 一行安装
claude mcp add --transport http grep https://mcp.grep.app
```

**核心工具**：`searchGitHub`——搜索 GitHub 上的实际使用案例。

**使用场景**：
```
"Supabase 的 auth 在真实项目中怎么用？"  → 搜索 GitHub 上的集成示例
"这个 API 的最佳实践是什么？"            → 看高星项目怎么调用的
"有没有人遇到过这个报错？"              → 搜索 Issues 和解决方案
```

**Context7 + Grep 组合拳**：
```
Context7  → 告诉你"官方推荐怎么做"（规范）
Grep MCP  → 告诉你"大家实际怎么做"（实践）

两者结合 = 既不偏离官方，又接地气
```

### 文档工具速查

| 工具 | 一句话 | 安装命令 |
|------|--------|---------|
| Context7 | 查最新官方文档 | `claude mcp add --transport http context7 https://mcp.context7.com/mcp` |
| Grep MCP | 搜 GitHub 真实代码 | `claude mcp add --transport http grep https://mcp.grep.app` |

## 🛠️ 实操练习

### 练习 1：配置第一层 MCP

```bash
# 查看当前 MCP 配置
cat ~/.claude.json | jq '.mcpServers'

# 添加 memory MCP（如果没有）
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**任务**：
1. 检查你已有的 MCP 配置
2. 至少添加一个第一层 MCP（推荐 memory 或 context7）
3. 在 Claude Code 中测试：问一个需要查文档的问题

### 练习 2：用 Context7 查文档

安装 Context7 后，在 Claude Code 中试试：

```
帮我查一下 Next.js 15 的 Server Actions 最新用法
```

**预期**：AI 调用 Context7 获取最新文档，而不是用训练数据回答。

### 练习 3：用 Grep 搜索真实代码

安装 Grep MCP 后，试试：

```
搜索 GitHub 上用 Supabase auth 做登录的真实项目
```

**预期**：返回真实项目的代码片段，而不仅仅是文档示例。

---

## 常见问题

**Q: MCP 配置需要什么前置条件？**

A: 主要是 API Token。比如 GitHub MCP 需要一个 Personal Access Token（PAT），Supabase 需要项目 URL 和 Key。这些通常由开发者或 DevOps 配置好。PM 一般不需要自己配置，但需要知道"哪些 MCP 可以用"。

**Q: 两个文档工具都要装吗？**

A: 建议都装。Context7 查官方文档，Grep MCP 搜真实代码案例，两者互补且不冲突。

**Q: 安装太多 MCP 会不会影响性能？**

A: 会。每个 MCP 占用上下文窗口。建议同时启用不超过 10 个。文档工具三个加起来占用不大，可以放心装。

## 下一步

- [1] 进入下一课：Lesson 24.2 - 插件架构与 SDK
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 24.1/26 | 上一课: Lesson 24 - 高级特性 | 下一课: Lesson 24.2 - 插件与 SDK*
