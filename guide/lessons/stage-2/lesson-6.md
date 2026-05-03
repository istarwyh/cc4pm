# Lesson 16: 冲刺规划与进度追踪

## 本课目标

- 掌握 BMM 敏捷大师代理（Bob）的完整使用方法
- 理解冲刺规划（SP）和冲刺状态（SS）工作流
- 掌握故事执行循环：CS（Create Story）-> DS（Dev Story）-> CR（Code Review）-> 下一个
- 实操为一个功能做完整的冲刺规划

> **CC 与 ER**：路线纠正（CC）和 Epic 回顾（ER）是 Bob 的另外两个重要工作流，详见 Lesson 16.1。

## 核心内容

### Bob 的工作流缩写速查表

本课涉及大量缩写，先看这张表建立印象，后文会逐一展开：

| 缩写 | 全称 | 中文 | 一句话说明 | 你敲的命令 |
|------|------|------|-----------|-----------|
| SP | Sprint Planning | 冲刺规划 | 把 Epics/Stories 变成可追踪的执行计划 | `/bmad-sprint-planning` 或 `/bmad-sm` → SP |
| SS | Sprint Status | 冲刺状态 | 查看项目当前进度和风险 | `/bmad-sprint-status` |
| CS | Create Story | 创建故事上下文 | 为开发者生成包含完整上下文的 Story 文件 | `/bmad-sm` → CS |
| DS | Dev Story | 开发故事 | 开发者按 Story 文件进行编码实现 | `/bmad-dev-story` |
| CR | Code Review | 代码审查 | 自动化代码质量审查 | `/code-review` |
| CC | Correct Course | 路线纠正 | 计划偏离时系统化管理变更 | `/bmad-correct-course` 或 `/bmad-sm` → CC |
| ER | Epic Retrospective | Epic 回顾 | Epic 完成后多角色团队回顾和经验沉淀 | `/bmad-retrospective` 或 `/bmad-sm` → ER |

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
  epic-1: backlog                          # Epic 1: 用户认证与账户管理
  1-1-email-registration: backlog
  1-2-login-flow: backlog
  1-3-password-recovery: backlog
  epic-1-retrospective: optional
  epic-2: backlog                          # Epic 2: 核心记账功能
  2-1-manual-entry: backlog
  2-2-invoice-scanning: backlog
  2-3-category-management: backlog
  2-4-transaction-list: backlog
  epic-2-retrospective: optional
  epic-3: backlog                          # Epic 3: AI 智能分析
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

| 当前状态 | 推荐操作 | 你敲的命令 |
|---------|---------|-----------|
| 有 in-progress 的 Story | 继续开发 | `/bmad-dev-story` |
| 有 review 的 Story | 代码审查 | `/code-review` |
| 有 ready-for-dev 的 Story | 开始开发 | `/bmad-dev-story` |
| 有 backlog 的 Story | 创建故事上下文 | `/bmad-sm` → CS |
| 有 optional 的回顾 | 做回顾 | `/bmad-retrospective` |
| 全部完成 | 恭喜！项目完成！ | — |

### 故事执行循环

这是开发阶段的核心循环，每个 Story 都要走一遍：

```
① /bmad-sm → CS（创建故事上下文）── Bob 执行
   把 Epic 中的 Story 信息扩展为完整的开发指南
   状态：backlog → ready-for-dev

② /bmad-dev-story（开发故事）── Developer Agent 执行
   开发者按照 Story 文件进行实现
   状态：ready-for-dev → in-progress → review

③ /code-review（代码审查）
   自动化代码审查，确保质量
   状态：review → done

→ 回到 ①，开始下一个 Story
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

## 🛠️ 实操练习

> **⚠️ 实操须知**：命令需在新 Claude Code session 中执行。详见 [practice-notice.md](../shared/practice-notice.md)

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

**检查清单**：
- [ ] 成功启动 `/bmad-sm`
- [ ] 生成了 `sprint-status.yaml`
- [ ] 创建了第一个 Story 的开发上下文
- [ ] 使用 `/bmad-sprint-status` 查看了进度

## 实用取舍：一个人用时，哪些值得用？

Bob 的设计背景是真实团队的 Scrum 流程——多人协作时，冲刺规划、状态追踪、回顾是刚需。但你是一个人用 AI 团队，信息全在你脑子里，不需要"同步"给谁看。所以**按需取用**，不用全套走。

| Bob 的功能 | 你需要吗？ | 原因 | 命令 |
|-----------|-----------|------|------|
| CS（创建故事上下文） | **需要** | 核心价值——把需求打包给 AI 开发者，防止跑偏 | `/bmad-sm` → CS |
| CR（代码审查） | **需要** | 质量保障，本身很轻 | `/code-review` |
| SP（冲刺规划） | 偶尔用 | 项目大了帮你理清优先级，小项目不需要 | `/bmad-sprint-planning` |
| SS（冲刺状态） | 偶尔用 | 中断一段时间回来看进度时有用 | `/bmad-sprint-status` |
| CC（路线纠正） | 很少用 | 一个人项目改需求直接改就行，没那么复杂 | `/bmad-correct-course` |
| ER（Epic 回顾） | 可选 | 做完复盘有好处，但不强制 | `/bmad-retrospective` |

**记住一句话就够了**：需求模糊时，跑一次 CS（`/bmad-sm` → CS），让 Bob 帮你把上下文打包好，再交给开发者。其他的工具，遇到具体问题时再翻出来用。

---

## 常见问题

**Q: sprint-status.yaml 需要手动维护吗？**

A: 正常情况下不需要。各个工作流（CS、DS、CR）会自动更新状态。但如果你发现状态和实际不符，可以手动编辑 YAML 文件，或重新运行 SP 来刷新状态检测。

**Q: 一个人也能用这套冲刺流程吗？**

A: 能用，但不用全套。一个人用 AI 团队时，最值得用的是 CS（创建故事上下文）和 CR（代码审查）。CS 把你模糊的需求打包成 AI 开发者能直接执行的文档，防跑偏效果最好。SP 和 SS 在项目变大时偶尔用，CC 和 ER 按需取用。详见上方"实用取舍"表格。

**Q: 阶段 2 学完了，接下来该做什么？**

A: 恭喜你完成了 PM 核心能力的全部学习！你现在已经掌握了从"一个想法"到"可执行开发计划"的完整流程。接下来有两个方向：(1) 实战——找一个真实的产品需求，走一遍完整的 CIS + BMM 流程；(2) 进入阶段 3，学习工程能力（代码审查、TDD、E2E 测试等），让你在和开发团队沟通时更有底气。

## Bob 命令速查卡

把这些存下来，用的时候直接敲：

```bash
# 一站式入口（菜单选择 SP/CS/ER/CC）
/bmad-sm

# 直达命令（跳过菜单）
/bmad-sprint-planning    # SP - 生成冲刺计划
/bmad-sprint-status      # SS - 查看进度和下一步
/bmad-dev-story          # DS - 开发者开始编码
/code-review             # CR - 代码审查
/bmad-correct-course     # CC - 路线纠正
/bmad-retrospective      # ER - Epic 回顾
```

**日常循环就这三行**：
```bash
/bmad-sm          # → CS，为下一个 Story 打包上下文
/bmad-dev-story   # 开发者实现
/code-review      # 审查通过，done
```

## 下一步

阶段 2 产品主理人核心能力全部完成！你已经掌握了：

- 36 种创意技巧做头脑风暴（Carson）
- 30 种创新框架做战略分析（Victor）
- 三种研究工作流做市场/领域/技术调研（Mary）
- 12 步创建专业的 PRD（John）
- 系统化的需求拆解：PRD -> Epics -> Stories（John）
- 完整的冲刺规划和执行管理（Bob）

接下来：

- [1] 补充学习：Lesson 16.1 - 路线纠正与 Epic 回顾（CC 和 ER 工作流）
- [2] 进入阶段 3 第一课：Lesson 17 - WDS 概览：从用户心理到设计规范
- [3] 返回主菜单
- [4] 退出学习

---
*阶段 2 | Lesson 16/26 (阶段内 6/6) | 上一课: Lesson 15 - 需求拆解 | 下一课: Lesson 16.1 - 路线纠正与回顾*
