# Lesson 24: 高级特性：MCP 集成与持续学习

## 本课目标

- 理解 MCP（Model Context Protocol，模型上下文协议）如何让 AI 代理连接外部工具
- 掌握 /learn 和 /skill-create 的知识提取和经验积累机制
- 了解持续学习系统（Continuous Learning）的工作原理
- 了解插件（Plugins）系统和 Claude Code SDK 的存在

> **阶段概览**：打开 [stage5-overview.html](stage5-overview.html)，用可视化方式浏览阶段 5 的高级特性和实战流程。

## 核心内容

### 本课缩写速查表

| 缩写 | 全称 | 中文 | 一句话说明 |
|------|------|------|-----------|
| MCP | Model Context Protocol | 模型上下文协议 | AI 代理连接外部服务的标准接口 |
| PAT | Personal Access Token | 个人访问令牌 | 访问 GitHub 等服务的认证凭证 |

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

#### MCP 配置与权限（速览）

cc4pm 预配置了 **23 个 MCP 服务器**，按使用频率分为三层。建议同时启用不超过 10 个，避免占用过多上下文窗口。

首次使用 MCP 工具时，Claude 会请求你批准每一个操作。可以在 `settings.local.json` 中自动批准信任的 MCP：

```json
{
  "allow": [
    "mcp__playwright__*",
    "mcp__github__*"
  ]
}
```

> **完整分类、配置示例和联网策略**：见 [Lesson 24.1 - MCP 生态与文档工具](lesson-1.1.md)

#### 插件与 SDK（概览）

MCP 连接外部服务。**插件（Plugin）** 是更高级的打包方式——可以同时包含技能、MCP、钩子和 LSP。**Claude Code SDK** 支持用 CLI、TypeScript、Python 编程式调用 AI 代理。

> **详细内容**：见 [Lesson 24.2 - 插件架构与 SDK](lesson-1.2.md)

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

---

## 常见问题

**Q: /learn 会不会学到错误的模式？**

A: 有可能。所以 /learn 提取模式后会先让你确认。如果发现之前学了错误的模式，可以去 ~/.claude/skills/learned/ 目录手动删除。持续学习系统有"置信度"机制——反复验证的模式置信度高，单次出现的模式置信度低。

**Q: 多平台支持意味着什么？**

A: 你的团队可以同时使用 Claude Code、Cursor、Codex 等不同工具，但共享同一套规则、技能和模式。换工具不用重新配置。这就是"一次配置，处处生效"。

**Q: MCP 配置需要什么前置条件？**

A: 主要是 API Token。比如 GitHub MCP 需要一个 Personal Access Token（PAT），Supabase 需要项目 URL 和 Key。这些通常由开发者或 DevOps 配置好。PM 一般不需要自己配置，但需要知道"哪些 MCP 可以用"。

## 下一步

- [1] 进入下一课：Lesson 24.1 - MCP 生态与文档工具
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 24/26 (阶段内 1/3) | 上一课: Lesson 23.6 - CLIProxyAPI 实战（阶段 4） | 下一课: Lesson 24.1 - MCP 生态*
