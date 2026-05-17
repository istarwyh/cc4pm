# Lesson 12.1: BMad 完整工作流：四个阶段与三条轨道

## 本课目标

- 在深入使用各个 BMad 代理之前，先建立全局工作流视图
- 理解 BMad 的四个阶段及其依赖关系
- 掌握三条规划轨道，学会根据项目规模选择
- 学会使用 `bmad-help` 智能向导随时获得下一步指引
- 理解"每个工作流新开 session"这一关键实践

## 核心内容

### 先有地图，再探地形

接下来几课（L13–L16）你会逐一认识 Mary、John、Bob 这些 BMM 代理，并深入每个工作流。

但在此之前，值得花 10 分钟建立全局视图——**知道自己在哪，才不会迷路**。

### BMad 的四个阶段

BMad 把产品开发拆成四个阶段，每个阶段有明确的输出物：

```
┌────────────────────────────────────────────────────────────────┐
│                   BMad 四阶段工作流                              │
├───────────┬────────────────────────────────────────────────────┤
│ 阶段 1    │ 分析 Analysis（可选）                                │
│           │ 头脑风暴 / 市场研究 / 产品简报 / PRFAQ              │
│           │ 输出：对产品方向的清晰认知                           │
├───────────┼────────────────────────────────────────────────────┤
│ 阶段 2    │ 规划 Planning（必须）                                │
│           │ 创建 PRD（产品需求文档）                              │
│           │ 输出：PRD.md                                        │
├───────────┼────────────────────────────────────────────────────┤
│ 阶段 3    │ 方案 Solutioning（BMad Method / Enterprise 轨道）   │
│           │ 架构设计 → 拆解 Epics & Stories → 就绪检查          │
│           │ 输出：architecture.md + epics/ 目录                 │
├───────────┼────────────────────────────────────────────────────┤
│ 阶段 4    │ 实现 Implementation                                 │
│           │ 冲刺规划 → 每个 Story 循环：创建 → 开发 → 审查       │
│           │ 输出：可交付的代码                                   │
└───────────┴────────────────────────────────────────────────────┘
```

> **V6 关键改动**：Epics 和 Stories 现在在架构设计**之后**才创建。原因是架构决策（数据库、API 模式、技术栈）会直接影响任务的拆分方式，先做架构再拆 Stories 质量更高。

### 三条规划轨道

BMad 根据项目规模提供三条轨道，安装时选择，后续可切换：

| 轨道 | 适用场景 | 创建的文档 |
|------|---------|-----------|
| **Quick Flow** | Bug 修复、简单功能、需求明确（1-15 个 Story） | 仅 Tech-Spec |
| **BMad Method** | 产品、平台、复杂功能（10-50+ 个 Story） | PRD + 架构 + UX |
| **Enterprise** | 合规系统、多租户（30+ 个 Story） | PRD + 架构 + 安全 + DevOps |

**Story 数量是参考，不是硬规则。** 根据你的规划需求选轨道，而不是数 Story 数量。

**Quick Flow 的特殊之处**：只需运行一个命令 `bmad-quick-dev`，它把规划和实现合并成单一工作流，直接跳到产出代码。适合你已经非常清楚要做什么的场景。

```bash
# Quick Flow 用这一个命令代替 PRD + 架构 + Epics 的全套流程
bmad-quick-dev
```

### PRFAQ：Working Backwards 挑战

分析阶段有一个值得特别介绍的工作流：**PRFAQ**（Press Release + FAQ）。

这是亚马逊发明的"逆向工作法"——在写一行代码之前，先写产品上线时的新闻稿，逼迫你从用户视角定义产品价值。

```bash
# 当你有想法但不确定是否值得做时，用这个来压力测试
bmad-prfaq
```

PRFAQ 会帮你回答：
- 这个产品真正为谁解决了什么问题？
- 媒体会如何描述这个产品？
- 用户最常问的问题是什么？答案是什么？

### bmad-help：你随时可问的智能向导

BMad 内置了一个贯穿全程的智能向导：`bmad-help`。

**它能做什么：**
- 检查你的项目，看哪些阶段已完成
- 根据你安装的模块，显示可用选项
- 告诉你下一步该做什么（包括第一个必须做的任务）
- 回答任何关于 BMad 的问题

```bash
# 直接调用
bmad-help

# 带上下文调用
bmad-help 我有一个 SaaS 产品想法，已经知道所有功能要做什么，从哪里开始？
bmad-help 我刚完成了架构设计，下一步是什么？
bmad-help 我被工作流 X 卡住了
```

**它还会自动运行**：每个 BMad 工作流结束后，`bmad-help` 会自动告诉你下一步该做什么。不需要猜，不需要翻文档。

> 安装 BMad 后，第一件事就是运行 `bmad-help`——它会根据你的项目状态告诉你最合适的起点。

### 关键实践：每个工作流新开 Session

这是 BMad 使用中最重要的操作规范，没有之一：

```
┌─────────────────────────────────────────────────────┐
│            ⚠️  每个工作流 = 新的对话 Session         │
│                                                       │
│  每次运行 bmad-create-prd、bmad-dev-story 等工作流   │
│  之前，都要开一个全新的对话。                          │
│                                                       │
│  原因：上下文积累会导致质量下降和上下文超限问题          │
└─────────────────────────────────────────────────────┘
```

这与 cc4pm 的教学 session 保持分离的原因完全一致——工作流会接管对话上下文。

### project-context.md：让所有代理遵循你的规范

在开始之前，你可以创建一个 `project-context.md` 文件，记录你的技术偏好和实现规范。这个文件会被所有 BMad 代理自动读取，确保整个项目的一致性。

```
# 位置
_bmad-output/project-context.md

# 可以记录的内容
- 技术栈选择（框架、语言、数据库）
- 代码风格规范
- 命名约定
- 架构约束
- 团队偏好
```

你可以手动创建，也可以在架构设计完成后用命令自动生成：

```bash
bmad-generate-project-context
```

### 完整工作流快速参考

| 工作流 | 命令 | 代理 | 阶段 |
|--------|------|------|------|
| `bmad-help` ⭐ | `bmad-help` | 任意 | 全程 |
| 头脑风暴 | `bmad-brainstorming` | Analyst | 1-分析 |
| 市场研究 | `bmad-market-research` | Analyst | 1-分析 |
| 产品简报 | `bmad-product-brief` | Analyst | 1-分析 |
| PRFAQ | `bmad-prfaq` | Analyst | 1-分析 |
| 创建 PRD | `bmad-create-prd` | PM | 2-规划 |
| UX 设计 | `bmad-create-ux-design` | UX Designer | 2-规划 |
| 架构设计 | `bmad-create-architecture` | Architect | 3-方案 |
| 创建 Epics | `bmad-create-epics-and-stories` | PM | 3-方案 |
| 就绪检查 | `bmad-check-implementation-readiness` | Architect | 3-方案 |
| 冲刺规划 | `bmad-sprint-planning` | DEV | 4-实现 |
| 创建 Story | `bmad-create-story` | DEV | 4-实现 |
| 开发 Story | `bmad-dev-story` | DEV | 4-实现 |
| 代码审查 | `bmad-code-review` | DEV | 4-实现 |
| Quick Flow | `bmad-quick-dev` | DEV | 一键 |

### 实现循环：Story 的完整生命周期

进入阶段 4 后，每个 Story 的开发都遵循固定循环：

```
┌─────────────────────────────────────────────────────┐
│                  Story 开发循环                       │
│                                                       │
│  [新 Session] bmad-create-story                      │
│       ↓  从 Epic 创建 Story 文件                      │
│  [新 Session] bmad-dev-story                         │
│       ↓  实现 Story                                  │
│  [新 Session] bmad-code-review（推荐）               │
│       ↓  质量验证                                    │
│  ──── 下一个 Story ────                              │
│                                                       │
│  完成 Epic 所有 Story 后：bmad-retrospective          │
└─────────────────────────────────────────────────────┘
```

### 项目产出物目录结构

安装 BMad 后，你的项目会有这样的结构：

```
your-project/
├── _bmad/                        # BMad 配置（不要手动修改）
├── _bmad-output/
│   ├── planning-artifacts/
│   │   ├── PRD.md                # 产品需求文档
│   │   ├── architecture.md       # 技术架构决策
│   │   └── epics/                # Epic 和 Story 文件
│   ├── implementation-artifacts/
│   │   └── sprint-status.yaml    # 冲刺追踪（自动生成）
│   └── project-context.md        # 实现规范（可选）
└── ...（你的项目代码）
```

## 常见问题

**Q: 我一定要按四个阶段顺序走吗？**

A: 阶段 1（分析）完全可选。Quick Flow 轨道甚至跳过 2-3 阶段，直接用 `bmad-quick-dev` 一键完成。有经验后你也可以直接跳到需要的工作流，参考上方快速参考表。

**Q: Quick Flow 和 BMad Method 怎么选？**

A: 简单判断：如果你需要写 PRD 来对齐团队或记录需求，选 BMad Method。如果只是自己清楚要做什么、直接动手，选 Quick Flow。不是 Story 数量决定，是你的规划需求决定。

**Q: 每次都要新开 Session 太麻烦了，能不能不做？**

A: 这不是建议，是必须。上下文堆积会导致代理决策质量明显下降，甚至引发上下文超限报错。新 Session 的成本远小于因此产生的错误修复成本。

**Q: `bmad-help` 和具体的工作流命令有什么区别？**

A: `bmad-help` 是"导航系统"，告诉你该去哪里、该做什么。具体工作流命令（如 `bmad-create-prd`）是"执行工具"，干具体的活。卡住了先问 `bmad-help`，它会告诉你选项。

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 13 - 市场研究与领域分析（认识 Mary）
- 返回主菜单
- 退出学习

---
*阶段 2 | Lesson 12.1/26 | 上一课: Lesson 12 - 创新策略 | 下一课: Lesson 13 - 市场研究*
