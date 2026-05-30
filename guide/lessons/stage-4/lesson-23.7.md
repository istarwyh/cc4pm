# Lesson 23.7: Goal 模式——给 Claude 一个可验收的终点

## 本课目标

- 理解 `/goal` 如何让 Claude 持续工作到完成条件成立
- 学会在 `/goal`、`/loop`、`/schedule`、Stop Hook、Auto Mode 之间做选择
- 掌握可验证完成条件的写法：终点、检查方式、约束、边界
- 了解 `/goal` 的状态查看、提前清除、恢复会话和非交互用法
- 理解 `/goal` 评估器的限制：它只看对话，不会自己跑命令

> **前置知识**：本课建立在 Lesson 23（Hooks）和 Lesson 23.2（Harness 实操）的基础上。如果你还不了解 Stop Hook、循环模式和完成信号，请先回顾那两课。

## 核心内容

### `/goal` 解决的是什么问题？

长任务最大的难点不是“Claude 会不会做”，而是“谁来判断它该不该继续”。

普通对话里，每一步都要你催：

```
你：修完这个模块
Claude：我改完了
你：跑测试了吗？
Claude：我去跑
你：还有 lint 呢？
Claude：我继续
```

`/goal` 把这件事变成一个会话级完成条件：

```text
/goal node tests/run-all.js exits 0 and npm test exits 0; stop after 8 turns
```

设置后，Claude 会立刻开始一轮工作。每轮结束时，一个小模型评估器会看这轮对话里是否已经证明条件成立：

```
你设置 Goal
    ↓
Claude 执行任务、跑检查、汇报结果
    ↓
小模型评估器读取对话记录
    ├─ 条件未满足 → 自动开始下一轮
    └─ 条件满足   → 清除 goal，停止循环
```

重点是：`/goal` 不是让同一个回复无限变长，而是让**上一轮结束后自动进入下一轮**。它适合那些“完成标准清楚，但可能需要多轮修复”的任务。

### 什么时候该用 `/goal`？

适合用 `/goal` 的任务有一个共同点：**终点可验证**。

| 场景 | 适合原因 |
|------|----------|
| 迁移一个模块到新 API，直到所有调用点编译通过 | 有明确编译/测试结果 |
| 按设计文档实现功能，直到所有验收标准成立 | 有验收标准 |
| 拆分大文件，直到每个文件都低于行数预算 | 有文件行数检查 |
| 清空某个 label 下的 issue 队列 | 有“队列为空”状态 |

不适合用 `/goal` 的任务：

```
❌ /goal 把这个产品做得更好
❌ /goal 研究一下市场机会
❌ /goal 优化一下代码质量
```

这些目标太主观。你应该先把它们变成可验收条件：

```
✅ /goal docs/research.md contains a comparison table for 5 competitors,
   each with pricing, target user, core feature, and one source link;
   stop after 6 turns

✅ /goal npm test exits 0 and no file in src/ is over 400 lines;
   stop after 10 turns
```

### `/goal`、`/loop`、`/schedule`、Stop Hook、Auto Mode 怎么选？

这五个工具都和“自主工作”有关，但触发下一轮的条件不同。

| 工具 | 下一轮什么时候开始 | 什么时候停 | 适合场景 |
|------|-------------------|------------|----------|
| `/goal` | 上一轮结束后 | 评估器确认完成条件成立 | 一次性长任务，终点可验证 |
| `/loop` | 时间间隔到了 | 你停止、到期，或 Claude 判断不用继续 | 定时检查 CI、部署、远程队列 |
| `/schedule` | 到达指定时间 | 执行一次后结束 | 一次性提醒、到点巡检 |
| Stop Hook | 每次 Claude 停下后 | 你的脚本或提示词判断 | 团队级、长期生效的自动化策略 |
| Auto Mode | 不会自动开下一轮 | 当前轮 Claude 自己停 | 只想减少工具确认，不需要跨轮继续 |

一个简单决策树：

```
你要的是“直到某个条件成立”吗？
├─ 是 → /goal
└─ 否 → 只需要未来某个时间执行一次吗？
        ├─ 是 → /schedule
        └─ 否 → 你要按固定间隔重复检查吗？
                ├─ 是 → /loop
                └─ 否 → 这是每个会话都要执行的团队规则吗？
                        ├─ 是 → Stop Hook
                        └─ 否 → 只想少点权限弹窗 → Auto Mode
```

对产品主理人来说，`/goal` 最像“把验收标准交给项目经理助理”：你不用每轮追问，但前提是验收标准写得像标准，而不是愿望。

### 定时自动化：`/loop` 和 `/schedule`

`/loop` 是重复闹钟：每隔一段时间唤醒 Claude 执行同一条指令。它适合“状态会变化，但你不值得一直盯着”的任务。

```text
/loop 5m /babysit  # 示例：每 5 分钟处理代码审查、rebase、CI 状态
/loop 5m /fix      # 示例：每 5 分钟尝试修复 lint、类型检查问题
```

这些命令名只是例子，重点是“固定间隔 + 明确任务”。`/loop` 的价值不是让 Claude 一次回复很久，而是把等待外部状态的巡检变成后台节奏。最长可以连续运行一周，所以要给它清晰范围：看哪些队列、允许改哪些文件、什么情况下停止并汇报。

`/schedule` 是一次性闹钟：只在指定时间执行一次。适合“今天下午 5 点检查部署结果”“明早整理昨天的反馈”这种到点触发，不适合持续盯一个队列。

| 需求 | 用法 |
|---|---|
| 每 5 分钟重复检查 | `/loop 5m ...` |
| 未来某个时间只执行一次 | `/schedule ...` |
| 马上开始，直到测试通过 | `/goal ...` |

对于产品主理人，`/loop` 更像 24 小时值班助理：你给它巡检节奏和边界，它按时回来处理；`/schedule` 更像一次性提醒：到点做完就结束。

### 好的 Goal 条件怎么写？

一个稳定的 `/goal` 条件通常包含四块：

```
/goal [完成状态]；通过 [检查方式] 证明；保持 [约束]；[边界条件]
```

#### 1. 完成状态：说清终点

```
✅ 所有 test/auth 下的测试通过
✅ guide/course-map.yaml 已包含新 lesson，且 sync 没有新增 OVERSIZE
✅ GitHub issue #42 的所有 acceptance criteria 都被勾选
```

不要写：

```
❌ 代码质量不错
❌ 文档更完整
❌ 页面更好看
```

#### 2. 检查方式：让评估器能看到证据

`/goal` 的评估器不会自己跑命令、不会自己读文件。它只能看 Claude 在对话中展示出来的证据。

所以条件里要写清楚检查方式，并要求 Claude 把结果汇报出来：

```text
/goal npm test exits 0 and Claude reports the final command output in the transcript
```

如果 Claude 真的跑了测试，但没有把结果说出来，评估器可能仍然判断“证据不足”。

#### 3. 约束：防止为了达成目标而误伤别处

```
✅ do not modify files outside src/auth and tests/auth
✅ no production code changes except api/routes/user.ts
✅ keep all existing public API names unchanged
```

这能减少“为了让测试过而乱改范围”的风险。

#### 4. 边界条件：避免无止境循环

文档建议在长任务里加入轮次或时间边界：

```text
/goal all tests in tests/auth pass; stop after 10 turns
```

这不是失败主义，而是护栏。超过边界还没完成，通常说明目标太大、前提不清，或者需要你重新拆分任务。

### 常见 Goal 模板

#### 模板 1：修测试

```text
/goal node tests/run-all.js exits 0; Claude reports the final failing-or-passing output;
only modify files needed for the failing tests; stop after 8 turns
```

#### 模板 2：按验收标准实现功能

```text
/goal every acceptance criterion in docs/spec.md is implemented and verified by tests;
npm test exits 0; do not change unrelated UI routes; stop after 12 turns
```

#### 模板 3：整理课程文件

```text
/goal every guide lesson touched in this task is under its max_lines budget,
node scripts/sync-courseware.js exits 0, and Claude reports the health summary;
stop after 6 turns
```

#### 模板 4：非交互运行

```bash
claude -p "/goal CHANGELOG.md has one entry for every PR merged this week; stop after 5 turns"
```

非交互模式适合一次性后台任务。中途要停止，用 Ctrl+C 中断进程。

### 状态、清除和恢复

一个会话同一时间只能有一个 active goal。

```text
/goal
```

不带参数时，显示当前状态：
- 完成条件
- 已运行多久
- 已评估多少轮
- token 消耗
- 最近一次评估器给出的原因

提前停止：

```text
/goal clear
```

`stop`、`off`、`reset`、`none`、`cancel` 也可以作为 `clear` 的别名。

如果会话结束时 goal 仍然 active，用 `--resume` 或 `--continue` 恢复这个会话时，goal 条件会保留；但计时、轮次和 token 基线会重置。已经完成或清除的 goal 不会恢复。

### `/goal` 的底层心智模型

`/goal` 本质上是一个**会话级 prompt-based Stop Hook**。

每次 Claude 停下时，系统把“目标条件 + 当前对话”发给小模型评估器。评估器只回答两件事：

```
YES：条件已经满足 → 清除 goal
NO ：条件还没满足 → 把原因交给下一轮 Claude，继续工作
```

这带来三个重要限制：

1. **评估器不调用工具**：它不会自己跑测试、不会自己查文件。
2. **证据必须出现在对话里**：Claude 要把关键检查结果汇报清楚。
3. **条件要可判定**：如果条件含糊，评估器只能猜。

这也是为什么 `/goal` 条件应该写成“可验证的验收标准”，而不是“努力方向”。

### 运行要求

使用 `/goal` 前确认三件事：

- Claude Code 版本不低于 v2.1.139
- 当前 workspace 已接受 trust dialog
- Hooks 没有被禁用

如果配置里启用了 `disableAllHooks`，或者 managed settings 里设置了 `allowManagedHooksOnly`，`/goal` 会不可用。因为它依赖 Hook 机制做每轮评估。

## 🛠️ 实操练习

> **练习建议**：不要在当前学习会话里直接跑长任务。新开一个 Claude Code session，最好在临时目录或 throwaway 分支里练习。

### 练习 1：把愿望改写成 Goal

把下面三句话改成可验证的 `/goal` 条件：

| 原始愿望 | 你的 Goal 条件 |
|----------|----------------|
| “把登录模块修好” | _______ |
| “让文档更完整” | _______ |
| “清理一下这堆代码” | _______ |

参考写法：

```text
/goal tests/auth/login.test.ts exits 0 and npm test exits 0;
only modify src/auth and tests/auth; stop after 8 turns
```

### 练习 2：选择工具

判断下面场景该用什么：

| 场景 | 工具 |
|------|------|
| 每 5 分钟检查一次部署是否完成 | _______ |
| 明天上午 10 点只检查一次发布结果 | _______ |
| 修复测试直到 `npm test` 通过 | _______ |
| 每个项目都禁止提交 `.env` | _______ |
| 只是想让 Claude 本轮少问权限 | _______ |

参考答案：`/loop`、`/schedule`、`/goal`、Stop Hook、Auto Mode。

### 练习 3：安全试跑一个小 Goal

在一个临时目录里新开 Claude Code：

```bash
mkdir goal-demo && cd goal-demo && claude
```

然后输入：

```text
/goal goal-demo.md exists, contains exactly three bullet points about Claude Code goals,
and Claude reports the final file content; stop after 3 turns
```

观察三件事：
1. Claude 是否自动开始第一轮
2. 每轮结束后评估器给出的理由
3. `/goal` 不带参数时的状态信息

## 常见问题

**Q: `/goal` 会不会自己判断测试结果？**

A: 不会。它的评估器不会调用工具，只看对话。所以 Claude 必须在工作轮里运行测试，并把最终输出或摘要报告出来。你写 goal 时最好明确“Claude reports the final output”。

**Q: `/goal` 和 `/loop` 都能让 Claude 继续工作，最大区别是什么？**

A: `/goal` 是“上一轮结束就评估”，适合连续推进一个任务；`/loop` 是“时间到了再执行”，适合等待外部状态变化，比如 CI、部署、远程队列。不要用短间隔 `/loop` 去模拟 `/goal`。

**Q: `/loop` 和 `/schedule` 怎么选？**

A: 需要重复巡检就用 `/loop`，比如每 5 分钟看一次 CI；只需要未来某个时间执行一次就用 `/schedule`，比如明天早上检查发布结果。前者是值班，后者是提醒。

**Q: 目标写得越大越好吗？**

A: 不是。Goal 应该大到值得自动多轮推进，小到能被验证。一个好经验是：如果你能用一条命令、一个清单或一个文件状态证明它完成，就适合；如果需要长篇主观判断，就先拆小。

**Q: Auto Mode 开了，还需要 `/goal` 吗？**

A: 需要时仍然需要。Auto Mode 只减少当前轮的权限确认，不会自动启动下一轮。`/goal` 管的是“是否继续工作”，两者可以配合使用。

**Q: 什么时候该把 `/goal` 升级成 Stop Hook？**

A: 当这个完成判断不是一次性任务，而是团队长期规则时。例如“每次会话结束都检查是否有未跑的质量门禁”，应该写成 Stop Hook；“这次迁移直到测试通过”，用 `/goal` 就够了。

## 相关概念

- **Hooks System**（Lesson 8, 23）— `/goal` 依赖 prompt-based Stop Hook 做每轮评估
- **Harness 实操**（Lesson 23.2）— `/goal` 是比自建循环更轻量的完成条件循环
- **cc-connect 定时任务**（Lesson 24.6）— `/schedule` 和 cron 都属于“到点触发”，区别在于一次性与长期驻留
- **EDD**（Lesson 22.1）— 写 Goal 条件时，本质是在定义可评估的验收标准

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入阶段 5：高级应用与持续优化
- 返回 Lesson 23.2：Harness 实操
- 返回主菜单

---
*阶段 4 | Lesson 23.7/26 | 上一课: Lesson 23.6 - CLIProxyAPI 实战 | 下一课: Lesson 24 - 高级特性（阶段 5）*
