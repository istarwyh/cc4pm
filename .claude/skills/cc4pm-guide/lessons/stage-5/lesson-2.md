# Lesson 25: 完整项目实战：从零到发布

## 本课目标

- 将 26 课学到的所有工具和流程串联成一个完整的项目实战
- 掌握 CIS→BMM→WDS→Engineering 四阶段全流程的实际操作顺序
- 理解每个阶段的输入/输出如何衔接
- 获得一张可以直接使用的"项目启动清单"

## 核心内容

### 全流程回顾：AI 记账工具从零到发布

让我们用贯穿全课程的"AI 记账工具"例子，走一遍从想法到发布的完整流程。

> **知识衔接**：本课综合使用了前面所有阶段的工具——**阶段 2** 的 CIS/BMM 命令（Lesson 11-16）、**阶段 3** 的 WDS 场景设计（Lesson 17-20）、**阶段 4** 的工程命令和自动化 Hooks（Lesson 21-23）。在工程步骤中，Lesson 23 介绍的 21 个 Hook 会在后台自动运行质量保障。

```
Day 1 上午 ─── CIS 创意阶段 ───────────────────
│
├─ Step 1: /bmad-brainstorming
│  Carson 用 36 种技巧生成 120+ 创意
│  聚焦方向：AI 驱动的小微企业记账
│  产出：创意清单 + 可行性初评
│
├─ Step 2: /bmad-cis-innovation-strategy
│  Victor 做蓝海分析：
│  "记账 App 都在问'花了多少钱'，
│   没人问'为什么花这笔钱'"
│  产出：3 个战略方向 + 商业模式画布
│
Day 1 下午 ─── BMM 需求阶段 ────────────────────
│
├─ Step 3: /bmad-analyst → [MR]
│  Mary 联网做市场研究：
│  1.2 亿小微企业主，67% 用 Excel
│  产出：市场研究报告
│
├─ Step 4: /bmad-pm → [CP]
│  John 引导 12 步创建 PRD：
│  愿景、用户画像、功能需求、非功能需求
│  产出：标准化 PRD 文档
│
├─ Step 5: /bmad-pm → [VP]
│  John 用 13 步验证 PRD 质量
│  产出：验证报告 + 修改建议
│
Day 2 上午 ─── BMM 拆解阶段 ────────────────────
│
├─ Step 6: /bmad-architect
│  Architect 设计技术架构：
│  前端 React Native + 后端 Node.js + AI 服务
│  产出：架构文档
│
├─ Step 7: /bmad-pm → [CE]
│  John 拆解 PRD 为 Epics 和 Stories：
│  Epic 1: 核心记账（5 Stories）
│  Epic 2: AI 分类（3 Stories）
│  Epic 3: 报表生成（4 Stories）
│  产出：Epics 文件 + BDD 验收标准
│
├─ Step 8: /bmad-pm → [IR]
│  John 检查实现就绪度
│  产出：就绪检查报告
│
Day 2 下午 ─── BMM 执行阶段 ────────────────────
│
├─ Step 9: /bmad-sm → [SP]
│  Bob 生成冲刺计划：
│  Sprint 1: Story 1-3（核心记账）
│  Sprint 2: Story 4-6（AI 分类）
│  产出：sprint-status.yaml
│
Day 3 ─── WDS 设计阶段 ─────────────────────────
│
├─ Step 10: /bmad-wds-trigger-mapping
│  Saga 引导 4 个 Workshop：
│  发现 6 个核心驱动力（3 正向 + 3 负向）
│  产出：Trigger Map 文档集
│
├─ Step 11: /bmad-wds-scenarios
│  Saga + Freya 创建 8 个 UX 场景：
│  每个场景 8 组成部分 + "阳光路径"
│  产出：场景大纲文档
│
├─ Step 12: /bmad-wds-scenarios-validate
│  验证场景质量（25 项检查）
│  产出：验证报告
│
├─ Step 13: /bmad-wds-ux-design
│  Freya 把场景变成界面规范：
│  每个页面有布局、组件、交互说明
│  产出：页面规范文档
│
Day 4 ─── 故事与工程 ───────────────────────────
│
├─ Step 14: /bmad-cis-storytelling
│  Sophia 构建投资路演故事：
│  "认知颠覆" + "问题-方案-价值" 组合框架
│  产出：叙事稿
│
├─ Step 15: /bmad-cis-presentation-master
│  Caravaggio 制作 12 页幻灯片
│  产出：投资路演 PPT
│
├─ Step 16: /plan
│  Planner 为 Sprint 1 第一个 Story 做规划
│  产出：实施计划 + 风险评估
│
├─ Step 17: /tdd
│  TDD Guide 执行 RED→GREEN→REFACTOR：
│  先写测试 → 最少代码通过 → 重构优化
│  ⚙ 后台自动：post-edit-format.js 格式化、post-edit-typecheck.js 类型检查、quality-gate.js 质量门禁
│  产出：测试套件 + 生产代码
│
├─ Step 18: /code-review
│  Code Reviewer 审查安全和质量
│  产出：审查报告
│
├─ Step 19: /e2e
│  E2E Runner 验证完整用户流程
│  产出：测试报告 + 截图/视频
│
Day 5 ─── 发布 ─────────────────────────────────
│
├─ Step 20: git commit → PR → merge
│  ⚙ 后台自动：pre-bash-git-push-reminder.js 提醒先 review、post-bash-pr-created.js 记录 PR URL
│  代码合并到主分支
│
├─ Step 21: 部署
│  通过 Vercel MCP (http: https://mcp.vercel.com) 或 Railway MCP (npx -y @railway/mcp-server) 部署
│
└─ Step 22: /bmad-sm → [SS]
   Bob 更新冲刺状态
   产出：Sprint 1 进度报告
```

### 关键衔接点

每个阶段的输出是下一个阶段的输入——这是 cc4pm 的核心设计：

```
CIS 创意清单
    ↓ 选出最有潜力的方向
BMM PRD
    ↓ 拆解为可执行的 Epics/Stories
BMM Epics + 架构文档
    ↓ 提供产品上下文
WDS Trigger Map
    ↓ 发现用户心理驱动力
WDS UX 场景
    ↓ 每个场景基于驱动力
WDS 页面规范
    ↓ 设计有心理依据
Engineering /plan
    ↓ 基于 Story 的 BDD 标准
Engineering /tdd
    ↓ 测试覆盖 BDD 验收标准
Engineering /e2e
    ↓ 验证 UX 场景的"最短路径"
```

### PM 的项目启动清单

当你启动一个新项目时，按这个顺序执行：

```
□ Phase 1: 定义方向（半天）
  □ /bmad-brainstorming → 生成创意
  □ /bmad-cis-innovation-strategy → 选择方向

□ Phase 2: 明确需求（1 天）
  □ /bmad-analyst → 市场研究
  □ /bmad-pm → [CP] 创建 PRD
  □ /bmad-pm → [VP] 验证 PRD

□ Phase 3: 拆解计划（半天）
  □ /bmad-architect → 技术架构
  □ /bmad-pm → [CE] 拆解 Epics
  □ /bmad-pm → [IR] 检查就绪度
  □ /bmad-sm → [SP] 冲刺规划

□ Phase 4: 设计体验（1 天）
  □ /bmad-wds-trigger-mapping → 用户心理
  □ /bmad-wds-scenarios → UX 场景
  □ /bmad-wds-scenarios-validate → 场景验证
  □ /bmad-wds-ux-design → 界面规范

□ Phase 5: 讲好故事（半天）
  □ /bmad-cis-storytelling → 产品叙事
  □ /bmad-cis-presentation-master → 演示制作

□ Phase 6: 开发交付（按 Sprint 循环）
  □ /plan → 任务规划
  □ /tdd → 测试驱动开发
  □ /code-review → 代码审查
  □ /e2e → 端到端测试
  □ /bmad-sm → [SS] 冲刺状态

□ Phase 7: 持续改进
  □ /learn → 提取经验
  □ /bmad-wds-product-evolution → 产品迭代
  □ /bmad-retrospective → 回顾总结
```

### 代理协作全景图

```
CIS 创意团队                    BMM 执行团队
┌───────────┐                  ┌───────────┐
│ Carson    │→ 头脑风暴         │ Mary      │→ 市场研究
│ Victor    │→ 创新策略         │ John      │→ PRD/Epics
│ Mary      │→ 设计思维         │ Bob       │→ 冲刺管理
│ John(CIS) │→ 创新策略         │ Architect │→ 架构设计
│ Sophia    │→ 故事讲述         │ Dev       │→ Story 开发
│ Caravaggio│→ 演示制作         │ QA        │→ 质量保障
└───────────┘                  └───────────┘

WDS 设计团队                    Engineering 工程团队
┌───────────┐                  ┌───────────┐
│ Saga      │→ 分析/Trigger     │ Planner   │→ 任务规划
│ Freya     │→ 设计/实现        │ TDD Guide │→ 测试驱动
│           │                  │ Code Rev. │→ 代码审查
│           │                  │ E2E Runner│→ 端到端测试
│           │                  │ Build Fix │→ 构建修复
│           │                  │ Security  │→ 安全审查
└───────────┘                  └───────────┘

共计：18+ 专业代理，覆盖产品开发全生命周期
```

### 不同项目规模的推荐流程

| 项目规模 | 推荐流程 | 耗时 |
|---------|---------|------|
| 小（MVP/原型） | CIS(快速) → PRD(简化) → TDD → 部署 | 1-2 天 |
| 中（功能完整） | CIS → BMM → WDS(核心) → Engineering | 1-2 周 |
| 大（团队协作） | CIS全流程 → BMM全流程 → WDS全流程 → Engineering全流程 | 2-4 周 |

**MVP 快速模式**：

```bash
/bmad-quick-spec          # 快速生成技术规格
/bmad-quick-dev           # 快速实现
```

### 项目冷启动：双实例启动模式

从零开始一个新项目时，一个高效的模式是**同时开两个 Claude 实例**，各自负责不同方向：

| 实例 | 职责 | 产出 |
|------|------|------|
| **实例 1：脚手架代理** | 搭建项目骨架、配置 CLAUDE.md、设置 Rules 和 Agents | 可运行的项目目录 |
| **实例 2：深度研究代理** | 连接 MCP 做市场调研、写 PRD、创建架构图、整理文档 | PRD + 架构设计 + 参考资料 |

```bash
# 终端 1：脚手架
claude
"创建一个 Next.js 项目，配置好 CLAUDE.md、rules、agents"

# 终端 2：研究（同时进行）
claude
"用 /bmad-market-research 调研 AI 记账工具市场，
 然后 /bmad-create-prd 生成 PRD"
```

两个实例完成后，用 `--continue` 在实例 1 中继续，喂入实例 2 的产出文件，开始正式开发。

**关键**：两个实例各自有独立的上下文窗口，互不干扰——脚手架不会被研究内容污染，研究也不会被配置文件淹没。

## 🛠️ 实操练习

完成以下练习，体验完整的项目实战流程。

### 练习 1：启动一个完整项目

选择一个真实的产品想法，按照完整流程走一遍：

```bash
# Phase 1: 创意发散
/bmad-brainstorming

# Phase 2: 创新策略
/bmad-cis-innovation-strategy

# Phase 3: 市场研究
/bmad-analyst

# Phase 4: 创建 PRD
/bmad-pm
```

### 练习 2：尝试 MVP 快速模式

对于小型项目，使用快速模式：

```bash
# 快速生成技术规格
/bmad-quick-spec

# 快速实现
/bmad-quick-dev
```

### 练习 3：文档化现有项目

如果你有一个已经在开发的项目：

```bash
# 文档化现有项目
/bmad-document-project

# 生成项目上下文
/bmad-generate-project-context
```

### 练习 4：双实例启动模式

尝试同时开两个 Claude 实例：

| 实例 | 职责 | 命令 |
|------|------|------|
| 实例 1 | 脚手架 | 创建项目结构、配置 CLAUDE.md |
| 实例 2 | 深度研究 | 市场调研、PRD、架构设计 |

**检查清单**：
- [ ] 完成了至少 Phase 1-4 的流程
- [ ] 尝试了 MVP 快速模式
- [ ] 了解了如何文档化现有项目
- [ ] 理解了双实例启动模式

---

## 常见问题

**Q: 必须按照这个顺序来吗？**

A: 不必严格按顺序。核心原则是：(1) CIS 在 BMM 之前（先发散后收敛）；(2) Trigger Map 在 UX 设计之前（先理解心理后设计界面）；(3) /plan 在 /tdd 之前（先规划后编码）。其他步骤可以根据项目需要灵活调整。

**Q: 一个人也能用完整流程吗？**

A: 完全可以。cc4pm 的 AI 代理替代了传统团队中的多个角色（市场分析师、产品主理人、设计师、测试工程师）。一个人 + cc4pm 可以完成传统 5-8 人团队的工作。

**Q: 如果产品已经做了一半，怎么引入 cc4pm？**

A: 用 /bmad-document-project 先文档化现有项目，然后从任意阶段切入。最推荐的切入点是 WDS Trigger Map——它可以帮你重新审视已有功能是否真的满足用户需求。

## 下一步

- [1] 进入最后一课：Lesson 26 - 课程总结与进阶
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 25/26 (阶段内 2/3) | 上一课: Lesson 24 - 高级特性 | 下一课: Lesson 26 - 课程总结*
