# Lesson 15: /plan 深度：需求转化为可执行任务

## 本课目标

- 掌握 /plan 命令的完整工作流和输出结构
- 理解 planner 代理（Opus 模型）的高级推理能力
- 了解 /multi-plan 多模型协作规划的原理
- 实操从一个需求到完整的实现计划

## 核心内容

### /plan 是什么？

你有没有遇到过这种情况：

```
PM："我们要做一个用户积分系统"
开发："好，需求给一下"
PM：（写了3页PRD）
开发：（看了30秒）"大概需要两周"
PM："两周？！不是很简单吗？"
开发："你以为很简单，实际要改12个文件、3个表、2个接口……"
```

**问题出在哪？** PM 看的是"功能"，开发看的是"实现"。两边说的不是一种语言。

`/plan` 就是那个翻译官——它能把一个功能需求，翻译成开发能直接执行的实现计划，同时让 PM 能理解每一步在做什么。

### /plan 的完整工作流

```bash
/plan 实现用户积分系统
```

这一条命令，背后会触发以下流程：

```
Step 1: 需求重述（Requirements Restatement）
↓ planner 代理会用自己的话重新描述需求
↓ 目的：确保理解无偏差

Step 2: 架构审查（Architecture Review）
↓ 自动分析现有代码库结构
↓ 找出受影响的组件和可复用的模式

Step 3: 分阶段分解（Phase Breakdown）
↓ 把实现拆成多个阶段（Phase）
↓ 每个阶段可以独立交付和测试

Step 4: 步骤细化（Step Details）
↓ 每个阶段拆成具体步骤
↓ 包含：文件路径、具体操作、依赖关系、风险等级

Step 5: 风险识别（Risk Assessment）
↓ 标注潜在风险和缓解方案

Step 6: 复杂度估算（Complexity Estimate）
↓ 给出 HIGH / MEDIUM / LOW 评估

Step 7: 等待确认（Wait for Confirmation）
↓ 展示完整计划，等你说"可以开始"
↓ 绝不自动执行！
```

**关键特性**：`/plan` 绝不会直接开始写代码。它会展示完整计划并等你确认——这给了 PM 充分的审查和调整机会。

### planner 代理的能力

/plan 背后的代理叫 **planner**，运行在 **Opus 模型**上——这是 Claude 家族中推理能力最强的模型。

**planner 擅长什么**：

| 能力 | 具体表现 |
|------|---------|
| 需求理解 | 能从模糊描述中提炼出精确需求 |
| 代码分析 | 自动阅读现有代码，找到最佳切入点 |
| 依赖识别 | 自动发现步骤之间的依赖关系 |
| 风险评估 | 标注每一步的风险等级和缓解方案 |
| 渐进交付 | 把大功能拆成可独立交付的小阶段 |

### /plan 输出结构详解

一个典型的 /plan 输出长这样：

```markdown
# Implementation Plan: 用户积分系统

## Overview
为电商平台添加积分系统，支持积分获取（下单、签到、分享）、
积分消费（抵扣、兑换）和积分管理。

## Requirements
- 用户下单获得积分（1元=1积分）
- 每日签到获得积分（递增制）
- 积分可抵扣订单金额（100积分=1元）
- 单笔最多抵扣50%
- 积分有效期12个月

## Architecture Changes
- 新增：points 表（user_id, amount, type, expires_at）
- 新增：point_transactions 表（交易记录）
- 修改：orders 表（增加 points_used 字段）
- 新增：PointsService（积分计算逻辑）
- 修改：OrderService（集成积分抵扣）

## Implementation Steps

### Phase 1: 数据基础（Low Risk）
1. 创建 points 表迁移文件
   - 文件：supabase/migrations/005_points.sql
   - 依赖：无
   - 风险：Low

2. 创建 PointsService 基础类
   - 文件：src/services/points.ts
   - 依赖：Step 1
   - 风险：Low

### Phase 2: 积分获取（Medium Risk）
3. 实现下单积分发放
   - 文件：src/services/orders.ts
   - 依赖：Step 2
   - 风险：Medium（需处理并发和幂等）

4. 实现签到积分发放
   - 文件：src/services/checkin.ts
   - 依赖：Step 2
   - 风险：Low

### Phase 3: 积分消费（High Risk）
5. 实现积分抵扣逻辑
   - 文件：src/services/points.ts
   - 依赖：Steps 1-3
   - 风险：High（涉及金额计算，必须100%正确）
   - 关键：需要 TDD，覆盖率必须 100%

6. 集成到下单流程
   - 文件：src/services/orders.ts
   - 依赖：Step 5
   - 风险：High（修改现有支付流程）

## Testing Strategy
- Unit tests：积分计算逻辑（覆盖率 100%）
- Integration tests：积分发放和消费流程
- E2E tests：完整的积分使用用户旅程

## Risks & Mitigations
- Risk: 并发积分操作导致余额不一致
  Mitigation: 使用数据库事务 + 行级锁
- Risk: 积分抵扣金额计算错误
  Mitigation: TDD + 100% 覆盖 + 边界测试

## Estimated Complexity: MEDIUM
- Phase 1: 2-3 小时
- Phase 2: 4-6 小时
- Phase 3: 6-8 小时
- 测试: 4-6 小时
- 总计: 16-23 小时

WAITING FOR CONFIRMATION: Proceed with this plan? (yes/no/modify)
```

### PM 如何使用 /plan 输出

这份计划对 PM 的价值：

| PM 的需求 | /plan 怎么满足 |
|----------|-------------|
| 排期估算 | "总计 16-23 小时"——直接可用的工时估算 |
| 风险识别 | "Phase 3 High Risk"——你知道该在哪里多留 buffer |
| 进度追踪 | 6 个步骤 = 6 个可追踪的里程碑 |
| 需求确认 | "Requirements"部分让你确认需求理解是否正确 |
| Sprint 规划 | 3 个 Phase 可以分到不同 Sprint |

**PM 的审查清单**：

```
拿到 /plan 输出后，检查这些：

□ Requirements 是否完整？有没有遗漏的需求？
□ 分阶段是否合理？能否独立交付和测试？
□ 风险标注是否准确？High Risk 的部分你理解了吗？
□ 复杂度估算是否靠谱？和你的经验是否匹配？
□ 测试策略是否覆盖了核心场景？
□ 有没有遗漏的依赖（比如第三方服务、数据迁移）？
```

### /multi-plan：多模型协作规划

如果你安装了多模型支持，可以使用 `/multi-plan`——它会同时调用多个 AI 模型来分析需求：

```bash
/multi-plan 实现用户积分系统
```

**工作流程**：

```
Phase 1: 上下文检索
↓ 智能搜索代码库，收集完整上下文

Phase 2: 多模型协作分析
↓ Codex（后端分析）和 Gemini（前端分析）并行工作
↓ 各自从不同角度分析需求

Phase 2.1: 交叉验证
↓ 综合两个模型的分析结果
↓ 找出共识点和分歧点

Phase 2.4: Claude 最终综合
↓ Claude 作为"终审法官"
↓ 后端逻辑参考 Codex，前端设计参考 Gemini
↓ 生成最终的实现计划

Plan Delivery: 保存计划文件
↓ 保存到 .claude/plan/<feature-name>.md
↓ 提供执行命令
```

**多模型的优势**：

- **Codex 擅长**：后端架构、数据流、边界情况、性能优化
- **Gemini 擅长**：前端设计、用户交互、可访问性、视觉一致性
- **Claude 综合**：作为最终决策者，综合两方分析，生成平衡的计划

**PM 不需要理解多模型技术细节**——你只需要知道，`/multi-plan` 相当于让三个高级工程师同时审查你的需求，比一个人想得更全面。

### 实操：从需求到完整计划

**场景**：你想为"潮品电商 App"添加"收藏夹分享"功能。

**Step 1：描述需求**

```bash
/plan 用户可以创建自定义收藏夹，将心仪商品添加到收藏夹，
并将收藏夹以链接形式分享给朋友。朋友打开链接可以看到
收藏夹内容并一键加购。
```

**Step 2：审查计划**

planner 会输出完整计划。你检查：

```
✓ 需求理解正确——"自定义收藏夹 + 商品添加 + 链接分享 + 查看 + 加购"
✓ 分阶段合理——Phase 1 数据库, Phase 2 收藏夹CRUD, Phase 3 分享, Phase 4 接收端
✗ 遗漏了权限——收藏夹是公开还是私密？需要补充
✗ 遗漏了限制——一个收藏夹最多放多少商品？
```

**Step 3：修改计划**

```
你：modify: 补充以下需求：
1. 收藏夹默认私密，可以设为公开
2. 每个收藏夹最多100件商品
3. 分享链接7天有效期
```

planner 会更新计划并再次展示。

**Step 4：确认执行**

```
你：proceed
```

planner 确认后，就可以开始开发了。

## 常见问题

**Q: /plan 和 BMM 的 Epics/Stories 什么关系？**

A: 粒度不同。Epics/Stories 是产品级别的需求拆解，/plan 是技术级别的实现拆解。通常的流程是：PRD -> Epics -> Stories（由 BMM 完成）-> 拿到一个 Story 后用 /plan 做实现规划。简单说，BMM 回答"做什么"，/plan 回答"怎么做"。

**Q: /plan 的估算准确吗？**

A: 比"人肉估算"准确得多，因为 planner 会实际分析代码库。但任何估算都有不确定性——建议把 /plan 的估算当作基线，然后根据你的经验加一个 buffer（通常 1.2x-1.5x）。关键是 /plan 的估算有明确的依据（每一步的工作量），不是空对空。

**Q: 非技术 PM 能看懂 /plan 的输出吗？**

A: 核心部分（Overview、Requirements、Phase 划分、Risk、Complexity）完全可以看懂。技术细节（具体文件路径、代码结构）不需要完全理解——你关注的是"要做多少步、哪些是高风险、需要多久"就够了。

**Q: /plan 和 /orchestrate 的区别是什么？**

A: `/plan` 只做规划，不执行代码修改。`/orchestrate` 是全流程执行——规划 + 实现 + 审查 + 安全检查。下一课会详细讲。

## 下一步

- [1] 进入下一课：Lesson 16 - 质量三件套：/tdd + /e2e + /code-review
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 1/4 | 上一课: Lesson 14 - 故事讲述 | 下一课: Lesson 16 - 质量三件套*
