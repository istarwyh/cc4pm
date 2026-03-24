# Lesson 6: 命令与技能系统

## 本课目标

- 理解 Commands 与 Skills 的区别、演进关系和各自定位
- 掌握 SKILL.md 的标准格式和关键字段
- 了解命令和技能的存放位置与上下文预算
- 通过 cc4pm 实例认识完整的命令和技能生态

## 核心内容

### Commands vs Skills：从命令到技能的演进

Claude Code 的扩展能力经历了一次重要演进：从 Commands 到 Skills。

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  Commands（命令）—— 早期方式                        │
│  ↓ 用户输入 /command-name 手动触发                  │
│  ↓ 类似"快捷键"——你按了才执行                       │
│                                                   │
│  Skills（技能）—— 推荐方式                          │
│  ↓ Claude 根据语义自动匹配并触发                     │
│  ↓ 也可以用 /skill-name 手动触发                    │
│  ↓ 类似"条件反射"——遇到对应场景自动启用              │
│                                                   │
│  在新版本中，Commands 和 Skills 已合并为统一系统      │
│  Skills 是推荐的方式，但老的 Commands 仍然兼容        │
│                                                   │
└──────────────────────────────────────────────────┘
```

**核心区别**：

| 特性 | Commands | Skills |
|------|----------|--------|
| 触发方式 | 只能手动 `/command` | 自动匹配 + 手动 `/skill` |
| 智能激活 | 不支持 | Claude 根据描述自动判断 |
| 上下文隔离 | 不支持 | 支持 `context: fork` |
| 附带脚本 | 不支持 | 可以打包任意语言的脚本 |
| 模型调用控制 | 无 | `disable-model-invocation` |
| 推荐程度 | 兼容保留 | 推荐使用 |

**实际体验**：当你在 cc4pm 中说"帮我做代码审查"，Claude 可能自动激活 code-review 技能——你不需要记住命令名，Claude 根据你的意图来匹配。

### SKILL.md 格式详解

每个技能是一个目录，包含一个 `SKILL.md` 文件。以下是标准格式：

```markdown
---
name: skill-name
description: 描述什么时候应该激活这个技能（最重要的字段，最多 1024 字符）
disable-model-invocation: true
---
# 技能标题

## When to Activate
描述触发条件...

## Core Concepts
核心知识和方法论...

## Steps
执行步骤...
```

**关键字段解析**：

| 字段 | 作用 | 示例 |
|------|------|------|
| `name` | 技能标识符，也是 `/skill-name` 的触发名 | `tdd-workflow` |
| `description` | **最重要的字段**——Claude 根据它判断是否自动激活 | "Use when writing new features or fixing bugs" |
| `disable-model-invocation` | 设为 `true` 则只能手动触发 | 有副作用的操作设为 true |
| `context: fork` | 在独立子代理上下文中运行 | 不污染主对话的调研类技能 |

**关于 `description` 字段**：这是技能被自动发现的关键。Claude 会将用户的输入与所有技能的 description 进行语义匹配。写得好，技能就能在对的时机被激活；写得差，技能要么不被发现，要么在不该触发时触发。

**关于 `disable-model-invocation`**：默认情况下，Claude 可以自主决定调用技能。但对于有副作用的操作（比如部署、删除文件、发布版本），应该设为 `true`，只允许用户手动触发。

### 命令和技能的存放位置

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  项目级别（只在当前项目生效）                         │
│  .claude/commands/    项目级命令                    │
│  .claude/skills/      项目级技能                    │
│                                                   │
│  全局级别（所有项目都生效）                           │
│  ~/.claude/commands/  全局命令                      │
│  ~/.claude/skills/    全局技能                      │
│                                                   │
│  优先级：项目级 > 全局级                             │
│  （同名时，项目级覆盖全局级）                         │
│                                                   │
└──────────────────────────────────────────────────┘
```

**选择项目级还是全局级？**

| 放在项目级 | 放在全局级 |
|-----------|-----------|
| 项目特定的工作流 | 你所有项目都通用的工具 |
| 团队共享（提交到 Git） | 个人偏好（不提交） |
| 依赖项目特定的文件结构 | 与项目无关的通用能力 |

### 上下文预算

技能不是免费的——每个技能加载到对话中时，会占用上下文空间。

```
┌──────────────────────────────────────────────────┐
│                                                   │
│  每个 Skill 占用约 2% 的上下文窗口                   │
│  （回退值：约 16,000 字符）                         │
│                                                   │
│  用 /context 命令查看当前上下文使用情况               │
│                                                   │
│  这也是 Skills 比把内容塞进 CLAUDE.md 更好的原因：    │
│  - CLAUDE.md：每次对话都加载，无论是否需要            │
│  - Skills：按需加载，只在相关时才占用空间             │
│                                                   │
│  把 100 行规则放进 CLAUDE.md → 每次都消耗            │
│  把 100 行规则做成 Skill → 只在需要时消耗            │
│                                                   │
└──────────────────────────────────────────────────┘
```

这也解释了为什么 cc4pm 把大量的领域知识（BMM 方法论、CIS 创意技巧、WDS 设计流程）放在 Skills 里而不是 CLAUDE.md 里——只在需要时加载，不浪费日常对话的上下文空间。

### cc4pm 的技能实例解析

来看一个 cc4pm 中真实的技能文件：

```markdown
---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs,
  or refactoring code. Enforces test-driven development with 80%+
  coverage including unit, integration, and E2E tests.
origin: ECC
---

# Test-Driven Development Workflow

## When to Activate
- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code

## Core Concepts
...（TDD 方法论和步骤）
```

注意看它的 `description`：明确列出了三种触发场景（写新功能、修 bug、重构代码）。当你说"帮我实现一个新功能"，Claude 就会匹配到这个技能。

## 演示案例：浏览 cc4pm 的命令和技能

### 案例 1：探索命令生态

```bash
cd cc4pm
claude

"列出 commands/ 目录下的所有 .md 文件。
 按功能分类（创意、规划、执行、质量、知识管理），
 每个命令用一句话描述作用。"
```

预期输出（部分）：

```
cc4pm 命令分类（48 个命令）

创意探索（4 个）：
  /bmad-brainstorming         36 种创意技巧结构化头脑风暴
  /bmad-cis-innovation-strategy  蓝海分析+商业模式创新
  /bmad-cis-design-thinking   同理心驱动的设计思维流程
  /bmad-cis-storytelling      25 种故事框架的产品叙事

分析规划（6 个）：
  /bmad-create-prd            AI 引导创建完整 PRD
  /bmad-validate-prd          验证 PRD 完整性
  /bmad-create-architecture   技术架构设计
  /bmad-market-research       市场研究与竞争分析
  /bmad-create-epics-and-stories  需求拆解为史诗和故事
  /bmad-edit-prd              迭代修改 PRD

执行交付（4 个）：
  /plan                       需求→结构化开发计划
  /tdd                        测试驱动开发工作流
  /bmad-sprint-planning       冲刺规划
  /orchestrate                多代理协作流水线

质量验证（3 个）：
  /code-review                代码质量+安全审查
  /e2e                        端到端测试生成
  /bmad-retrospective         冲刺回顾总结

知识管理（3 个）：
  /learn                      提取会话中的经验模式
  /evolve                     将经验聚类为技能
  /save-session               保存工作上下文
```

### 案例 2：分析技能格式

```bash
# 查看一个具体的技能文件
"读一下 skills/tdd-workflow/SKILL.md，分析它的格式结构：
 1. YAML 前置包含哪些字段？
 2. 正文有哪些章节？
 3. description 是怎么写的——为什么这样写有效？"
```

### 案例 3：统计项目级技能

```bash
# 查看项目安装了多少技能
"统计 .claude/skills/ 目录下有多少个子目录。
 随机抽取 5 个，读取它们的 SKILL.md 的 description 字段，
 分析这些描述的写作模式有什么共同点。"
```

预期发现：

```
.claude/skills/ 下共有 110+ 个技能目录

随机抽取 5 个的 description 分析：

共同模式：
1. 都以动作开头（"Use when..."、"Activate for..."）
2. 都明确列出触发场景（2-4 个具体场景）
3. 都控制在 1-2 句话内
4. 都避免模糊描述（不说"general purpose"这种）
```

## 动手试试

### 练习 1：浏览可用命令

```bash
cd cc4pm
claude

# 在交互模式中输入 / 然后查看自动补全
/
# → 会列出所有可用的命令和技能
# → 可以输入关键词搜索，比如 /bmad 或 /code
```

### 练习 2：理解技能的自动触发

```bash
claude

# 不使用任何斜杠命令，直接描述需求
"我想做一次代码审查，看看最近的代码改动质量如何"
# → 观察 Claude 是否自动激活了 code-review 相关的技能
# → 注意提示中是否出现 "Using skill: ..." 的提示
```

### 练习 3：检查上下文占用

```bash
claude

# 查看当前上下文使用情况
/context
# → 会显示上下文窗口的使用百分比
# → 注意 Skills 占用了多少空间
```

### 练习 4：对比命令 vs 技能的体验

```bash
# 方式 A：直接用命令
/code-review

# 方式 B：自然语言描述（让 Claude 匹配技能）
"审查一下最近的代码改动，关注安全性和可维护性"

# 对比两种方式的输出有什么异同
```

## cc4pm 的命令分类总览

按工作流阶段整理 cc4pm 的完整命令体系：

```
┌─ 创意探索 ────────────────────────────────────────┐
│                                                    │
│  /bmad-brainstorming          36 种创意技巧头脑风暴  │
│  /bmad-cis-innovation-strategy 蓝海分析+商业模式    │
│  /bmad-cis-design-thinking    同理心驱动的设计思维   │
│  /bmad-cis-storytelling       25 种故事框架产品叙事  │
│  /bmad-cis-problem-solving    创意问题解决          │
│                                                    │
├─ 分析规划 ────────────────────────────────────────┤
│                                                    │
│  /bmad-market-research        市场研究与竞争分析     │
│  /bmad-create-product-brief   产品简报              │
│  /bmad-create-prd             AI 引导创建完整 PRD   │
│  /bmad-validate-prd           验证 PRD 完整性       │
│  /bmad-edit-prd               迭代修改 PRD          │
│  /bmad-create-architecture    技术架构设计          │
│  /bmad-create-epics-and-stories 需求拆解           │
│                                                    │
├─ 执行交付 ────────────────────────────────────────┤
│                                                    │
│  /plan                        需求→结构化开发计划   │
│  /tdd                         测试驱动开发          │
│  /bmad-sprint-planning        冲刺规划             │
│  /bmad-sprint-status          冲刺状态追踪          │
│  /orchestrate                 多代理协作流水线      │
│  /build-fix                   修复构建错误          │
│                                                    │
├─ 质量验证 ────────────────────────────────────────┤
│                                                    │
│  /code-review                 代码质量+安全审查     │
│  /e2e                         端到端测试           │
│  /bmad-retrospective          回顾总结             │
│  /bmad-check-implementation-readiness  实现就绪检查 │
│                                                    │
├─ 知识管理 ────────────────────────────────────────┤
│                                                    │
│  /save-session                保存工作上下文        │
│  /learn                       提取会话中的经验模式  │
│  /evolve                      将经验聚类为技能      │
│  /skill-create                从 Git 历史生成技能   │
│                                                    │
└───────────────────────────────────────────────────┘
```

**记住**：你不需要记住所有命令。输入 `/` 就能浏览和搜索。先掌握 5 个核心命令（Lesson 3 已介绍），其他命令在需要时再查。

## 常见问题

**Q: 我应该用 Command 还是 Skill 来创建自己的工作流？**

A: 推荐用 Skill。它支持自动激活、上下文隔离、附带脚本等更丰富的能力。除非你有特殊原因需要兼容旧版 Claude Code，否则一律用 Skill。

**Q: 技能太多会影响性能吗？**

A: 不会。Claude 只加载与当前任务语义匹配的技能，而不是全部加载。100 个技能和 10 个技能对日常对话的性能影响基本一致。

**Q: 我可以自己创建技能吗？**

A: 当然可以。cc4pm 甚至提供了 `/skill-create` 命令来帮你从 Git 历史中自动提取技能。你也可以手动在 `.claude/skills/` 下创建目录和 SKILL.md 文件。后续课程会详细讲解。

**Q: 技能可以调用其他技能吗？**

A: 技能本身不直接调用其他技能，但一个技能的输出可以触发 Claude 匹配到另一个技能。比如执行 /plan 后 Claude 可能自动匹配到 tdd-workflow 技能来开始实现。这种"链式触发"是自然发生的。

**Q: `context: fork` 和子代理有什么关系？**

A: `context: fork` 让技能在一个独立的子代理上下文中运行。这意味着技能执行过程中读取的大量文件不会污染你的主对话。执行完毕后，只有技能的结果摘要返回到主上下文。非常适合调研类、分析类的技能。

## 下一步

- [1] 进入下一课：Lesson 6.1 - Skill 深度：新一代交互式软件
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 6/10 | 上一课: Lesson 5 - CLAUDE.md | 下一课: Lesson 6.1 - Skill 深度*
