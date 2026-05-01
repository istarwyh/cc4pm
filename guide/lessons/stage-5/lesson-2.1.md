# Lesson 25.1: 开发者工作流：从 Issue 到 PR 的完整闭环

## 本课目标

- 掌握基于 GitHub Issue 的 Claude Code 任务分派流程
- 学会用多工作区 + 无限制模式实现并行开发
- 了解如何将外部 AI 代码审查（通义灵码、Gemini）融入 PR 流程
- 掌握"反思→抽象"的命令化思维，将重复工作变成可组合的 Slash Commands

## 核心内容

### 时序全景：开发者只需要做两件事

在 cc4pm 的工程协作层（Lesson 21-23），你已经学会了 `/plan → /tdd → /code-review → /e2e` 的单任务流程。但在实际开发中，你需要的是一条**从 Issue 到 PR 合并的完整流水线**——而且最好能并行跑多条。

```
┌──────────────────────────────────────────────────────────────┐
│              你的工作流（简化版）                                │
│                                                              │
│  你只做：  提出需求  ──→  Review  ──→  合并                    │
│                                                              │
│  Claude 做：探索 → 规划 → 编码 → 响应审查意见 → 修复           │
│                                                              │
│  AI 审查员做：通义灵码 + Gemini 自动 Review PR                 │
└──────────────────────────────────────────────────────────────┘
```

这个工作流的核心理念：**你是决策者，不是执行者**。你提出需求、Review 技术方案、审阅代码审查结果——中间的执行全部交给 Claude。

### Step 1：多工作区 + 无限制模式

#### 为什么要多工作区？

当你同时推进多个 Issue 时，单个 Claude 会话的上下文窗口会成为瓶颈。每个工作区（终端 + 分支）拥有独立的上下文，互不污染。

> **前置知识**：Git Worktree 的基础用法见 Lesson 3.2。这里讲的是"多工作区 × Claude"的组合模式。

```bash
# 终端 1：处理 Issue #42（用户认证功能）
cd ~/projects/myapp
git worktree add ../myapp-auth feature/auth
cd ../myapp-auth
claude --dangerously-skip-permissions

# 终端 2：处理 Issue #58（报表功能）—— 同时进行
cd ~/projects/myapp
git worktree add ../myapp-reports feature/reports
cd ../myapp-reports
claude --dangerously-skip-permissions
```

#### 无限制模式的正确用法

`--dangerously-skip-permissions` 跳过所有权限确认，让 Claude 不间断执行。适合场景：

- 你信任当前任务的范围（Issue 描述清晰）
- 任务不涉及敏感操作（生产环境配置、密钥等）
- 你希望 Claude 自主完成整个 TDD 循环

**切换模式**：在会话中按 `Shift+Tab` 可以在"受限"和"无限制"之间切换。当 Claude 遇到需要你确认的操作时，临时切到受限模式。

```
场景：Claude 要执行 git push
  → Shift+Tab 切到受限模式
  → 确认 push 目标和分支
  → Shift+Tab 切回无限制模式继续
```

> **安全提醒**：无限制模式 ≠ 不看代码。你仍然需要在 PR 阶段做 Review。无限制只是省去了每一步的确认弹窗。

### Step 2：Issue 驱动的任务分派

#### 从 Issue 到 Claude 的标准流程

```
GitHub Issue                    Claude Code 会话
┌──────────────┐               ┌──────────────────────┐
│ Issue #42    │   复制描述     │                      │
│ "实现用户邮箱 │ ──────────→  │ 请根据以下需求实现：   │
│  验证功能"   │               │ [粘贴 Issue 描述]     │
│              │               │                      │
│ Labels:      │               │ 先用探索模式理清需求， │
│  enhancement │               │ 然后输出 TDD 技术方案 │
└──────────────┘               └──────────────────────┘
```

#### 复杂需求：先探索，后方案

对于复杂 Issue，不要直接让 Claude 写代码。先用探索模式理清需求：

```bash
# 1. 让 Claude 先探索代码库，理解现状
"请先探索当前项目的认证模块结构，列出：
 - 现有的认证方式
 - 相关的数据库表
 - 已有的测试覆盖情况"

# 2. Claude 输出探索结果后，要求技术方案
"基于探索结果，请输出一个 TDD 技术方案：
 - 需要新增/修改哪些文件
 - 测试用例设计（RED 阶段要写哪些测试）
 - 实施顺序和依赖关系
 - 风险点"

# 3. 你 Review 方案（这一步只需 1-2 分钟）
"方案 OK，开始执行" 或 "第二步先做，第三步放到下一个 PR"

# 4. Claude 按方案执行 TDD 循环
```

**关键**：技术方案 Review 是你唯一的"方向盘"时刻。方案确认后，Claude 自主执行 RED→GREEN→REFACTOR。

### Step 3：提交 PR + 外部 AI 代码审查

#### Claude 完成编码后

```bash
# Claude 完成 TDD 循环后，你指示提交
"创建 PR 到 main 分支，标题和描述参考 Issue #42"
```

Claude 会自动执行：
1. `git add` 相关文件
2. 写规范的 commit message
3. `git push -u origin feature/auth`
4. `gh pr create` 生成 PR

#### 外部 AI 审查：通义灵码 + Gemini

cc4pm 内置的 `/code-review` 是第一道关卡。但**多重 AI 审查**能发现不同角度的问题：

| 审查工具 | 擅长领域 | 接入方式 |
|---------|---------|---------|
| `/code-review` (cc4pm) | 安全、编码规范、架构 | 内置命令 |
| 通义灵码 | 阿里生态最佳实践、中文注释规范 | IDE 插件 / GitHub App |
| Gemini Code Assistant | 跨语言审查、Google 工程实践 | GitHub App |

**实际操作流程**：

```
PR 创建完成
    ↓
通义灵码自动 Review → 在 PR 中留下评论
Gemini 自动 Review  → 在 PR 中留下评论
    ↓
你查看所有 AI 的 Review 意见
    ↓
筛选有价值的意见，交给 Claude 处理
```

### Step 4：响应 Review 意见

#### 让 Claude 处理外部审查意见

```bash
# 在同一个 Claude 会话中（或用 --continue 恢复）
"请读取 PR #43 的所有 Review 意见，对每条意见：
 1. 判断是否合理（点评）
 2. 合理的直接修复
 3. 不合理的给出拒绝理由"
```

Claude 会：
1. 用 `gh api` 读取 PR 的所有评论
2. 逐条分析、点评
3. 修复合理的建议
4. 提交修复并 push

```
Claude 的响应示例：

通义灵码建议 #1: "建议使用 bcrypt 替代 MD5"
→ 采纳。MD5 已被认为不安全，切换到 bcrypt。
→ 已修复，见 commit abc1234

Gemini 建议 #2: "这个函数超过 50 行，建议拆分"
→ 部分采纳。函数确实偏长，但拆分为三个函数会增加
  认知负担。折中方案：提取核心验证逻辑为独立函数。
→ 已修复，见 commit def5678

Gemini 建议 #3: "缺少 JSDoc 注释"
→ 不采纳。项目规范（CLAUDE.md）明确不需要为
  自解释的函数添加注释。参见 coding-style.md。
```

**你的角色**：快速扫描 Claude 的点评，确认"采纳/不采纳"的判断是否合理。大部分情况下 Claude 的判断是准确的，你只需要看它拒绝的理由是否充分。

### Step 5：反思 → 抽象为命令

#### 命令化思维

当一个工作流重复出现时，把它抽象成 Slash Command：

```
重复操作                          抽象为命令
────────────────────────────────────────────────
"读取 PR 评论 → 分析 → 修复"   →  /review-respond
"探索代码库 → 输出技术方案"     →  /explore-plan
"创建 Issue → 分派给 Claude"   →  /issue-dispatch
```

#### 抽象原则

Lesson 6 已经介绍了命令系统。这里强调的是**什么时候该抽象**：

| 信号 | 行动 |
|------|------|
| 你第三次输入类似的 prompt | 考虑抽象为命令 |
| 一个流程有 3+ 个固定步骤 | 抽象为命令 |
| 你需要给 Claude 提供相同的上下文 | 抽象为命令（上下文写进 SKILL.md） |
| 一个命令的 prompt 超过 50 行 | 拆分为多个小命令，方便组合 |

**组合优于巨型命令**：

```
# 好：三个小命令，灵活组合
/explore-plan          # 探索 + 方案
/tdd                   # 测试驱动开发
/review-respond        # 响应审查意见

# 差：一个巨型命令包揽一切
/my-entire-workflow    # 50 行 prompt，无法复用子步骤
```

### 完整工作流回顾

把所有步骤串联起来：

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. 创建多工作区（git worktree + 新终端）                 │
│     ↓                                                   │
│  2. 启动无限制模式（--dangerously-skip-permissions）      │
│     ↓                                                   │
│  3. Issue → Claude 分派任务                              │
│     ↓                                                   │
│  4. 复杂需求：探索模式 → TDD 技术方案 → 你 Review         │
│     ↓                                                   │
│  5. Claude 执行 TDD 循环（RED → GREEN → REFACTOR）       │
│     ↓                                                   │
│  6. 提交 PR（gh pr create）                              │
│     ↓                                                   │
│  7. 多重 AI 审查：/code-review + 通义灵码 + Gemini       │
│     ↓                                                   │
│  8. Claude 读取审查意见 → 点评 → 修复                    │
│     ↓                                                   │
│  9. 你确认 → 合并 PR                                     │
│     ↓                                                   │
│  10. 反思：重复操作 → 抽象为 Slash Command               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 与 Lesson 25 的关系

Lesson 25 的"完整项目实战"覆盖了 CIS→BMM→WDS→Engineering 的**产品全生命周期**。本课聚焦在 Engineering 阶段内部的**开发者日常工作流**——从拿到一个 Issue 开始，到 PR 合并结束的完整闭环。

两课互补：
- Lesson 25：宏观——产品从想法到发布
- Lesson 25.1：微观——开发者每天的 Issue→PR 循环

## 🛠️ 实操练习

### 练习 1：设置双工作区

```bash
# 在你的项目中创建两个 worktree
git worktree add ../project-feature-a feature/a
git worktree add ../project-feature-b feature/b

# 分别在两个终端中启动 Claude
# 终端 1
cd ../project-feature-a && claude

# 终端 2
cd ../project-feature-b && claude
```

**检查清单**：
- [ ] 两个 Claude 会话各自独立，上下文不互通
- [ ] 理解了为什么需要多工作区（上下文窗口隔离）

### 练习 2：Issue 驱动开发

选择一个真实的 GitHub Issue，按本课流程走一遍：

```bash
# 1. 在 GitHub 上创建或选择一个 Issue
# 2. 将 Issue 描述喂给 Claude
# 3. 让 Claude 输出技术方案
# 4. Review 方案后让 Claude 执行
# 5. 提交 PR
```

**检查清单**：
- [ ] 体验了"探索→方案→Review→执行"的流程
- [ ] 确认技术方案 Review 环节的效率（应该在 1-2 分钟内完成）

### 练习 3：命令抽象

回顾你最近 3 次使用 Claude Code 的经历，找出重复的操作：

```bash
# 问自己：
# 1. 有没有重复输入过的 prompt？
# 2. 有没有固定步骤的流程？
# 3. 有没有每次都给 Claude 的相同上下文？

# 如果有，用 /skill-create 抽象为命令
/skill-create
```

**检查清单**：
- [ ] 识别出至少 1 个可抽象的重复操作
- [ ] 理解了"组合优于巨型命令"的原则

---

## 常见问题

**Q: `--dangerously-skip-permissions` 真的安全吗？**

A: 这个名字有误导性。它跳过的是"每一步的确认弹窗"，不是安全检查。安全由 Hooks 和 Rules 保障（Lesson 8、Lesson 23）。使用前提：(1) 任务范围明确（Issue 描述清晰）；(2) 不涉及生产环境操作；(3) 你仍然会在 PR 阶段 Review 代码。Shift+Tab 可以随时切回受限模式。

**Q: 通义灵码和 Gemini 的 Review 意见经常重复怎么办？**

A: 正常现象。不同 AI 的训练数据和审查角度不同，重叠部分恰恰说明那些问题是最值得修复的。交给 Claude 处理时，它会自动去重——对同一问题只修复一次，但会在点评中说明"通义灵码和 Gemini 都指出了这个问题"。

**Q: 每次都要手动把 Issue 描述喂给 Claude 吗？**

A: 可以用 `gh issue view` 命令让 Claude 自己读取：

```bash
"请用 gh issue view 42 读取 Issue 内容，然后按流程处理"
```

或者更进一步，把整个流程抽象为一个 Slash Command（见练习 3）。

**Q: 多工作区会不会占用太多磁盘空间？**

A: Git worktree 共享同一个 `.git` 目录，只额外占用工作区文件的空间（不含 git 历史）。对于大多数项目，每个 worktree 只增加几十 MB。

## 下一步

- [1] 进入下一课：Lesson 26 - 课程总结
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 5 | Lesson 25.1/26 | 上一课: Lesson 25 - 完整项目实战 | 下一课: Lesson 26 - 课程总结*
