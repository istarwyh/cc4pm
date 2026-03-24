# Lesson 19: 知识沉淀与持续学习

## 本课目标

- 掌握 /learn、/evolve、/promote 三个知识管理命令
- 理解 continuous-learning-v2 系统的运作原理
- 学会建立团队级别的知识库
- 实操从一次产品开发会话中提取可复用经验

## 核心内容

### 为什么需要"知识沉淀"？

你有没有经历过这种重复：

```
第一次做推送功能：踩了3天坑，终于搞定了
第二次做推送功能（另一个项目）：又踩了2天同样的坑
第三次做推送功能：还是……

为什么？因为每次的经验都"随风而逝"了——
没有被系统地记录和复用。
```

cc4pm 的持续学习系统解决的就是这个问题：**把每次工作中的经验自动提取出来，变成可复用的"本能"（Instinct），让 AI 在未来的工作中自动应用这些经验。**

### 三步知识管理：Learn → Evolve → Promote

```
/learn    ← 从当前会话提取经验
↓
/evolve   ← 将经验演化为更高级的形态
↓
/promote  ← 将经验从项目级推广到全局
```

### /learn：从会话中提取模式

**什么时候用**：

- 解决了一个非平凡的问题后
- 发现了一个有价值的模式或技巧后
- 踩了一个坑并找到了正确的解法后

**使用方式**：

```bash
/learn
```

系统会分析当前会话，寻找四类可提取的模式：

#### 1. 错误解决模式

```markdown
# PostgreSQL Connection Pool Exhaustion

**Extracted:** 2026-03-22
**Context:** 高并发场景下数据库连接池耗尽

## Problem
并发积分扣减导致连接池（max 20）在 100 并发时耗尽，
抛出 "too many connections" 错误。

## Solution
1. 增大连接池（max 50）
2. 使用 pg-bouncer 做连接池代理
3. 积分扣减使用 SELECT FOR UPDATE 行级锁减少锁等待时间

## When to Use
当数据库操作涉及高并发写入且出现连接池相关错误时
```

#### 2. 调试技巧

```markdown
# Next.js Hydration Mismatch Debugging

**Extracted:** 2026-03-22
**Context:** React 组件在 SSR 和 CSR 渲染结果不一致

## Problem
积分显示组件在服务端渲染时显示 0，客户端渲染时显示实际值，
导致 hydration mismatch 错误。

## Solution
使用 useEffect + useState 延迟渲染客户端特有的数据，
或使用 dynamic import 的 ssr: false 选项。

## When to Use
当组件依赖客户端特有数据（localStorage、cookies 等）
且出现 hydration 相关错误时
```

#### 3. 项目特定模式

```markdown
# API Response Wrapper Pattern

**Extracted:** 2026-03-22
**Context:** 项目中 API 返回格式的统一规范

## Problem
不同接口返回格式不一致，前端需要为每个接口写不同的解析逻辑。

## Solution
统一使用 { code, data, message } 格式包装所有 API 返回值。
在 middleware 层统一处理。

## When to Use
当创建新的 API 接口时，自动使用统一的响应包装器
```

#### 4. 变通方案

```markdown
# Supabase RLS Policy for Admin Override

**Extracted:** 2026-03-22
**Context:** Supabase 的行级安全策略对管理员操作的变通

## Problem
Supabase RLS 策略阻止了管理员直接修改用户积分的操作。

## Solution
为管理员角色创建 service_role 策略，
或通过 RPC 函数绕过 RLS。

## When to Use
当 Supabase RLS 策略需要为特定角色开放例外时
```

### /learn 的提取流程

```
Step 1: 分析当前会话
↓ 扫描整个对话历史

Step 2: 识别有价值的模式
↓ 寻找错误解决、调试技巧、变通方案等

Step 3: 草拟知识卡片
↓ 生成结构化的 Skill 文件

Step 4: 请你确认
↓ "要保存这个经验吗？"

Step 5: 保存到知识库
↓ ~/.claude/skills/learned/[pattern-name].md
```

**PM 使用场景**：

不只是代码问题可以用 /learn。PM 也可以在以下场景使用：

```bash
# 你刚用 CIS 做了一次很成功的头脑风暴
/learn
# 系统可能提取出：成功的 prompt 模式、有效的框架组合

# 你刚用 WDS 完成了一个 Trigger Map
/learn
# 系统可能提取出：有效的用户角色定义模式、驱动力识别技巧

# 你刚解决了一个团队沟通问题
/learn
# 系统可能提取出：需求对齐的最佳实践
```

### /evolve：从经验到系统能力

单个的 /learn 产出是一张"知识卡片"。当你积累了多张相关的知识卡片后，`/evolve` 可以把它们升级为更强大的形态：

```bash
/evolve
```

**三种演化方向**：

```
多个相关的知识卡片
    │
    ├── → 命令（Command）
    │     当知识描述的是"用户主动触发的操作"
    │     例：多个关于"创建数据库表"的经验
    │     → 演化为 /new-table 命令
    │
    ├── → 技能（Skill）
    │     当知识描述的是"自动触发的行为模式"
    │     例：多个关于"函数式编程"的经验
    │     → 演化为 functional-patterns 技能
    │
    └── → 代理（Agent）
          当知识描述的是"复杂多步骤流程"
          例：多个关于"调试"的经验
          → 演化为 debugger 代理
```

**演化分析输出示例**：

```
============================================================
  EVOLVE ANALYSIS - 12 instincts
  Project: 潮品电商 (a1b2c3d4e5f6)
  Project-scoped: 8 | Global: 4
============================================================

High confidence instincts (>=80%): 5

## SKILL CANDIDATES
1. Cluster: "数据库操作"
   Instincts: 3 (连接池、行级锁、迁移模式)
   Avg confidence: 82%

## COMMAND CANDIDATES (2)
  /new-table
    From: db-migration-pattern [project]
    Confidence: 84%

## AGENT CANDIDATES (1)
  performance-debugger
    Covers 3 instincts
    Avg confidence: 82%
```

**使用 --generate 自动生成文件**：

```bash
/evolve --generate
```

系统会在 `evolved/` 目录下自动创建技能、命令或代理文件。

### /promote：从项目经验到全局智慧

当一个经验在多个项目中都被验证有效时，就可以用 `/promote` 把它从"项目级"推广到"全局级"：

```bash
# 自动检测可推广的经验
/promote

# 预览候选项
/promote --dry-run

# 推广特定的经验
/promote api-response-wrapper
```

**推广条件**：

- 在至少 2 个不同项目中出现
- 置信度达到阈值
- 没有项目特定的依赖

**推广后的效果**：被推广的经验会在你的所有项目中自动生效——不需要每个项目重新 /learn。

### continuous-learning-v2 系统

这三个命令背后是一套叫 **continuous-learning-v2** 的系统。它的运作方式可以用一个生命周期来理解：

```
观察（Observe）
↓ 系统在你工作时静默观察模式
↓

提取（Extract）
↓ /learn 从会话中提取有价值的模式
↓ 生成"本能"（Instinct）

验证（Validate）
↓ 在后续工作中验证本能是否有效
↓ 记录置信度分数

演化（Evolve）
↓ /evolve 将相关本能聚合升级
↓ 从知识卡片 → 技能/命令/代理

推广（Promote）
↓ /promote 将高置信度的本能推广到全局
↓ 成为你的"个人 AI 增强"
```

**本能（Instinct）的生命周期**：

```
创建 → 验证 → 演化 → 推广
 ↓        ↓       ↓       ↓
低置信度  逐步提升  升级形态  全局生效
```

### 查看本能状态

```bash
# 查看所有本能的状态
/instinct-status

# 导出本能（用于分享或备份）
/instinct-export

# 导入本能（从同事分享的文件）
/instinct-import
```

### 建立团队级知识库

个人经验很有价值，但**团队级别的知识复用**才是真正的效率倍增器。

**策略**：

```
Step 1：每个团队成员各自使用 /learn
↓ 各自积累项目经验

Step 2：定期做知识分享
↓ 每个人 /instinct-export 导出自己的本能
↓ 团队审查哪些值得推广

Step 3：高价值经验统一推广
↓ /instinct-import 导入团队精选的经验
↓ 所有成员共享团队智慧

Step 4：持续迭代
↓ 新的经验不断加入
↓ 过时的经验自动退化
```

### 实操：从一次产品开发会话中提取经验

**场景**：你刚用 CIS + BMM + /plan 完成了"限时闪购"功能的完整规划和开发。

**Step 1：运行 /learn**

```bash
/learn
```

**Step 2：系统分析**

```
分析会话...发现 3 个可提取的模式：

1. 闪购功能的 Trigger Map 模式
   - 正面驱动力：稀缺感、紧迫感
   - 负面驱动力：错过焦虑（FOMO）
   - 这个模式适用于所有"限时优惠"类功能

2. 防超卖的技术方案选择
   - 失败方案：Redis 分布式锁（环境依赖问题）
   - 成功方案：PostgreSQL SELECT FOR UPDATE
   - 适用于所有涉及库存扣减的场景

3. /orchestrate feature 的最佳使用时机
   - 当功能涉及 3+ 文件修改且需要安全审查时
   - 简单功能（1-2 文件）直接用 /tdd 更高效

要保存这些经验吗？ [Y/n]
```

**Step 3：确认保存**

```
你：Y

系统：已保存到：
- ~/.claude/skills/learned/flash-sale-trigger-pattern.md
- ~/.claude/skills/learned/inventory-lock-selection.md
- ~/.claude/skills/learned/orchestrate-vs-tdd-routing.md
```

**Step 4：未来的自动应用**

下次你做类似的"限时优惠"功能时，Claude 会自动引用这些经验：

```
Claude：检测到你在做限时优惠类功能。
基于之前的经验（flash-sale-trigger-pattern），
建议关注以下心理驱动力：
- 稀缺感
- 紧迫感
- FOMO（错过焦虑）

另外，库存扣减建议使用 PostgreSQL SELECT FOR UPDATE
而不是 Redis 分布式锁（inventory-lock-selection）。
```

这就是持续学习的魔力——**你的 AI 会越来越懂你的工作方式**。

## 常见问题

**Q: /learn 会不会提取出没用的东西？**

A: 它有过滤机制——不会提取"拼写错误修复"这种琐碎的东西。只有"非平凡的问题解决"和"可复用的模式"才会被提取。而且在保存前你有确认的机会，不满意可以拒绝。

**Q: 本能会过时吗？**

A: 会。如果一个本能长期没有被验证（在实际工作中没有被引用），它的置信度会逐渐降低。过时的本能最终会被系统标记为"需要审查"。你可以决定是更新它还是删除它。

**Q: 团队成员的本能会冲突吗？**

A: 可能会。比如 A 的经验说"用 Redis 锁"，B 的经验说"用数据库锁"。这正好是团队讨论的好机会——比较两个经验的上下文和条件，达成团队共识后保留一个统一版本。

**Q: PM 的经验也能被 /learn 提取吗？**

A: 当然。PM 的经验可能是：有效的 PRD 结构、成功的需求对齐方法、好用的 Trigger Map 模式、高效的冲刺规划策略等。这些都是有价值的知识——不是只有技术经验才值得沉淀。

## 下一步

- [1] 进入下一课：Lesson 20 - 团队落地指南
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 1/2 | 上一课: Lesson 18 - 会话管理 | 下一课: Lesson 20 - 团队落地指南*
