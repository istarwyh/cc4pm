# Lesson 16: 冲刺规划与进度追踪

## 本课目标

- 掌握 BMM 敏捷大师代理（Bob）的完整使用方法
- 理解四大工作流：冲刺规划（SP, Sprint Planning）、冲刺状态（SS, Sprint Status）、路线纠正（CC, Correct Course）、Epic 回顾（ER, Epic Retrospective）
- 掌握故事执行循环：CS（Create Story，创建故事上下文）-> DS（Dev Story，开发故事）-> CR（Code Review，代码审查）-> 下一个
- 实操为一个功能做完整的冲刺规划

## 核心内容

### Bob 的工作流缩写速查表

本课涉及大量缩写，先看这张表建立印象，后文会逐一展开：

| 缩写 | 全称 | 中文 | 一句话说明 |
|------|------|------|-----------|
| SP | Sprint Planning | 冲刺规划 | 把 Epics/Stories 变成可追踪的执行计划 |
| SS | Sprint Status | 冲刺状态 | 查看项目当前进度和风险 |
| CS | Create Story | 创建故事上下文 | 为开发者生成包含完整上下文的 Story 文件 |
| DS | Dev Story | 开发故事 | 开发者按 Story 文件进行编码实现 |
| CR | Code Review | 代码审查 | 自动化代码质量审查 |
| CC | Correct Course | 路线纠正 | 计划偏离时系统化管理变更 |
| ER | Epic Retrospective | Epic 回顾 | Epic 完成后多角色团队回顾和经验沉淀 |

### 认识敏捷大师：Bob

Bob 是 BMM 模块中的 Scrum Master 代理，定位是"技术型敏捷教练 + 故事准备专家"。他是一个认证的 Scrum Master，同时有深厚的技术背景——这意味着他不只是喊口号，而是真的能帮你把事情拆清楚。

**Bob 的性格**：简洁、清单驱动、每句话都有目的、对模糊零容忍。

**核心理念**：

- 他是一个服务型领导，帮助团队消除障碍
- 热爱讨论敏捷流程和理论
- 每个需求必须清晰到没有歧义

**启动 Bob**：

```bash
/bmad-sm
```

Bob 的完整菜单：

```
[MH] 重新显示菜单（Menu Help）
[CH] 与代理聊天（Chat）
[SP] 冲刺规划（Sprint Planning）：生成或更新项目的任务序列
[CS] 创建故事上下文（Create Story）：为开发者准备完整的实现上下文
[ER] Epic 回顾（Epic Retrospective）：多角色团队回顾所有已完成的工作
[CC] 路线纠正（Correct Course）：发现重大变更时的应对流程
[PM] 启动派对模式（Party Mode）
[DA] 结束对话（Done/Adieu）
```

### 冲刺规划工作流（SP, Sprint Planning）

SP（Sprint Planning，冲刺规划）是整个执行阶段的起点——它把 Epics 和 Stories 变成一个可追踪的执行计划。

**SP 的 5 步流程**：

```
Step 1: 解析 Epic 文件，提取所有工作项
       ↓ 从 Epics 文件中读取所有 Epic 和 Story

Step 2: 构建冲刺状态结构
       ↓ 为每个 Epic/Story 创建追踪条目

Step 3: 智能状态检测
       ↓ 自动检测已有 Story 文件，更新状态

Step 4: 生成冲刺状态文件
       ↓ 输出 sprint-status.yaml

Step 5: 验证和报告
       ↓ 确认所有项都被覆盖，输出总结
```

**启动冲刺规划**：

```bash
/bmad-sm
# 选择 [SP]
```

**输出示例**——sprint-status.yaml：

```yaml
generated: 2026-03-22
last_updated: 2026-03-22
project: AI-记账工具
project_key: NOKEY
tracking_system: file-system
story_location: implementation-artifacts

development_status:
  # Epic 1: 用户认证与账户管理
  epic-1: backlog
  1-1-email-registration: backlog
  1-2-login-flow: backlog
  1-3-password-recovery: backlog
  epic-1-retrospective: optional

  # Epic 2: 核心记账功能
  epic-2: backlog
  2-1-manual-entry: backlog
  2-2-invoice-scanning: backlog
  2-3-category-management: backlog
  2-4-transaction-list: backlog
  epic-2-retrospective: optional

  # Epic 3: AI 智能分析
  epic-3: backlog
  3-1-cash-flow-prediction: backlog
  3-2-anomaly-detection: backlog
  3-3-industry-benchmarking: backlog
  epic-3-retrospective: optional
```

**状态流转规则**：

```
Epic 状态：  backlog → in-progress → done
Story 状态：backlog → ready-for-dev → in-progress → review → done
回顾状态：  optional ↔ done
```

### 冲刺状态追踪（SS, Sprint Status）

SP 生成了追踪文件后，SS（Sprint Status，冲刺状态）工作流帮你随时查看项目进度。

**启动状态查看**：

```bash
/bmad-sprint-status
```

**SS 会展示**：

```
📊 冲刺状态

- 项目：AI-记账工具
- 追踪系统：file-system
- 状态文件：implementation-artifacts/sprint-status.yaml

Stories：backlog 8, ready-for-dev 1, in-progress 1, review 0, done 0
Epics：backlog 2, in-progress 1, done 0

下一步推荐：/bmad-dev-story (1-2-login-flow)

风险：
- 1 个 Story 处于 in-progress 超过 7 天
- sprint-status.yaml 超过 3 天未更新
```

**SS 的智能推荐**：

SS（Sprint Status）会根据当前状态自动推荐下一步操作：

| 当前状态 | 推荐操作 |
|---------|---------|
| 有 in-progress 的 Story | 推荐继续开发（dev-story） |
| 有 review 的 Story | 推荐代码审查（code-review） |
| 有 ready-for-dev 的 Story | 推荐开始开发（dev-story） |
| 有 backlog 的 Story | 推荐创建故事上下文（create-story） |
| 有 optional 的回顾 | 推荐做回顾（retrospective） |
| 全部完成 | 恭喜！项目完成！ |

### 故事执行循环

这是开发阶段的核心循环，每个 Story 都要走一遍：

```
CS（Create Story，创建故事上下文）—— Scrum Master Bob 执行
↓ 把 Epic 中的 Story 信息扩展为完整的开发指南
↓ 状态：backlog → ready-for-dev

DS（Dev Story，开发故事）—— Developer Agent 执行
↓ 开发者按照 Story 文件进行实现
↓ 状态：ready-for-dev → in-progress → review

CR（Code Review，代码审查）
↓ 自动化代码审查，确保质量
↓ 状态：review → done

→ 回到 CS，开始下一个 Story
```

#### CS（Create Story，创建故事上下文）—— PM 需要了解的关键步骤

CS（Create Story）是 Bob 最硬核的工作流。它不是简单地从 Epic 文件中复制 Story 信息，而是做了以下事情：

```
1. 分析 Epic 中的 Story 需求
2. 读取架构文档，提取技术约束
3. 读取 PRD，提取业务规则
4. 读取 UX 设计，提取界面要求
5. 分析前一个 Story 的开发笔记和教训
6. 检查 Git 历史，了解最近的代码模式
7. 联网搜索最新的技术文档
8. 整合所有信息，生成完整的 Story 文件
9. 更新 sprint-status.yaml
```

**为什么 CS 这么重要**：它防止了开发过程中最常见的问题——开发者"自由发挥"导致偏离需求。CS 生成的 Story 文件包含了开发者需要的所有上下文，不需要再问任何人。

**启动 CS**：

```bash
/bmad-sm
# 选择 [CS]
# Bob 会自动检测下一个要创建的 Story
```

### 路线纠正（CC, Correct Course）—— 当计划偏离时

在开发过程中，你可能会遇到需要改变计划的情况。CC（Correct Course，路线纠正）工作流帮你系统地管理变更。

**什么时候需要 CC**：

- 发现 PRD 中的需求有重大误解
- 技术方案不可行，需要调整架构
- 用户反馈导致需要改变产品方向
- 外部因素（竞品发布、政策变化）影响计划

**CC 的 6 步流程**：

```
Step 1: 初始化变更导航
       ↓ 确认变更原因，加载所有项目文档

Step 2: 执行变更分析清单
       ↓ 系统检查变更对各个文档的影响

Step 3: 起草具体变更提案
       ↓ 为每个受影响的文档写出修改建议
       ↓ 格式：旧内容 → 新内容 + 修改理由

Step 4: 生成冲刺变更提案
       ↓ 输出完整的变更提案文档，包括：
       ↓ - 问题摘要
       ↓ - 影响分析
       ↓ - 推荐方案
       ↓ - 详细修改建议
       ↓ - 实施交接计划

Step 5: 确认和路由
       ↓ 根据变更范围分类：
       ↓ - 小变更：直接由开发团队实施
       ↓ - 中变更：需要重新组织待办清单
       ↓ - 大变更：需要 PM/架构师重新规划

Step 6: 完成
       ↓ 总结和交接
```

**CC 最有价值的地方**：它不是让你"拍脑袋改计划"，而是系统地分析一个变更会波及哪些文档、哪些 Story、哪些正在进行的工作，然后给出一个完整的变更方案。

### 回顾总结（ER, Epic Retrospective）—— 经验沉淀

每个 Epic 完成后，ER（Epic Retrospective，Epic 回顾）工作流帮你做一次系统的回顾和经验总结。

**ER 的特色**：这是一个"派对模式"工作流——多个 AI 代理（产品主理人 Alice、高级开发 Charlie、QA 工程师 Dana、初级开发 Elena 等）会以角色扮演的方式参与回顾，模拟真实的团队回顾会议。

**ER 的 12 步流程（精简版）**：

```
1. 发现完成的 Epic
2. 深度分析所有 Story 的开发记录
3. 加载和对比上一次 Epic 的回顾
4. 预览下一个 Epic
5. 启动回顾讨论——What went well?
6. 讨论挑战和问题——What didn't go well?
7. 下一个 Epic 的准备讨论
8. 综合行动项
9. 关键就绪检查
10. 闭幕和承诺
11. 保存回顾文档
12. 更新冲刺状态
```

**ER 的关键产出**：

- 成功经验总结（What went well）
- 需要改进的点（What didn't go well）
- 具体的行动项（Action items），每项有负责人和截止日期
- 下一个 Epic 的准备任务清单
- 技术债务清单
- 是否需要修改下一个 Epic 的计划

### 实操：为"AI 记账工具"做完整的冲刺规划

**场景**：你已经用 John 创建了 PRD 和 Epics，现在要开始执行了。

**步骤 1：启动 Bob 做冲刺规划**

```bash
/bmad-sm
# 选择 [SP]
```

Bob 会自动：
- 找到你的 Epics 文件
- 解析所有 Epic 和 Story
- 检测已有的 Story 文件（如果有的话）
- 生成 sprint-status.yaml

```
Bob：冲刺状态生成成功！

文件位置：implementation-artifacts/sprint-status.yaml
总 Epics：3
总 Stories：10
Epics 进行中：0
Stories 已完成：0

下一步：
1. 检查生成的 sprint-status.yaml
2. 开始使用创建故事上下文
3. 重新运行此工作流可刷新状态
```

**步骤 2：创建第一个 Story 的上下文**

```bash
/bmad-sm
# 选择 [CS]
```

Bob 会自动检测到第一个 backlog 状态的 Story（比如 1-1-email-registration），然后：

```
Bob：检测到下一个待处理 Story：1-1-email-registration

正在分析...
✅ 加载 Epic 1 上下文
✅ 加载架构文档
✅ 加载 PRD 相关章节
✅ 分析技术要求
✅ 检查 Git 历史

Story 文件已创建：implementation-artifacts/1-1-email-registration.md
状态已更新：backlog → ready-for-dev
Epic 1 状态已更新：backlog → in-progress
```

**步骤 3：查看项目状态**

```bash
/bmad-sprint-status
```

```
📊 冲刺状态

Stories：backlog 9, ready-for-dev 1, in-progress 0, review 0, done 0
Epics：backlog 2, in-progress 1, done 0

下一步推荐：运行 dev-story 开始实现 1-1-email-registration
```

**步骤 4：开发循环**

从这里开始，就进入了开发执行阶段的循环：

```
[你/开发者] 运行 dev-story → 实现 Story
    ↓
[你/开发者] 运行 code-review → 审查代码
    ↓
[Bob] Story 状态变为 done
    ↓
[Bob] 运行 CS → 创建下一个 Story 的上下文
    ↓
重复...直到整个 Epic 完成
    ↓
[Bob] 运行 ER → Epic 回顾
    ↓
开始下一个 Epic
```

### PM 在执行阶段的角色

虽然执行阶段主要是开发团队在推进，但 PM 有几个关键职责：

| 时机 | PM 的动作 | 使用的工具 |
|------|----------|-----------|
| 每天 | 查看冲刺状态 | `/bmad-sprint-status` |
| 遇到需求疑问 | 澄清需求，更新 Story | 直接告诉 Bob |
| 发现方向偏差 | 发起路线纠正 | [CC] 路线纠正 |
| Epic 完成时 | 参与回顾会议 | [ER] 回顾总结 |
| 验收功能 | 按验收标准验证 | 查看 Story 文件中的 BDD 验收标准 |

## 🛠️ 实操练习

完成以下练习，掌握冲刺规划和执行工具。

### 练习 1：启动 Bob 并生成冲刺计划

```bash
# 运行以下命令启动敏捷大师代理
/bmad-sm
# 选择 [SP] 冲刺规划
```

**任务**：
1. 确保已有 Epics 和 Stories（上一课的产出）
2. 选择 `[SP]` 生成冲刺状态
3. 查看生成的 `sprint-status.yaml`

**预期产出**：
- `implementation-artifacts/sprint-status.yaml`
- 所有 Epics 和 Stories 的状态追踪

### 练习 2：创建 Story 上下文并开始开发

```bash
/bmad-sm
# 选择 [CS] 创建故事上下文
```

**任务**：
- 为第一个 Story 创建完整的开发上下文
- 查看生成的 Story 文件
- 理解 Story 状态从 `backlog` 变为 `ready-for-dev`

### 练习 3：查看冲刺状态

```bash
# 直接查看冲刺状态
/bmad-sprint-status
```

**任务**：
- 查看当前冲刺的整体进度
- 识别哪些 Stories 在进行中、哪些已完成

### 练习 4：尝试路线纠正（可选）

如果需要调整计划：

```bash
/bmad-sm
# 选择 [CC] 路线纠正
```

**扩展练习**：尝试直接使用快捷命令

```bash
# 冲刺规划
/bmad-sprint-planning

# 冲刺状态
/bmad-sprint-status

# 路线纠正
/bmad-correct-course

# Epic 回顾
/bmad-retrospective
```

**检查清单**：
- [ ] 成功启动 `/bmad-sm`
- [ ] 生成了 `sprint-status.yaml`
- [ ] 创建了第一个 Story 的开发上下文
- [ ] 使用 `/bmad-sprint-status` 查看了进度
- [ ] 了解了路线纠正（CC）和回顾（ER）工作流

---

## 常见问题

**Q: sprint-status.yaml 需要手动维护吗？**

A: 正常情况下不需要。各个工作流（CS、DS、CR、ER）会自动更新状态。但如果你发现状态和实际不符，可以手动编辑 YAML 文件，或重新运行 SP 来刷新状态检测。

**Q: 一个人也能用这套冲刺流程吗？**

A: 当然。cc4pm 的设计本身就支持"一个人 + AI 团队"的模式。你扮演 PM 和产品负责人的角色，Bob 帮你做 Scrum Master 的工作，Dev 代理帮你写代码，QA 代理帮你测试。整个流程一个人就能跑通。

**Q: CC（路线纠正）和直接修改 PRD 有什么区别？**

A: 区别很大。直接修改 PRD 只是改了文档，但下游的架构、Epics、Stories、正在进行的开发可能还不知道这个变化。CC 会系统地分析变更影响，生成一个完整的变更方案，确保所有相关文档和工作都同步更新。特别是在开发进行中时，CC 能帮你评估"这个改动值不值得做"以及"怎么最小代价地做"。

**Q: ER（回顾）一定要在每个 Epic 后面做吗？**

A: 强烈建议但不强制。回顾是经验沉淀的核心环节，跳过回顾意味着同样的问题可能在下一个 Epic 重复出现。而且 ER 的回顾文档会被下一次 CS（创建故事上下文）引用——也就是说，上一个 Epic 的教训会自动传递给下一个 Epic 的开发。这是一个自我改进的循环。

**Q: 阶段 2 学完了，接下来该做什么？**

A: 恭喜你完成了 PM 核心能力的全部学习！你现在已经掌握了从"一个想法"到"可执行开发计划"的完整流程。接下来有两个方向：(1) 实战——找一个真实的产品需求，走一遍完整的 CIS + BMM 流程；(2) 进入阶段 3，学习工程能力（代码审查、TDD、E2E 测试等），让你在和开发团队沟通时更有底气。

## 下一步

阶段 2 产品主理人核心能力全部完成！你已经掌握了：

- 36 种创意技巧做头脑风暴（Carson）
- 30 种创新框架做战略分析（Victor）
- 三种研究工作流做市场/领域/技术调研（Mary）
- 12 步创建专业的 PRD（John）
- 系统化的需求拆解：PRD -> Epics -> Stories（John）
- 完整的冲刺规划和执行管理（Bob）

接下来：

- [1] 进入阶段 3 第一课：Lesson 17 - WDS 概览：从用户心理到设计规范
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 2 | Lesson 16/26 (阶段内 6/6) | 上一课: Lesson 15 - 需求拆解 | 下一课: Lesson 17 - WDS 概览（阶段 3）*
