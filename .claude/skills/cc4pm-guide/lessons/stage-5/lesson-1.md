# Lesson 24: 高级特性：MCP 集成与持续学习

## 本课目标

- 理解 MCP（Model Context Protocol，模型上下文协议）如何让 AI 代理连接外部工具
- 掌握插件（Plugins）系统：市场安装、LSP 插件、mgrep 搜索等
- 掌握 /learn 和 /skill-create 的知识提取和经验积累机制
- 了解持续学习系统（Continuous Learning）的工作原理
- 理解 cc4pm 的插件架构和跨平台支持

> **阶段概览**：打开 [stage5-overview.html](stage5-overview.html)，用可视化方式浏览阶段 5 的高级特性和实战流程。

## 核心内容

### 本课缩写速查表

| 缩写 | 全称 | 中文 | 一句话说明 |
|------|------|------|-----------|
| MCP | Model Context Protocol | 模型上下文协议 | AI 代理连接外部服务的标准接口 |
| PAT | Personal Access Token | 个人访问令牌 | 访问 GitHub 等服务的认证凭证 |
| SLA | Service Level Agreement | 服务级别协议 | 服务可用性的承诺 |

### MCP——让 AI 代理连接世界

到目前为止，你学的所有代理都在"本地"工作——读文件、写代码、运行测试。但现实中的产品开发需要连接外部服务：

```
需要查 GitHub Issues     → GitHub MCP
需要部署到 Vercel        → Vercel MCP
需要操作数据库           → Supabase MCP
需要做浏览器测试         → Playwright MCP
需要搜索最新技术文档     → Context7 MCP
需要生成 AI 图片         → fal.ai MCP
```

**MCP 就是 AI 代理的"USB 接口"——标准化的外部工具连接方式。**

> **基础回顾**：MCP 配置存放在 `mcp-configs/mcp-servers.json` 中，属于 **Lesson 5（阶段 1）**介绍的五层扩展体系中 `settings.json` 层的一部分。如果你对 Claude Code 的目录结构还不熟悉，建议回顾那一课。

#### 可用的 MCP 服务器

cc4pm 预配置了 **23 个 MCP 服务器**（在 `mcp-configs/mcp-servers.json` 中）。我们按使用频率分为三层：

---

#### 第一层：通用推荐（建议所有人启用，无需凭证）

这 6 个 MCP 开箱即用，不需要任何 API Key，直接提升 AI 的能力：

| MCP | 启动命令 | 用途 | 你能让 AI 做什么 |
|-----|---------|------|----------------|
| **memory** | `npx -y @modelcontextprotocol/server-memory` | 跨会话持久化记忆 | "记住我们的项目用 pnpm"、"上次讨论的架构方案是什么？" |
| **sequential-thinking** | `npx -y @modelcontextprotocol/server-sequential-thinking` | 链式推理增强 | AI 遇到复杂问题时自动激活深度推理 |
| **context7** | `npx -y @upstash/context7-mcp@latest` | 实时文档查询 | "Next.js 15 的 Server Actions 怎么用？"——查到的是**最新**文档，不是训练截止时的旧版 |
| **token-optimizer** | `npx -y token-optimizer-mcp` | Token 优化，95%+ 上下文压缩 | 处理超长文件/日志时自动压缩，节省上下文窗口 |
| **playwright** | `npx -y @playwright/mcp --browser chrome` | 浏览器自动化和测试 | "打开 localhost:3000 截图"、"点击登录按钮看看会发生什么" |
| **filesystem** | `npx -y @modelcontextprotocol/server-filesystem /你的项目路径` | 文件系统操作 | 补充 Claude Code 自带的文件能力，适合需要跨目录操作的场景 |

**配置方式**：将以上 JSON 块复制到 `~/.claude.json` 的 `mcpServers` 字段中。例如：

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

---

#### 第二层：常用但需凭证（按需开启，能力提升明显）

这些 MCP 需要 API Key 或登录，但一旦配好就非常好用：

| MCP | 启动命令 | 需要的凭证 | 你能让 AI 做什么 |
|-----|---------|-----------|----------------|
| **github** | `npx -y @modelcontextprotocol/server-github` | `GITHUB_PERSONAL_ACCESS_TOKEN` | "查 Issue #42 状态"、"给这个 PR 加 label"、"列出本周的 open issues" |
| **supabase** | `npx -y @supabase/mcp-server-supabase@latest --project-ref=xxx` | 项目 ref | "查 users 表有多少活跃用户"、"这张表的 schema 是什么？" |
| **exa-web-search** | `npx -y exa-mcp-server` | `EXA_API_KEY` | "搜索 2024 年最新的 React 状态管理方案"——AI 联网搜索 |
| **fal-ai** | `npx -y fal-ai-mcp-server` | `FAL_KEY` | "生成一张记账 App 的首页插画"——AI 直接调 Stable Diffusion / FLUX |
| **magic** | `npx -y @magicuidesign/mcp@latest` | 无 | "生成一个渐变动效按钮组件"——Magic UI 组件生成 |

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

---

#### 第三层：按项目需要选用

以下 MCP 针对特定平台或场景，不需要每个项目都开。**按你用的技术栈选 1-3 个**：

##### 部署平台（选你用的那个）

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **vercel** | http: `https://mcp.vercel.com` | "部署到 production"、"查看最近一次部署日志" |
| **railway** | `npx -y @railway/mcp-server` | "部署后端服务"、"查看容器日志" |
| **cloudflare-docs** | http: `https://docs.mcp.cloudflare.com/mcp` | "Cloudflare Workers 怎么配置 KV？" |
| **cloudflare-workers-builds** | http: `https://builds.mcp.cloudflare.com/mcp` | "构建并部署 Worker" |
| **cloudflare-workers-bindings** | http: `https://bindings.mcp.cloudflare.com/mcp` | "给 Worker 绑定 KV namespace" |
| **cloudflare-observability** | http: `https://observability.mcp.cloudflare.com/mcp` | "查看 Worker 最近的错误日志" |

HTTP 类型的 MCP 不需要安装任何东西，直接在配置中填 URL：

```json
{
  "vercel": {
    "type": "http",
    "url": "https://mcp.vercel.com"
  }
}
```

##### 数据与搜索

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **clickhouse** | http: `https://mcp.clickhouse.cloud/mcp` | "查询过去 7 天的用户增长数据"——BI 分析查询 |
| **firecrawl** | `npx -y firecrawl-mcp`（需 `FIRECRAWL_API_KEY`） | "抓取竞品首页的内容"——结构化网页抓取 |
| **confluence** | `npx -y confluence-mcp-server`（需 URL + EMAIL + TOKEN） | "搜索 Confluence 里关于 API 设计的文档" |

##### 浏览器自动化

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **browserbase** | `npx -y @browserbasehq/mcp-server-browserbase`（需 API Key） | 云端浏览器会话，适合需要持久登录态的场景 |
| **browser-use** | http: `https://api.browser-use.com/mcp`（需 header Key） | AI 浏览器代理——自动完成复杂的网页操作流程 |

##### 安全

| MCP | 连接方式 | 你能让 AI 做什么 |
|-----|---------|----------------|
| **insaits** | `python3 -m insa_its.mcp_server`（需 `pip install insa-its`） | AI-to-AI 安全监控：23 种异常检测，100% 本地运行，不传数据到外部 |

---

#### MCP 对 PM 意味着什么

```
没有 MCP：
  PM："帮我查一下 Issue #42 的状态"
  开发者：打开浏览器 → 登录 GitHub → 找到 Issue → 复制信息 → 回复

有 MCP（github）：
  PM："帮我查一下 Issue #42 的状态"
  AI 代理：[通过 GitHub MCP 直接查询] → 立即返回结果

更多真实场景：
  "最近一周有哪些新 Issue？"           → github MCP
  "Next.js 15 的 App Router 怎么用？"  → context7 MCP
  "生成一张产品概念图"                  → fal-ai MCP
  "把这个功能部署到 staging"            → vercel / railway MCP
  "抓取竞品的定价页面"                  → firecrawl MCP
```

**MCP 让 AI 代理从"只能操作本地文件"升级为"能操作整个开发基础设施"。**

#### 配置注意事项

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

### /learn——从会话中提取可复用模式

**/learn 做什么**：分析当前会话中的问题解决过程，提取可复用的模式，保存为技能文件。

```bash
/learn
```

```
Learn：让我分析这次会话...

发现 1 个可提取的模式：

模式名称：TypeScript 联合类型的窄化技巧
上下文：当你需要处理 A | B | null 类型时
问题：直接访问属性会报类型错误
解决方案：
  1. 先用 typeof 或 in 运算符窄化类型
  2. 处理 null 的情况
  3. 使用类型保护函数（Type Guard）

要保存这个技能吗？(y/n)
```

**提取标准**：
- **提取**：非显而易见的解法、项目特有的模式、节省时间的技巧
- **不提取**：拼写错误、简单语法问题、一次性的特殊情况

**保存位置**：`~/.claude/skills/learned/`

### /skill-create——从 Git 历史生成团队模式

**/skill-create 做什么**：分析 Git 提交历史，自动发现团队的编码模式和规范。

```bash
/skill-create
```

```
Skill Creator：分析了最近 50 个提交...

发现的模式：

1. 提交规范
   - 使用 feat:/fix:/docs: 前缀
   - 90% 的提交信息少于 72 字符

2. 文件共变模式
   - .tsx 文件和 .test.tsx 文件总是一起修改
   - API 路由变更总是伴随着 types.ts 更新

3. 架构模式
   - 组件放在 src/components/
   - 工具函数放在 src/lib/
   - API 路由放在 src/app/api/

4. 测试模式
   - 使用 Vitest 框架
   - 测试文件放在组件同目录
   - 命名：{Component}.test.tsx

正在生成 SKILL.md 文件...
```

**使用场景**：
```bash
/skill-create                    # 分析当前仓库
/skill-create --commits 100      # 分析最近 100 个提交
/skill-create --instincts        # 同时生成 instincts 文件
```

### 持续学习系统

cc4pm 有一个完整的"持续学习"系统，让 AI 代理越用越聪明：

```
/learn（会话级）
    ↓ 从单次会话提取模式

/skill-create（项目级）
    ↓ 从 Git 历史提取模式

/instinct-status（查看已学模式）
    ↓ 查看所有已积累的"直觉"

/instinct-import / export（团队共享）
    ↓ 在团队成员之间分享经验

/evolve（模式聚合）
    ↓ 把多个小模式聚合成完整的技能
```

**持续学习对 PM 意味着什么**：

```
第 1 周：AI 代理是个"新人"，需要你告诉它项目规范
第 4 周：AI 代理已经学会了你的代码风格和项目模式
第 8 周：AI 代理像一个"老员工"，知道项目的所有约定
```

### cc4pm 的插件架构

cc4pm 不只是一个工具——它是一个完整的插件系统，可以跨多个 AI 开发工具使用。

#### 插件（Plugins）——比 MCP 更丰富的扩展方式

MCP 连接的是外部服务。**插件（Plugin）是一种更高级的打包方式**——它可以同时包含技能、MCP、钩子，甚至 LSP（语言服务器协议），打包成一个可安装的单元。

```
MCP 只做一件事：
  连接外部服务（GitHub、Supabase、Vercel...）

Plugin 可以做很多事：
  ├── 包含技能（工作流定义）
  ├── 包含 MCP（外部集成）
  ├── 包含 Hook（自动化触发）
  └── 包含 LSP（语言智能——类型检查、补全、跳转定义）
```

#### 插件市场与安装

```bash
# 添加一个插件市场
claude plugin marketplace add affaan-m/everything-claude-code

# 查看已安装的插件
/plugins

# 安装特定插件
/plugin install everything-claude-code@everything-claude-code
```

**已有的插件市场**：打开 Claude Code 后输入 `/plugins`，可以看到官方市场和第三方市场中的所有可用插件。

#### 值得了解的插件类型

| 插件类型 | 代表 | 说明 |
|---------|------|------|
| **LSP 插件** | `typescript-lsp`、`pyright-lsp` | 给 Claude 提供实时类型检查和代码补全——不需要打开 IDE，Claude 也能获得编辑器级别的代码智能 |
| **搜索插件** | `mgrep` | 比内置 ripgrep 更强的语义搜索——支持本地搜索和网络搜索 |
| **工作流插件** | `hookify` | 用对话方式创建 Hook，不用手写 JSON |
| **文档插件** | `context7` | 查询最新技术文档（也作为 MCP 提供） |

#### mgrep——比 grep 更好的搜索

`mgrep` 是一个通过插件市场安装的增强搜索工具，由 [Mixedbread](https://www.mixedbread.ai/) 提供。它比 Claude Code 内置的 ripgrep 搜索更智能：

```bash
# 本地代码搜索（语义理解，不只是文本匹配）
mgrep "处理用户认证的函数"

# 网络搜索（AI 联网搜索最新信息）
mgrep --web "Next.js 15 App Router 最新变化"
```

**安装方式**：

```bash
# 先添加 Mixedbread 市场
claude plugin marketplace add mixedbread-ai/mgrep

# 然后安装
/plugins → 找到 Mixedbread-Grep → 安装
```

#### 插件与上下文窗口的关系

**重要提醒**：和 MCP 一样，每个启用的插件都会占用上下文窗口。

```
经验法则：
  配置 20-30 个插件/MCP → 保存在配置中备用
  同时启用 < 10 个       → 实际工作时只开需要的
  活动工具 < 80 个       → 超过会明显影响 Claude 的表现

管理方式：
  /plugins  → 查看所有插件的启用/禁用状态
  /mcp      → 查看所有 MCP 的启用/禁用状态
```

不需要每个项目都开全部插件。按项目需求选 4-5 个即可。

#### 支持的平台

| 平台 | 支持度 | 特点 |
|------|--------|------|
| **Claude Code** | 原生（主要平台） | 完整支持所有功能 |
| **Cursor IDE** | 完整支持 | DRY 适配器模式，复用 Hook 脚本 |
| **Codex** | 一等支持 | AGENTS.md + .codex/ 结构 |
| **OpenCode** | 完整支持 | 31+ 命令，11+ Hook 事件 |

#### 安装方式

```bash
# 方式 1：插件市场（推荐）
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code

# 方式 2：手动安装
git clone https://github.com/affaan-m/everything-claude-code.git
./install.sh typescript python  # 按需选择语言规则
```

#### 组件统计

| 组件 | 数量 | 说明 |
|------|------|------|
| 代理 | 18 | 专业化的 AI 助手 |
| 技能 | 56+ | 工作流定义和领域知识 |
| 命令 | 40+ | 用户可调用的斜杠命令 |
| 规则 | 9 通用 + 7 语言 × 5 | 共 44 个规则文件 |
| Hook | 21 | 6 个触发点的事件驱动自动化 |
| MCP | 23 | 外部工具集成（command + http 两种类型） |

### 高级特性速查

| 特性 | 命令 | PM 用途 |
|------|------|--------|
| 模式学习 | `/learn` | 积累项目经验 |
| Git 分析 | `/skill-create` | 文档化团队规范 |
| 直觉管理 | `/instinct-status` | 查看 AI 学了什么 |
| 安全扫描 | `/security-scan` | 发现安全风险 |
| 质量门禁 | `/quality-gate` | 手动触发质量检查 |
| 验证循环 | `/verify` | 构建+测试+Lint 一键验证 |
| 性能调优 | `/harness-audit` | 检查代理系统本身的表现 |

## 🛠️ 实操练习

完成以下练习，掌握高级特性工具。

### 练习 1：使用 /learn 提取模式

```bash
# 从当前会话提取可复用模式
/learn
```

**任务**：
1. 完成一些开发工作后运行 `/learn`
2. 查看提取的模式
3. 确认或拒绝学习建议

**预期产出**：
- 保存在 `~/.claude/skills/learned/` 的模式文件

### 练习 2：使用 /skill-create 创建技能

```bash
# 从 Git 历史创建技能
/skill-create
```

**任务**：
- 分析项目的 Git 历史
- 提取团队的编码规范
- 生成可复用的技能文件

### 练习 3：查看 MCP 配置

```bash
# 查看 MCP 配置
cat .claude/mcp-configs/mcp-servers.json

# 查看可用的 MCP 服务
/mcp
```

**MCP 三层分类**：

| 层级 | 类型 | 示例 |
|------|------|------|
| 核心层 | 必备工具 | GitHub、Supabase |
| 扩展层 | 按需启用 | Figma、Notion |
| 专业层 | 特定场景 | Stripe、Twilio |

### 练习 4：探索插件系统

```bash
# 查看插件市场
/plugins

# 安装插件
/plugin marketplace add <plugin-name>
```

**检查清单**：
- [ ] 成功运行 `/learn` 提取模式
- [ ] 了解了 `/skill-create` 的用途
- [ ] 查看了 MCP 配置
- [ ] 探索了插件系统

---

## 常见问题

**Q: MCP 配置需要什么前置条件？**

A: 主要是 API Token。比如 GitHub MCP 需要一个 Personal Access Token（PAT），Supabase 需要项目 URL 和 Key。这些通常由开发者或 DevOps 配置好。PM 一般不需要自己配置，但需要知道"哪些 MCP 可以用"。

**Q: /learn 会不会学到错误的模式？**

A: 有可能。所以 /learn 提取模式后会先让你确认。如果发现之前学了错误的模式，可以去 ~/.claude/skills/learned/ 目录手动删除。持续学习系统有"置信度"机制——反复验证的模式置信度高，单次出现的模式置信度低。

**Q: 多平台支持意味着什么？**

A: 你的团队可以同时使用 Claude Code、Cursor、Codex 等不同工具，但共享同一套规则、技能和模式。换工具不用重新配置。这就是"一次配置，处处生效"。

## 下一步

- [1] 进入下一课：Lesson 25 - 完整项目实战
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 24/26 (阶段内 1/3) | 上一课: Lesson 23 - 自动化工作流（阶段 4） | 下一课: Lesson 25 - 完整项目实战*
