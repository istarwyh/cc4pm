# Lesson 18: 会话管理：跨天工作不丢上下文

## 本课目标

- 掌握 /save-session 和 /resume-session 的使用方法
- 理解会话文件的 7 大必备章节
- 学会用 /sessions 管理会话历史
- 掌握团队协作场景中的会话管理技巧

## 核心内容

### AI 最大的痛点：失忆

你有没有遇到过这种崩溃场景：

```
下午 5 点：你和 Claude 聊了 3 小时，终于理清了一个复杂问题的解决方案。
下午 5:01：Claude 提示"上下文快满了，建议开新会话"。
下午 5:02：新会话。Claude："你好！有什么需要帮助的吗？"
你：（内心崩溃）我们刚才聊了3小时的东西全没了？！
```

AI 没有"记忆"——每次新会话都是全新开始。这是 AI 协作中最大的生产力杀手。

cc4pm 的会话管理系统就是为了解决这个问题：**让你的工作上下文可以跨会话持久保存**。

### /save-session：保存你的工作上下文

**什么时候用**：

- 准备关闭 Claude Code 之前
- 上下文快满了、需要开新会话之前
- 解决了一个复杂问题、想保留记录时
- 需要把工作交接给同事时

**怎么用**：

```bash
/save-session
```

系统会自动收集当前会话的所有关键信息，生成一个结构化的会话文件，保存到 `~/.claude/sessions/` 目录。

### 会话文件的 7 大必备章节

这是 /save-session 生成的文件结构，每一章节都是必须的——即使内容是"暂无"，也不能省略：

```markdown
# Session: 2026-03-22

**Started:** ~2pm
**Last Updated:** 5:30pm
**Project:** 潮品电商 App
**Topic:** 实现用户积分系统

---

## What We Are Building
（我们在做什么）

用户积分系统——用户通过下单、签到获取积分，
积分可以抵扣订单金额。需要新建积分表、
修改订单服务、添加积分抵扣逻辑。

---

## What WORKED (with evidence)
（什么已经成功了——附带证据）

- **积分获取逻辑** — 确认可用：24 个测试全部通过
- **数据库迁移** — 确认可用：migrate up 成功，表结构正确
- **签到积分** — 确认可用：连续签到递增逻辑测试通过

---

## What Did NOT Work (and why)
（什么失败了——附带原因）

- **Redis 分布式锁** — 失败原因：本地开发环境没装 Redis，
  报 ECONNREFUSED 错误。需要先 docker-compose up redis
- **乐观锁方案** — 失败原因：PostgreSQL 的 UPDATE ...
  WHERE version = X 在高并发下重试率太高，
  不适合积分扣减场景

---

## What Has NOT Been Tried Yet
（还没试过但值得尝试的方案）

- 用 PostgreSQL 的 SELECT FOR UPDATE 代替 Redis 锁
- 用数据库事务 + 行级锁做并发控制
- 积分抵扣异步处理（先锁定、后扣减）

---

## Current State of Files
（文件当前状态）

| File | Status | Notes |
|------|--------|-------|
| supabase/migrations/005_points.sql | 完成 | 表结构已确认 |
| src/services/points.ts | 进行中 | 获取逻辑完成，抵扣逻辑未完成 |
| src/services/points.test.ts | 进行中 | 获取测试通过，抵扣测试待写 |
| src/services/orders.ts | 未开始 | 等积分抵扣完成后集成 |

---

## Decisions Made
（已做的决策）

- **选择 PostgreSQL 行级锁** — 原因：不想引入 Redis 依赖，
  团队不熟悉 Redis 运维
- **积分有效期 12 个月** — 原因：对照法规要求和竞品做法

---

## Exact Next Step
（下次从哪里开始）

在 src/services/points.ts 中实现 deductPoints() 方法，
使用 BEGIN + SELECT FOR UPDATE + UPDATE 的事务模式。
先写测试（至少覆盖：正常扣减、余额不足、并发扣减、
积分过期），然后实现代码让测试通过。
```

**为什么每一章都很重要**：

| 章节 | 重要性 |
|------|-------|
| What We Are Building | 给新会话提供全局上下文 |
| What WORKED | 避免重复做已经完成的工作 |
| What Did NOT Work | **最重要**——避免重复踩同一个坑 |
| What Has NOT Been Tried | 给新会话提供方向 |
| Current State | 精确定位每个文件的状态 |
| Decisions Made | 避免新会话推翻已做的决策 |
| Exact Next Step | 新会话可以立即开始工作 |

**特别强调**："What Did NOT Work" 是最重要的章节——没有它，新会话会天真地重试已经失败的方案，浪费你的时间和 Token。

### /resume-session：恢复上下文继续工作

第二天上班，打开新会话：

```bash
/resume-session
```

系统会自动找到最近的会话文件，读取并生成一份结构化的简报：

```
SESSION LOADED: ~/.claude/sessions/2026-03-22-abc123de-session.tmp
════════════════════════════════════════════════════════════════

PROJECT: 潮品电商 App — 用户积分系统

WHAT WE'RE BUILDING:
用户积分系统，支持积分获取和积分抵扣。
积分获取已完成，积分抵扣尚未实现。

CURRENT STATE:
  Working: 3 items (积分获取、数据库迁移、签到积分)
  In Progress: points.ts (获取完成，抵扣未完成)
  Not Started: orders.ts (等积分抵扣完成)

WHAT NOT TO RETRY:
  Redis 分布式锁 — 本地没装 Redis，ECONNREFUSED
  乐观锁方案 — 高并发下重试率太高

OPEN QUESTIONS / BLOCKERS:
  无

NEXT STEP:
  在 points.ts 中实现 deductPoints()，
  使用 PostgreSQL SELECT FOR UPDATE 事务模式。
  先写测试再实现。

════════════════════════════════════════════════════════════════
Ready to continue. What would you like to do?
```

**注意**：恢复会话后，Claude 不会自动开始工作——它会展示简报然后等你指示。你可以说 "continue" 继续上次的工作，或者调整方向。

### /resume-session 的多种用法

```bash
# 自动加载最近的会话
/resume-session

# 加载特定日期的会话
/resume-session 2026-03-22

# 加载特定文件
/resume-session ~/.claude/sessions/2026-03-22-abc123de-session.tmp
```

### /sessions：管理会话历史

当你积累了多个会话后，可以用 `/sessions` 来管理：

```bash
# 列出所有会话
/sessions list

# 查看特定会话详情
/sessions info abc123de

# 给会话起别名
/sessions alias abc123de points-system

# 通过别名加载
/sessions load points-system

# 列出所有别名
/sessions aliases
```

**会话列表示例**：

```
Sessions (showing 5 of 12):

ID        Date        Time     Branch       Worktree           Alias
────────────────────────────────────────────────────────────────────
abc123de  2026-03-22  17:30   main         -                  points
b2c3d4e5  2026-03-21  16:45   feature/auth -                  auth
c3d4e5f6  2026-03-20  15:20   main         -
d4e5f6g7  2026-03-19  18:00   feature/cart -                  cart
e5f6g7h8  2026-03-18  14:30   main         -
```

### /checkpoint：工作检查点

除了完整的会话保存，还有一个轻量级的工具——`/checkpoint`：

```bash
# 创建检查点
/checkpoint create "积分获取完成"

# 查看检查点列表
/checkpoint list

# 对比当前状态和检查点
/checkpoint verify "积分获取完成"
```

**Checkpoint vs Save-Session 的区别**：

| 维度 | /checkpoint | /save-session |
|------|------------|---------------|
| 重量级 | 轻量，只记录 git 状态 | 重量，记录完整上下文 |
| 用途 | "这个阶段做完了"标记 | "今天的工作全部保存" |
| 可恢复 | 可以回滚到检查点 | 可以在新会话恢复上下文 |
| 包含内容 | git SHA + 时间戳 | 7 章完整上下文 |

**最佳实践**：每完成一个阶段（Phase）做一次 checkpoint，下班前做一次 save-session。

### PM 如何用会话管理做工作交接

这是会话管理对 PM 最实用的场景——**团队协作中的工作交接**。

**场景 1：PM 之间的交接**

```
PM-A 下班前：
/save-session
# 生成会话文件

PM-B 第二天：
/resume-session ~/.claude/sessions/2026-03-22-abc123de-session.tmp
# 完整了解前一天的工作进展、已做决策、下一步计划
```

**场景 2：PM 和开发的交接**

```
PM 完成规划后：
/save-session
# 会话文件包含：需求上下文、已做决策、实现计划

开发开始工作：
/resume-session ~/.claude/sessions/2026-03-22-planning-session.tmp
# 开发完整了解 PM 的意图和决策，不需要再开会对齐
```

**场景 3：多人接力开发**

```
开发 A 做了一半：
/save-session
# "What WORKED" 列出已完成的部分
# "What Did NOT Work" 列出失败的尝试
# "Exact Next Step" 告诉下一个人从哪里接手

开发 B 接手：
/resume-session
# 0 沟通成本地了解所有上下文
# 不会重复失败的尝试
# 知道从哪一步开始
```

### 会话管理的最佳实践

```
每日工作流：

上班：
  /resume-session              ← 恢复昨天的上下文

工作中：
  /checkpoint create "完成XX"  ← 每个里程碑做检查点

遇到问题：
  记住失败原因               ← 保存到会话时写入 "What Did NOT Work"

下班：
  /save-session               ← 保存完整上下文
```

**注意事项**：

- 会话文件是只读的历史记录——不要修改旧会话文件
- 每次 save-session 都创建新文件，不会覆盖旧文件
- 会话文件超过 7 天会有提示——因为代码可能已经变了
- 使用别名（alias）来管理重要的会话，方便查找

## 常见问题

**Q: 会话文件保存在哪里？**

A: 统一保存在 `~/.claude/sessions/` 目录。文件名格式是 `YYYY-MM-DD-<短ID>-session.tmp`，比如 `2026-03-22-abc123de-session.tmp`。

**Q: 会话文件会很大吗？**

A: 不会。会话文件是结构化的 Markdown，通常只有几 KB。它不保存代码——只保存上下文描述、决策记录和状态信息。

**Q: 可以同时有多个进行中的工作吗？**

A: 可以。每次 save-session 都创建独立的文件。你可以给不同工作的会话起不同的别名（alias），然后根据需要恢复不同的会话。比如 `points-system`、`flash-sale`、`user-auth` 可以是三个独立的工作流。

**Q: 团队成员没有装 cc4pm，能用会话文件吗？**

A: 会话文件是标准的 Markdown 文件，任何人都能读。但要通过 `/resume-session` 自动恢复上下文，需要安装 cc4pm。不装的同事可以直接读 Markdown 文件来了解上下文——格式设计得就是人可读的。

**Q: save-session 和 Git 提交有什么关系？**

A: 没有直接关系。save-session 保存的是"工作上下文"（你在想什么、做了什么决策、下一步做什么），Git 提交保存的是"代码变更"。两者互补——Git 告诉你"代码变了什么"，会话文件告诉你"为什么这么变、下一步该做什么"。

## 下一步

阶段 4 工程协作与质量保障全部完成！你已经掌握了：

- /plan：需求到实现计划的翻译器
- 质量三件套：TDD + E2E + Code Review 的配合使用
- /orchestrate：多代理自动化流水线
- 会话管理：跨天工作不丢上下文

接下来：

- [1] 进入阶段 5 第一课：Lesson 19 - 知识沉淀与持续学习
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 4/4 | 上一课: Lesson 17 - 工作流编排 | 下一课: Lesson 19 - 知识沉淀（阶段 5）*
