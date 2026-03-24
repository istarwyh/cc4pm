# Lesson 17: 工作流编排：/orchestrate 自动化流水线

## 本课目标

- 理解 /orchestrate 的预定义工作流类型
- 掌握多代理顺序执行和握手文档（Handoff）的概念
- 了解 /multi-execute 多模型协作执行的原理
- 学会从 PM 角度监控编排进度和结果

## 核心内容

### 从"一个命令一个动作"到"一个命令一条流水线"

前面几课你学了 `/plan`、`/tdd`、`/e2e`、`/code-review`——每个命令做一件事。

但真实的开发流程是**串联**的：先规划 → 再写代码 → 再审查 → 再测试 → 最后安全检查。

每次手动按顺序跑 5 个命令，太麻烦了。

`/orchestrate` 就是解决这个问题的——**一条命令，自动执行整个流水线**。

```bash
/orchestrate feature "添加用户积分系统"
```

这一条命令，背后会自动按顺序调用 4 个代理，就像工厂的流水线一样。

### 四种预定义工作流

| 工作流 | 代理链 | 适用场景 |
|--------|-------|---------|
| `feature` | planner → tdd-guide → code-reviewer → security-reviewer | 新功能开发 |
| `bugfix` | planner → tdd-guide → code-reviewer | Bug 修复 |
| `refactor` | architect → code-reviewer → tdd-guide | 代码重构 |
| `security` | security-reviewer → code-reviewer → architect | 安全审计 |

**选哪个？看场景**：

```
你要做什么？
│
├── 开发新功能 → /orchestrate feature "功能描述"
├── 修复 Bug → /orchestrate bugfix "Bug 描述"
├── 优化代码 → /orchestrate refactor "优化目标"
└── 安全检查 → /orchestrate security "检查范围"
```

### Feature 工作流详解

以最常用的 `feature` 工作流为例，看看每个代理做什么：

```
Agent 1: Planner（规划师）
↓ 分析需求，创建实现计划
↓ 输出：HANDOFF 文档 → 传给下一个代理

Agent 2: TDD Guide（测试驱动开发指导）
↓ 读取规划师的 HANDOFF
↓ 先写测试，再写代码
↓ 输出：HANDOFF 文档 → 传给下一个代理

Agent 3: Code Reviewer（代码审查）
↓ 读取 TDD Guide 的 HANDOFF
↓ 审查代码质量、最佳实践
↓ 输出：HANDOFF 文档 → 传给下一个代理

Agent 4: Security Reviewer（安全审查）
↓ 读取 Code Reviewer 的 HANDOFF
↓ 安全漏洞检测
↓ 输出：Final Report（最终报告）
```

### 握手文档（Handoff Document）

代理之间的信息传递靠**握手文档**——这是 orchestrate 最巧妙的设计。

每个代理完成工作后，会生成一份标准格式的 Handoff 文档：

```markdown
## HANDOFF: planner -> tdd-guide

### Context
基于需求分析，积分系统需要3个核心模块：
积分获取、积分消费、积分管理。

### Findings
- 需要新建2张数据库表
- 需要修改现有的 OrderService
- 积分抵扣逻辑是最高风险的部分

### Files Modified
- 计划创建：supabase/migrations/005_points.sql
- 计划创建：src/services/points.ts
- 计划修改：src/services/orders.ts

### Open Questions
- 积分过期策略需要和 PM 确认
- 并发积分操作的锁机制需要架构师审查

### Recommendations
- 优先实现积分获取（风险低）
- 积分抵扣必须 TDD，覆盖率 100%
```

**Handoff 的价值**：

1. **上下文不丢失**：每个代理都知道前一个代理做了什么
2. **可追溯**：出了问题可以回溯到具体哪个代理的决策
3. **PM 可读**：Handoff 是 Markdown 格式，PM 能看懂

### 最终编排报告

所有代理完成后，系统会生成一份汇总报告：

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: 添加用户积分系统
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
积分系统实现完成，包含积分获取、消费和管理三个模块。
所有测试通过，覆盖率 87%，无安全漏洞。

AGENT OUTPUTS
-------------
Planner: 6步实现计划，分3个阶段交付
TDD Guide: 24个测试用例，全部通过
Code Reviewer: 0 CRITICAL, 0 HIGH, 2 MEDIUM
Security Reviewer: 无安全漏洞

FILES CHANGED
-------------
Created: supabase/migrations/005_points.sql
Created: src/services/points.ts
Created: src/services/points.test.ts
Modified: src/services/orders.ts
Modified: src/api/checkout/route.ts

TEST RESULTS
------------
24 tests, 24 passed, 0 failed
Coverage: 87% (target: 80%)

SECURITY STATUS
---------------
No vulnerabilities found

RECOMMENDATION
--------------
SHIP - Ready for deployment
```

### PM 的编排报告阅读指南

拿到编排报告，PM 应该关注什么？

```
✅ 必看项

1. RECOMMENDATION：SHIP / NEEDS WORK / BLOCKED
   → SHIP = 可以上线
   → NEEDS WORK = 有问题需要修复
   → BLOCKED = 有阻塞问题

2. SECURITY STATUS
   → "No vulnerabilities" = 安全
   → 有 CRITICAL = 绝对不能上线

3. TEST RESULTS
   → 全部通过 + 覆盖率 > 80% = OK
   → 有失败 = 需要修复

4. Code Reviewer: CRITICAL 和 HIGH 数量
   → 都是 0 = OK
   → 有 CRITICAL = 不能上线
```

```
📋 选看项

5. AGENT OUTPUTS：了解每个代理做了什么
6. FILES CHANGED：了解改了哪些文件
7. SUMMARY：快速了解整体情况
```

### /multi-execute：多模型协作执行

如果你安装了多模型支持，还可以使用 `/multi-execute`——它在执行阶段也引入了多模型协作：

```bash
/multi-execute .claude/plan/feature-name.md
```

**工作流程**：

```
Phase 0: 读取计划文件
↓ 加载 /multi-plan 生成的计划

Phase 1: 快速上下文检索
↓ 搜索代码库，收集实现所需的上下文

Phase 3: 获取原型代码
↓ 根据任务类型路由：
  - 前端任务 → Gemini 生成原型
  - 后端任务 → Codex 生成原型
  - 全栈任务 → 两者并行

Phase 4: Claude 实现
↓ Claude 作为"代码主权者"
↓ 将原型重构为生产级代码
↓ 执行实际的文件修改

Phase 5: 多模型审计
↓ Codex 审查后端（安全、性能、错误处理）
↓ Gemini 审查前端（可访问性、设计一致性）
↓ 综合修复
```

**关键原则**：

- **代码主权**：只有 Claude 能修改文件——Codex 和 Gemini 提供建议和原型，但不能直接改代码
- **脏原型重构**：外部模型的输出被当作"脏原型"，Claude 会重构为生产级代码
- **信任分工**：后端逻辑信 Codex，前端设计信 Gemini

### 自定义工作流

除了 4 种预定义工作流，你还可以自定义代理链：

```bash
/orchestrate custom "architect,tdd-guide,code-reviewer" "重新设计缓存层"
```

这会创建一个自定义的 3 代理流水线：架构师 → TDD → 代码审查。

**PM 可能用到的自定义组合**：

| 场景 | 推荐组合 |
|------|---------|
| 只做规划不实现 | `planner` |
| 只做安全检查 | `security-reviewer,code-reviewer` |
| 先架构评审再实现 | `architect,planner,tdd-guide` |
| 完整的质量审查 | `code-reviewer,security-reviewer` |

### 实操：启动一个 Feature 编排流程

**场景**：为"潮品电商 App"添加"限时闪购"功能。

**Step 1：启动编排**

```bash
/orchestrate feature "限时闪购功能：
- 管理后台可以创建闪购活动（指定商品、折扣、时间）
- 用户端显示倒计时
- 库存实时扣减
- 活动结束自动恢复原价
- 防止超卖"
```

**Step 2：等待执行**

系统会按顺序执行 4 个代理。你可以看到进度：

```
[1/4] Planner: 分析需求中...
[1/4] Planner: 完成! 生成 HANDOFF
[2/4] TDD Guide: 编写测试中...
[2/4] TDD Guide: 24 tests created, implementing...
[2/4] TDD Guide: 完成! 生成 HANDOFF
[3/4] Code Reviewer: 审查代码中...
[3/4] Code Reviewer: 完成! 生成 HANDOFF
[4/4] Security Reviewer: 安全检查中...
[4/4] Security Reviewer: 完成!
```

**Step 3：审查最终报告**

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: 限时闪购功能

RECOMMENDATION: SHIP

Key Highlights:
- Planner 识别了"防超卖"作为最高风险点
- TDD Guide 为库存扣减写了 12 个边界测试
- Code Reviewer 发现 0 CRITICAL, 0 HIGH
- Security Reviewer 确认没有竞态条件漏洞
```

**Step 4：PM 决策**

看到 `SHIP` 推荐 + 0 CRITICAL + 测试全通过 → 可以安排上线。

## 常见问题

**Q: /orchestrate 需要多长时间？**

A: 取决于功能复杂度。简单功能（改 2-3 个文件）：5-15 分钟。中等功能（改 5-10 个文件）：15-30 分钟。复杂功能（改 10+ 个文件）：30-60 分钟。这比人工做同样的事快 5-10 倍。

**Q: 编排过程中可以中断吗？**

A: 可以。每个代理之间有 Handoff 文档作为检查点。如果中断了，可以从上次的 Handoff 继续。但建议尽量一次跑完。

**Q: 编排结果不满意怎么办？**

A: 如果最终报告是 `NEEDS WORK`，报告会列出需要修复的具体问题。你可以修复后重新运行审查代理，或者手动调整后重跑完整编排。

**Q: /orchestrate 和 BMM 的 Dev Story（DS）是什么关系？**

A: DS 是 BMM 体系内的开发工作流，关注的是"按照 Story 文件的规范实现功能"。/orchestrate 是工程工具链的编排工作流，关注的是"多代理协作完成一个技术任务"。在实际使用中，你可以把 DS 和 /orchestrate 结合——用 BMM 的 Story 定义需求，用 /orchestrate 来执行实现。

## 下一步

- [1] 进入下一课：Lesson 18 - 会话管理：跨天工作不丢上下文
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 3/4 | 上一课: Lesson 16 - 质量三件套 | 下一课: Lesson 18 - 会话管理*
