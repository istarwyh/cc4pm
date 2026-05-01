# Lesson 23.2: Harness 实操——循环模式、编排与审计

## 本课目标

- 掌握四种自主循环模式（Sequential、Continuous-PR、Infinite、RFC-DAG）
- 理解"接力跑"原理——AI 如何长时间自主工作而不崩溃
- 学会 /harness-audit 的 7 维评分体系和 /orchestrate 的多代理编排
- 掌握安全护栏：停滞检测、成本限制、完成信号

> **前置知识**：本课建立在 Lesson 23.1（Harness 设计哲学）的基础上。如果你还不了解生成器-评估器分离和上下文焦虑的概念，请先回顾上一课。

## 核心内容

### 什么是 Harness Engineering？

上一课你学了 Hooks、Rules、Quality Gate——这些是**单点自动化**。Harness Engineering 是**系统级自动化**——把所有单点串成一个闭环。

```
单点自动化（L23 学的）：
  编辑代码 → [Hook] 自动格式化
  提交代码 → [Quality Gate] 自动检查
  每一个点独立运行，互不关联

Harness Engineering（本课）：
  探测环境 → 执行任务 → 评估结果 → 优化配置 → 再循环
  ↑                                              ↓
  └──────────── 持续改进闭环 ──────────────────────┘

  所有单点被串成一个自我优化的系统
```

**一个类比**：单点自动化像家里的烟雾报警器——各管各的。Harness Engineering 像智能家居中控——温度、湿度、灯光、安防全部联动，还能根据你的习惯自动调整。

### 闭环的四个阶段

```
┌──────────────────────────────────────────────────────┐
│            Harness Engineering 闭环                    │
│                                                        │
│  ① 探测（Detect）                                      │
│     quality-gate.js 自动检测：                          │
│     有 package.json？→ 用 npm                          │
│     有 go.mod？→ 用 go test                            │
│     有 biome.json？→ 用 Biome                          │
│     什么都没有？→ 跳过，不报错                           │
│                    ↓                                   │
│  ② 执行（Execute）                                     │
│     /orchestrate → 多代理接力：                          │
│     planner → tdd-guide → code-reviewer → security     │
│     每个代理独立上下文，通过 Handoff 文档传递             │
│                    ↓                                   │
│  ③ 评估（Evaluate）                                    │
│     /harness-audit → 7 维打分：                         │
│     工具覆盖 + 上下文效率 + 质量门禁 + ...              │
│     评分 52/70 → 找到薄弱环节                           │
│                    ↓                                   │
│  ④ 优化（Optimize）                                    │
│     harness-optimizer 代理 → 提出最小改动：              │
│     "添加 cost-tracker Hook" → +3 分                    │
│     "补充 eval 模板" → +4 分                            │
│                    ↓                                   │
│  回到 ① → 下一轮探测、执行、评估、优化                   │
└──────────────────────────────────────────────────────┘
```

### 四种自主循环模式

Harness 支持四种循环模式，从简单到复杂：

| 模式 | 复杂度 | 适用场景 | 持续时间 |
|------|--------|---------|---------|
| **Sequential** | 低 | 日常开发步骤 | 分钟级 |
| **Continuous-PR** | 中 | 多天迭代项目 | 小时~天 |
| **Infinite** | 中 | 并行内容生成 | 小时级 |
| **RFC-DAG** | 高 | 大型功能，多单元并行 | 天级 |

#### 1. Sequential Pipeline——最基础的循环

```bash
#!/bin/bash
# 每一步都是独立的 claude -p 调用（全新上下文）

claude -p "实现功能"          # Step 1: 写代码
claude -p "清理代码"          # Step 2: De-Sloppify
claude -p "跑测试修 Bug"      # Step 3: 验证
claude -p "提交"              # Step 4: Git Commit
```

**关键**：步骤之间通过**文件系统**传递状态，每一步都是全新的、清醒的 AI。

#### 2. Continuous-PR Loop——带 CI 的迭代循环

```
创建分支 → claude -p 实现 → 提交 PR → 等 CI
    ↑                                    ↓
    │                            CI 通过？→ 合并 → 下一轮
    │                            CI 失败？→ 自动修复 → 重新提交
    └────────── 回到主分支，开始下一轮 ──────┘

限制条件（任一触发即停止）：
  --max-runs 10       最多 10 轮
  --max-cost 5.00     最多花 5 美元
  --max-duration 8h   最多跑 8 小时
```

#### 3. Infinite Agentic Loop——并行生成

一个编排者管理多个子代理同时工作，每个子代理负责一个独立变体：

```
编排者读取 spec → 分配 N 个子代理 → 每个子代理独立生成
                                   → 编排者收集结果
                                   → 需要更多？部署下一波
```

#### 4. RFC-DAG——最复杂的生产级模式

```
RFC/PRD 文档
    ↓
AI 自动拆解为工作单元（带依赖关系的 DAG）
    ↓
Layer 0: [A, B]        ← 无依赖，并行
Layer 1: [C]           ← 依赖 A
Layer 2: [D, E]        ← 依赖 C，并行
    ↓
每个单元经过质量流水线：
  研究 → 规划 → 实现 → 测试 → 审查 → 修复
    ↓
合并队列：无冲突直接合并，有冲突驱逐重做
```

**关键设计**：审查者从未写过它审查的代码——**消除作者偏见**。

#### 选择决策树

```
任务是单个聚焦的改动？
├─ 是 → Sequential Pipeline
└─ 否 → 有完整的 spec/PRD 文档？
         ├─ 是 → 需要并行实现多个模块？
         │        ├─ 是 → RFC-DAG
         │        └─ 否 → Continuous-PR Loop
         └─ 否 → 需要同一个东西的多种变体？
                  ├─ 是 → Infinite Loop
                  └─ 否 → Sequential + De-Sloppify
```

### "接力跑"原理——为什么 AI 能长时间工作

AI 不是"一口气跑 10 小时"。它是**很多个短命 AI 轮流上场的接力赛**。

```
❌ 错误理解：一个超长会话跑到底
   → 上下文窗口会满 → AI 变笨 → 质量崩塌

✅ 正确理解：每一棒都是全新会话
   → Step 1 的 AI 写完代码，退出
   → Step 2 的 AI 读取代码（磁盘上的文件），清理
   → Step 3 的 AI 读取代码，跑测试
   → 每一棒都是 100% 清醒的
```

**跨步骤的记忆靠什么传递？** 靠一个 `SHARED_TASK_NOTES.md` 文件：

```markdown
## 进度
- [x] 实现了登录模块（第 1 轮）
- [x] 修复了 token 刷新的边界情况（第 2 轮）
- [ ] 还需要：限流测试、错误边界测试

## 下一步
- 接下来做限流模块
- tests/helpers.ts 里的 mock 可以复用
```

每轮开始读、结束写。**文件系统就是接力棒。**

### /harness-audit——7 维体检报告

`/harness-audit` 对你的项目做一次全面"体检"，给出 7 个维度的评分（满分 70）：

```bash
/harness-audit
```

```
Harness Audit (repo): 52/70

┌────────────────────┬──────┬───────────────────────────┐
│ 维度                │ 得分 │ 含义                       │
├────────────────────┼──────┼───────────────────────────┤
│ Tool Coverage      │ 8/10 │ 工具覆盖：代理能用的工具够不够 │
│ Context Efficiency │ 7/10 │ 上下文效率：提示词有没有浪费  │
│ Quality Gates      │ 9/10 │ 质量门禁：自动检查够不够严    │
│ Memory Persistence │ 6/10 │ 记忆持久化：跨会话记忆可靠吗  │
│ Eval Coverage      │ 6/10 │ 评估覆盖：有没有 pass@k 指标 │
│ Security Guardrails│ 8/10 │ 安全护栏：权限控制到不到位    │
│ Cost Efficiency    │ 8/10 │ 成本效率：Token 有没有浪费   │
└────────────────────┴──────┴───────────────────────────┘

Top 3 改进建议：
1. 添加 cost-tracker Hook        → 预计 +2 分
2. 补充 eval 模板                → 预计 +3 分
3. 增加 .opencode/ 配置          → 预计 +1 分
```

**harness-optimizer 代理**会自动执行改进：基线打分 → 找到薄弱点 → 提出最小改动 → 执行 → 对比前后得分。

### /orchestrate——多代理编排

当一个任务需要多个代理协作时，`/orchestrate` 定义代理接力的顺序：

```bash
/orchestrate feature "添加用户认证"
```

```
执行流程：
  planner → tdd-guide → code-reviewer → security-reviewer

每个代理之间通过 Handoff 文档传递：

  ## HANDOFF: planner → tdd-guide
  ### 上下文
  需要实现 JWT 认证 + 刷新 Token
  ### 发现
  数据库已有 users 表，可以直接使用
  ### 修改的文件
  docs/auth-plan.md
  ### 待解决
  Token 过期时间选 15 分钟还是 1 小时？
  ### 建议
  先做登录，再做注册
```

| 工作流类型 | 代理链 | 适用场景 |
|-----------|-------|---------|
| `feature` | planner → tdd → reviewer → security | 新功能开发 |
| `bugfix` | planner → tdd → reviewer | Bug 修复 |
| `refactor` | architect → reviewer → tdd | 重构 |
| `security` | security → reviewer → architect | 安全审计 |
| `custom` | 你指定任意代理链 | 自定义流程 |

### 安全护栏——三道保险

#### 1. 停滞检测

`loop-operator` 代理持续监控：

```
✅ 有进展 → 继续
⚠️ 连续 2 轮无进展 → 冻结！→ 缩小范围 → 用更小目标重试
❌ 相同错误反复出现 → 上报人工介入
```

**关键原则**：不盲目重试。卡住了就缩小范围，不是用同样的方式再跑一遍。

#### 2. 成本限制

三道限制**任一触发即停**：

```bash
--max-runs 10       # 最多 10 轮
--max-cost 5.00     # 最多花 5 美元
--max-duration 8h   # 最多跑 8 小时
```

#### 3. 完成信号

AI 连续 N 次说"我做完了"才真正停止（防误判）：

```bash
--completion-signal "PROJECT_COMPLETE"
--completion-threshold 3    # 连续 3 次才停
```

### De-Sloppify——让 AI 输出更干净

AI 写代码时容易"过度防御"——测试语言特性而非业务逻辑、添加不必要的类型检查。

```
❌ 错误做法：在指令里写"不要测试类型系统"
   → AI 变得对所有测试都犹豫不决
   → 质量反而下降

✅ 正确做法：加一个独立的"清理步骤"
   → 让 AI 先放开写（全面覆盖）
   → 再用一个全新的 AI 审查并清理
   → 两个专注的 AI > 一个被限制的 AI
```

```bash
# Step 1: 放开写
claude -p "实现功能，测试要全面覆盖"

# Step 2: De-Sloppify（独立 AI，独立上下文）
claude -p "审查所有变更。删除：测试语言特性的用例、
不必要的类型检查、console.log、注释掉的代码。
保留所有业务逻辑测试。清理后跑一遍测试。"
```

### 全景速查

| 你的问题 | 用什么 | 结果 |
|---------|-------|------|
| "这个项目的工程质量怎么样？" | `/harness-audit` | 7 维评分 + 改进建议 |
| "怎么让 AI 自动完成多步任务？" | `/orchestrate feature` | 多代理接力完成 |
| "AI 能不能跑一整夜自动开发？" | Continuous-PR Loop | 带 CI 的自动迭代 |
| "自动化跑飞了怎么办？" | 三道护栏 | max-cost/runs/duration |
| "怎么让 AI 代码更干净？" | De-Sloppify 模式 | 独立清理步骤 |

## 🛠️ 实操练习

### 练习 1：运行 Harness Audit

```bash
/harness-audit
```

**任务**：
1. 查看 7 维评分
2. 记录你的项目得分
3. 查看 Top 3 改进建议

### 练习 2：使用 /orchestrate 编排

```bash
# 尝试一个 feature 工作流
/orchestrate feature "添加一个简单的健康检查 API"
```

**任务**：
- 观察 planner → tdd → reviewer 的代理接力
- 查看 Handoff 文档的内容
- 理解每个代理的分工

### 练习 3：理解循环模式

**思考题**：以下场景分别适合哪种循环模式？

| 场景 | 你的答案 |
|------|---------|
| 给 50 个函数补单元测试 | _______ |
| 实现一个完整的支付模块（含前后端） | _______ |
| 生成 10 种不同风格的落地页 | _______ |
| 每天自动修复 Lint 错误并提 PR | _______ |

**参考答案**：
1. Sequential Pipeline（简单重复任务）
2. RFC-DAG（多模块并行 + 依赖管理）
3. Infinite Loop（并行生成变体）
4. Continuous-PR Loop（每日自动迭代）

**检查清单**：
- [ ] 理解了 Harness 闭环的四个阶段
- [ ] 了解了四种循环模式的区别和选择
- [ ] 理解了"接力跑"原理
- [ ] 运行了 `/harness-audit`
- [ ] 了解了 `/orchestrate` 的工作流类型

---

## 常见问题

**Q: Harness 和上一课学的 Hooks/Rules 是什么关系？**

A: Hooks 和 Rules 是 Harness 的**组成部分**。Hooks 负责单点自动化（编辑后格式化），Rules 定义标准（80% 覆盖率），Harness 把它们串成闭环——探测环境、执行任务、评估结果、优化配置、持续改进。就像 Hook 是一个个传感器，Harness 是把所有传感器连起来的中控系统。

**Q: 为什么不是一个 AI 跑很久，而是"接力跑"？**

A: 因为 AI 的上下文窗口（工作记忆）是有限的。一个会话跑太久，早期内容会被遗忘或压缩，AI 的判断质量下降。接力跑的每一棒都是全新的上下文窗口——100% 清醒，不会因为"跑累了"而犯错。代价是需要通过文件（SHARED_TASK_NOTES.md）来传递进度，但这个代价远小于质量下降的风险。

> **架构演进**：当你的项目从一个简单功能扩展到千万行规模的复杂系统时，单纯靠一个 Notes 文件会变得难以维护。届时，你将学习如何升级到 **[Agentic 知识库 (Lesson 24.1)](../stage-5/lesson-1.1.md)**——利用三层架构和自动化 Wiki 来管理整个项目的「外部大脑」。

**Q: /harness-audit 的 70 分满分，多少分算好？**

A: 50+ 分是"可用"，60+ 分是"良好"，65+ 分是"优秀"。重点不是追求满分，而是找到**投入产出比最高的改进点**——harness-optimizer 代理会自动识别"花最小努力提升最多分数"的改动。

**Q: 这些循环模式需要自己配置吗？**

A: 大部分开箱即用。你只需要理解它们的运作方式，在需要时选择合适的模式。比如用 `/orchestrate` 时，你的参与点在于确认 planner 产出的计划是否正确，后续执行交给代理接力完成。

## 相关概念

- **Harness Engineering**（Lesson 23.1）— harness-audit 和 Autonomous Loops 是 Harness 的实操工具
- **Agent Loop 11 Steps**（Lesson 1.1）— Autonomous Loops 是 Agent Loop 的持续运行变体

## 下一步

- [1] 继续 Lesson 23.3：实战案例——HelixVerify 的 114 次自举迭代
- [2] 返回 Lesson 23.1：Harness 设计哲学
- [3] 返回主菜单

---
*阶段 4 | Lesson 23.2/26 | 上一课: Lesson 23.1 - Harness 设计哲学 | 下一课: Lesson 23.3 - 实战案例*
