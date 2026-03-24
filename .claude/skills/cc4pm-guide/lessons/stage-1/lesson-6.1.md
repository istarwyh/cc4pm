# Lesson 6.1: Skill 深度：新一代交互式软件

## 本课目标

- 理解 Skill 作为新一代交付形态的意义
- 掌握 Skill 创建的完整流程和最佳实践
- 学会测试 Skill 的可触发性和可复现性
- 了解渐进式披露的上下文管理策略

## 核心内容

### Skill 不只是替代 Commands——它是新的交付形态

回顾第 6 课，我们知道 Skill 在功能上替代了 Commands。但这只是表面。更深层的变化是：

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  传统软件          →  命令行工具、Web 应用、桌面应用     │
│  交付形态          →  .exe, .app, .zip, npm install    │
│  用户界面          →  按钮、菜单、命令行参数             │
│                                                        │
│  Skill 时代        →  一个 SKILL.md + 脚本 + 引用       │
│  交付形态          →  一个文件夹，入口是 SKILL.md        │
│  用户界面          →  自然语言——"帮我做XXX"              │
│                                                        │
│  本质变化：                                              │
│  从"学习如何使用工具"变成"描述你要什么"                    │
│  从"安装-配置-操作"变成"放进目录-自动生效"                │
│  从"固定的 UI 交互"变成"AI 理解意图后自适应执行"          │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Skill 是新一代交互式软件的雏形**：
- **入口**：一个 SKILL.md 文件（而不是一个 URL 或可执行文件）
- **界面**：自然语言（而不是按钮和表单）
- **智能**：AI 根据上下文自适应执行（而不是固定流程）
- **分发**：一个文件夹或 .skill 包（而不是安装程序）
- **扩展**：附带脚本、引用和资产（而不是插件 API）

### Skill 的解剖结构

```
skill-name/
├── SKILL.md                # 入口——必需
│   ├── YAML frontmatter    # 元数据：name + description（触发器）
│   └── Markdown body       # 指令：工作流、步骤、约束
├── scripts/                # 可执行脚本（确定性操作）
│   └── rotate_pdf.py       # 比让 Claude 重写代码更可靠
├── references/             # 参考文档（按需加载到上下文）
│   ├── finance.md          # 领域知识
│   └── api_docs.md         # API 规范
└── assets/                 # 资产文件（用于输出，不加载到上下文）
    ├── logo.png            # 品牌素材
    └── template.pptx       # 输出模板
```

#### 三级渐进式披露

这是 Skill 最精妙的设计——上下文分层管理：

| 级别 | 内容 | 何时加载 | 大小限制 |
|------|------|---------|---------|
| **Level 1：元数据** | name + description | 始终在上下文中 | ~100 词 |
| **Level 2：SKILL.md body** | 工作流指令 | Skill 触发时 | <5K 词 / <500 行 |
| **Level 3：bundled resources** | 脚本/引用/资产 | Claude 按需读取 | 无限制（脚本可执行不加载） |

**为什么这很重要？** 假设你安装了 100 个 Skill：
- Level 1：100 个 description 常驻上下文 ≈ 10K tokens（可接受）
- Level 2：只有被触发的 1-2 个 Skill 加载 body ≈ 5K tokens
- Level 3：只在需要时读取特定的引用文件

这就是为什么 cc4pm 能装 96+ 个 Skill 而不会让日常对话变慢。

### 创建 Skill 的六步流程

来自 `/skill-creator` 的最佳实践：

```
步骤 1：理解——用具体示例明确 Skill 要做什么
  "用户会说什么来触发这个 Skill？"
  "Skill 应该支持哪些功能？"

步骤 2：规划——分析每个示例，识别可复用的资源
  哪些操作需要脚本？哪些知识需要引用文件？

步骤 3：初始化——用 init_skill.py 创建模板
  自动生成目录结构和 SKILL.md 模板

步骤 4：编辑——实现资源 + 编写 SKILL.md
  先写脚本和引用，再写 SKILL.md 指令

步骤 5：打包——用 package_skill.py 验证和分发
  自动检查格式、字段、结构

步骤 6：迭代——在真实使用中持续改进
  使用 → 发现问题 → 修改 → 再测试
```

### 核心原则

#### 原则 1：精简是王道

> **默认假设：Claude 已经非常聪明。只添加 Claude 不知道的信息。**

对 SKILL.md 中的每一段，问自己："这段话值它的 token 成本吗？"

```
❌ 解释什么是 REST API（Claude 知道）
❌ 详述 JSON 语法（Claude 知道）
✅ 你们公司的 API 认证方式（Claude 不知道）
✅ 数据库表结构和字段含义（Claude 不知道）
```

#### 原则 2：设置合适的自由度

| 自由度 | 适用场景 | 类比 |
|--------|---------|------|
| **高自由度**（文本指令） | 多种方案都合理 | 开阔原野，多条路可走 |
| **中自由度**（伪代码+参数） | 有首选模式但允许变化 | 有推荐路线的公园 |
| **低自由度**（具体脚本） | 操作脆弱、一致性关键 | 悬崖上的窄桥，需要护栏 |

#### 原则 3：避免深层嵌套

引用文件保持**一级深度**——所有 reference 文件都从 SKILL.md 直接链接，不要 A 引用 B、B 再引用 C。

### 写好 description——Skill 的灵魂

description 是 Skill 被自动发现的关键。Claude 会将用户输入与所有 Skill 的 description 做语义匹配。

**好的 description 模式**：

```yaml
description: >
  Use this skill when the user wants to create, read, edit, or
  convert Word documents (.docx files). Covers: (1) Creating new
  documents, (2) Modifying existing content, (3) Working with
  tracked changes, (4) Adding comments.
```

**坏的 description**：

```yaml
description: "A general-purpose document tool"
# → 太模糊，什么时候触发？和什么匹配？
```

**写作要诀**：
1. 以动作开头（"Use when..."、"Activate for..."）
2. 列出 2-4 个具体触发场景
3. 控制在 1-3 句话
4. 包含关键词（Claude 做语义匹配时需要）

### 测试 Skill：可触发性与可复现性

创建 Skill 后必须测试两个维度：

#### 可触发性测试（Triggerability）

验证 Skill 是否在正确的时机被激活：

```bash
# 测试 1：正向触发——应该激活的场景
claude
"帮我创建一个 PRD"
# → 预期：bmad-create-prd 被激活
# → 检查：Claude 的输出是否显示 "Using skill: ..."

# 测试 2：负向触发——不应该激活的场景
claude
"帮我修一个 CSS bug"
# → 预期：bmad-create-prd 不被激活
# → 检查：没有出现 PRD 相关的工作流

# 测试 3：边界触发——模糊场景
claude
"我们需要一份产品文档"
# → 预期：触发（"产品文档"语义接近 PRD）
```

**可触发性清单**：

| 检查项 | 方法 |
|--------|------|
| 精确匹配 | 用 description 中的关键词测试 |
| 语义匹配 | 用同义词和换一种说法测试 |
| 负面排除 | 用不相关的请求测试是否误触发 |
| 多语言 | 用中文和英文分别测试 |

#### 可复现性测试（Reproducibility）

验证 Skill 在不同上下文中产出一致的结果：

```bash
# 测试 1：空白上下文
/clear
"[触发 Skill 的请求]"
# → 记录输出质量

# 测试 2：有前置上下文
"先帮我读一下 README.md"
"[触发 Skill 的请求]"
# → 对比：输出是否一致

# 测试 3：重复执行
/clear
"[相同请求]"
# → 对比：三次执行结果是否结构一致
```

**可复现性清单**：

| 检查项 | 标准 |
|--------|------|
| 输出结构一致 | 同样的请求产出同样的章节/格式 |
| 步骤完整性 | 工作流中的每一步都被执行 |
| 脚本可执行 | 附带的脚本在干净环境中能运行 |
| 引用可发现 | Claude 能找到并正确使用 reference 文件 |

### 演示案例：在 cc4pm 中触发和观察 Skill

```bash
cd cc4pm
claude

# 案例 1：观察自动触发
"我想给这个项目做一次代码审查"
# → 观察 Claude 是否激活了 code-review 技能
# → 观察技能加载后 Claude 的行为变化

# 案例 2：观察渐进式披露
"我想做一次头脑风暴"
# → Level 1：Claude 匹配到 bmad-brainstorming 的 description
# → Level 2：SKILL.md body 加载，Claude 开始按工作流执行
# → Level 3：如果需要特定技巧，Claude 读取 references/ 文件

# 案例 3：手动触发并观察完整流程
/bmad-brainstorming
# → 直接加载 SKILL.md body，跳过匹配阶段
```

## 动手试试

### 练习 1：分析一个真实 Skill

```bash
claude
"读 .claude/skills/skill-creator/SKILL.md，分析：
 1. description 是怎么写的？为什么有效？
 2. 内容结构包含哪些部分？
 3. references/ 和 scripts/ 各有什么文件？
 4. 如何体现渐进式披露原则？"
```

### 练习 2：设计一个 Skill（不用真的创建）

```bash
claude
"假设我要创建一个 'daily-standup' Skill，
 用于生成每日站会汇报（包含昨日完成、今日计划、阻碍）。
 请按 /skill-creator 的流程，设计：
 1. description 字段怎么写
 2. SKILL.md body 应该包含什么
 3. 需要哪些 references/ 和 scripts/
 4. 怎么测试可触发性和可复现性"
```

### 练习 3：进阶思考

```bash
claude
"如果把一个完整的'客户成功管理流程'打包成 Skill：
 - 入口是 SKILL.md（描述什么时候触发、核心流程）
 - scripts/ 包含数据分析脚本
 - references/ 包含客户分层标准和话术模板
 - assets/ 包含报告模板

 与传统的 SaaS 工具（如 Gainsight）相比，
 这种 Skill 形态的交付有什么优劣势？"
```

> **完整的可视化讲解请打开** [lesson-6.1-skill-deep-dive.html](lesson-6.1-skill-deep-dive.html)

## 常见问题

**Q: Skill 能完全替代传统软件吗？**

A: 目前不能完全替代，但在知识工作领域（分析、规划、文档、代码）已经非常强大。它的优势在于"零学习成本"——用户不需要学习界面，用自然语言就能操作。局限在于需要 Claude Code 环境，且对实时数据和复杂交互的支持有限。

**Q: Skill 中的脚本必须用 Python 吗？**

A: 不是。可以用任何语言：Python、Bash、Node.js、Go 等。选择取决于你的项目环境。Python 最常见是因为它的通用性和库生态。

**Q: 如何分发 Skill 给团队？**

A: 两种方式：(1) 放在项目的 `.claude/skills/` 目录，通过 Git 分发；(2) 用 `package_skill.py` 打包成 `.skill` 文件分发。团队成员只需把 `.skill` 文件放到全局或项目目录即可使用。

## 下一步

- [1] 进入下一课：Lesson 7 - 代理系统：你的 AI 专家团
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 6.1/10 | 上一课: Lesson 6 - 命令与技能系统 | 下一课: Lesson 7 - 代理系统*
