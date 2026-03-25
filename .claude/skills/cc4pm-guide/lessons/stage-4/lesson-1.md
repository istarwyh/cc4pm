# Lesson 21: 工程协作概览：从 PM 到开发者的桥梁

## 本课目标

- 理解 cc4pm 工程协作层的定位：为什么 PM 也需要了解这些工具
- 掌握 /plan 命令的使用方法——在写代码之前做好规划
- 认识 cc4pm 的 18 个专业代理及其分工
- 理解"规划→测试→开发→审查"的完整工程流程

> **阶段概览**：打开 [stage4-overview.html](stage4-overview.html)，用可视化方式浏览阶段 4 的工程工具链和自动化体系。

## 核心内容

### 本课缩写速查表

| 缩写 | 全称 | 中文 | 一句话说明 |
|------|------|------|-----------|
| TDD | Test-Driven Development | 测试驱动开发 | 先写测试再写代码 |
| E2E | End-to-End | 端到端测试 | 模拟真实用户操作的自动化测试 |
| MCP | Model Context Protocol | 模型上下文协议 | AI 代理连接外部工具的标准 |
| CI | Continuous Integration | 持续集成 | 代码合并后自动构建和测试 |
| PR | Pull Request | 拉取请求 | 代码提交到主分支前的审查流程 |

### 为什么 PM 需要了解工程工具？

你已经完成了：

```
CIS  → 创意和方向        (阶段 2, L11-12)
BMM  → 需求和计划        (阶段 2, L13-16)
WDS  → 设计和用户体验     (阶段 3, L17-20)
```

现在到了"把设计变成可运行的产品"的阶段。**作为 PM，你不需要亲自写代码，但你需要理解：**

```
1. 开发团队在用什么流程   → 才能合理估算工期
2. 代码质量怎么保障      → 才能对交付物有信心
3. 自动化做了哪些事      → 才能知道什么不需要人工盯
4. 出了问题怎么定位      → 才能快速协调而不是干等
```

### cc4pm 的工程协作全景

```
┌─────────────────────────────────────────────────────┐
│                 工程协作层                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  /plan ──→ /tdd ──→ /build-fix ──→ /code-review    │
│  规划        开发       修复          审查            │
│    ↓          ↓         ↓            ↓              │
│  planner   tdd-guide  build-error  code-reviewer    │
│  (opus)    (sonnet)   (sonnet)     (sonnet)         │
│                                                     │
│  /e2e ──→ /security-scan ──→ /verify                │
│  端到端      安全扫描          验证循环              │
│    ↓          ↓                ↓                    │
│  e2e-runner  security-       质量门禁               │
│  (sonnet)    reviewer                               │
│              (sonnet)                               │
│                                                     │
│  /learn ──→ /skill-create ──→ 持续学习              │
│  提取模式     生成技能          经验积累              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  自动化层：Hooks（会话启动/结束、工具前后）           │
│  规则层：Rules（编码风格、安全、测试标准）           │
│  集成层：MCP（GitHub、Playwright、Supabase...）     │
└─────────────────────────────────────────────────────┘
```

### /plan 命令——写代码之前先规划

**/plan 是工程协作的第一步**：在任何代码开始之前，先做一个结构化的规划。

**为什么重要**：最昂贵的 Bug 不是代码 Bug，而是"方向 Bug"——做错了才发现。/plan 帮你在动手前确认方向。

**执行效果**：

```bash
/plan
```

```
Planner：让我分析这个任务。

1. 需求复述
   你要实现的是：[精确描述需求]
   确认无误？

2. 实施阶段拆解
   Phase 1: [具体步骤]
   Phase 2: [具体步骤]
   Phase 3: [具体步骤]

3. 依赖识别
   - [组件 A] 依赖 [组件 B]
   - [数据库] 需要先迁移

4. 风险评估
   HIGH:   [风险描述]
   MEDIUM: [风险描述]

5. 复杂度估算
   整体：Medium
   预计：4-6 小时

需要确认后才会开始写代码。
说 "yes" 或 "proceed" 继续。
```

**关键特性**：
- **不会直接写代码**——必须你确认后才开始
- **识别风险和阻碍**——提前暴露问题
- **估算复杂度**——帮你做工期预期管理
- **拆解阶段**——大任务变成可管理的小步骤

**使用代理**：`planner`（opus 模型，最强推理能力）

### cc4pm 的 18 个专业代理

除了你已经认识的 CIS 和 WDS 代理，cc4pm 还有 18 个工程专业代理：

#### 核心开发代理

| 代理 | 角色 | 模型 | 何时使用 |
|------|------|------|---------|
| planner | 规划专家 | opus | 开始新功能、复杂重构前 |
| tdd-guide | TDD 教练 | sonnet | 编写新功能、修复 Bug |
| build-error-resolver | 构建错误修复 | sonnet | 编译/构建失败时 |
| code-reviewer | 代码审查 | sonnet | 提交代码前 |
| security-reviewer | 安全审查 | sonnet | 安全敏感的代码变更 |

#### 测试代理

| 代理 | 角色 | 模型 | 何时使用 |
|------|------|------|---------|
| e2e-runner | E2E 测试 | sonnet | 验证用户流程 |

#### 专项审查代理

| 代理 | 角色 | 模型 | 何时使用 |
|------|------|------|---------|
| go-reviewer | Go 代码审查 | sonnet | Go 项目 |
| python-reviewer | Python 代码审查 | sonnet | Python 项目 |
| kotlin-reviewer | Kotlin 代码审查 | sonnet | Kotlin 项目 |
| database-reviewer | 数据库审查 | sonnet | SQL/Supabase 变更 |

#### 基础设施代理

| 代理 | 角色 | 模型 | 何时使用 |
|------|------|------|---------|
| architect | 架构师 | opus | 系统设计决策 |
| go-build-resolver | Go 构建修复 | sonnet | Go 构建失败 |
| kotlin-build-resolver | Kotlin 构建修复 | sonnet | Kotlin 构建失败 |
| doc-updater | 文档同步 | sonnet | 代码变更后更新文档 |
| refactor-cleaner | 重构清理 | sonnet | 清除死代码 |

#### 高级代理

| 代理 | 角色 | 模型 | 何时使用 |
|------|------|------|---------|
| harness-optimizer | 性能调优 | opus | 优化代理系统本身 |
| loop-operator | 自主循环 | sonnet | 长时间自动化任务 |
| chief-of-staff | 通讯助理 | opus | 邮件/消息分流 |

### 代理的模型选择逻辑

```
opus (最强推理)
  ↓ 用于：架构决策、安全深度审查、复杂规划
  ↓ 代理：planner, architect, security-reviewer, harness-optimizer

sonnet (编码能力)
  ↓ 用于：写代码、审查、测试、构建修复
  ↓ 代理：tdd-guide, code-reviewer, e2e-runner, build-error-resolver

haiku (快速轻量)
  ↓ 用于：简单分析、只读任务
  ↓ 代理：（当前无默认 haiku 代理，可自定义）
```

### "规划→测试→开发→审查"的完整流程

PM 最需要理解的工程流程：

```
Step 1: /plan
        ↓ 需求复述 → 阶段拆解 → 风险评估 → 确认

Step 2: /tdd（RED 阶段）
        ↓ 先写失败的测试 → 定义"成功"长什么样

Step 3: /tdd（GREEN 阶段）
        ↓ 写最少代码让测试通过

Step 4: /build-fix（如果构建失败）
        ↓ 自动检测并修复编译错误

Step 5: /tdd（REFACTOR 阶段）
        ↓ 优化代码结构，测试保持绿色

Step 6: /code-review
        ↓ 安全检查 + 代码质量 + 最佳实践

Step 7: /e2e
        ↓ 端到端测试验证用户流程

Step 8: git commit → PR → 合并
```

**这个流程和 BMM 的 Story 实现对接**：

```
BMM Story 文件（John 创建）
    ↓ 包含 BDD 验收标准
    ↓
/plan → /tdd → /build-fix → /code-review → /e2e
    ↓
Story 完成 → 回到 Bob 的冲刺状态追踪
```

### PM 的参与点

| 工程阶段 | PM 参与度 | 你需要做什么 |
|---------|----------|------------|
| /plan | **高** | 确认需求复述是否准确、阶段拆解是否合理 |
| /tdd | **低** | 知道测试覆盖率目标（80%+）即可 |
| /build-fix | **无** | 自动化处理 |
| /code-review | **中** | 关注安全审查结果（CRITICAL/HIGH 问题） |
| /e2e | **高** | 确认测试场景覆盖了核心用户旅程 |
| PR/合并 | **中** | 大型功能需要 PM 确认后合并 |

### GitHub Actions CI/CD——让 Claude 自动审查每个 PR

上面的流程都是你**手动触发**的——输 /plan、输 /code-review。但在团队协作中，你不可能每个 PR 都亲自盯。

**GitHub Actions 让 Claude 自动化参与 CI/CD 流程**——代码一提交，Claude 自动审查。

#### 什么是 CI/CD（给 PM 的解释）

```
CI（持续集成）：
  开发者提交代码 → 自动运行测试 → 通过才能合并
  → 防止"代码合进去才发现有 Bug"

CD（持续部署）：
  代码合并后 → 自动部署到测试/生产环境
  → 不需要人工"点击发布"
```

#### Claude + GitHub Actions 能做什么

```
开发者提交 PR
    ↓
GitHub Actions 自动触发
    ↓
┌─────────────────────────────────┐
│  Step 1: 自动跑测试（npm test）  │
│  Step 2: Claude 自动代码审查     │ ← 这就是 AI 的价值
│  Step 3: Claude 检查安全风险     │
│  Step 4: 通过 → 自动标记 Ready  │
│          不通过 → 自动留评论     │
└─────────────────────────────────┘
    ↓
PM 只需要看审查结果，不需要全程参与
```

**对 PM 意味着什么**：
- **你不需要配置**——这是开发团队或 DevOps 设置的
- **你需要理解**——"为什么这个 PR 被 Claude 打回了"
- **你能利用**——Claude 的审查报告可以帮你快速判断功能是否达标

#### 实际效果示例

```
Claude Bot 在 PR #127 上的评论：

✅ 代码审查通过
  - 逻辑正确，测试覆盖 87%
  - 无安全风险
  - 符合项目编码规范

⚠️ 建议改进（非阻塞）：
  - src/utils/format.ts:42 — 这个正则可以简化
  - src/api/auth.ts:18 — 建议添加 rate limiting

[Approve]
```

当你在 GitHub 上看到 Claude Bot 的自动审查时，不再是黑盒子——你知道它在背后执行的就是 /code-review 的四级审查逻辑（详见 Lesson 22）。

## 🛠️ 实操练习

完成以下练习，掌握工程协作的核心工具。

### 练习 1：使用 /plan 生成实现计划

```bash
# 为一个功能生成实现计划
/plan
```

**任务**：
1. 选择一个 Story（如"用户注册功能"）
2. 运行 `/plan` 生成实现方案
3. 查看生成的任务分解和风险评估

**预期产出**：
- 任务分解清单
- 技术方案建议
- 风险评估和依赖分析

### 练习 2：了解 18 个代理

查看工程代理的完整列表：

```bash
# 查看代理列表
ls agents/
```

**核心代理速览**：

| 代理 | 命令 | 用途 |
|------|------|------|
| planner | `/plan` | 实现规划 |
| tdd-guide | `/tdd` | 测试驱动开发 |
| code-reviewer | `/code-review` | 代码审查 |
| build-error-resolver | `/build-fix` | 构建错误修复 |
| e2e-runner | `/e2e` | 端到端测试 |

### 练习 3：探索工程命令

尝试以下命令了解工程工具链：

```bash
# 代码审查
/code-review

# 测试驱动开发
/tdd

# 构建错误修复
/build-fix
```

**检查清单**：
- [ ] 成功运行 `/plan` 生成实现计划
- [ ] 了解了 18 个工程代理的分类
- [ ] 理解了 /plan、/tdd、/code-review、/build-fix 的协作关系

---

## 常见问题

**Q: 我不写代码，学这些有什么用？**

A: 三个实际用途：(1) 当开发说"这需要 2 周"时，你能用 /plan 快速验证复杂度；(2) 当 Bug 出现时，你能看懂测试报告知道问题在哪；(3) 当代码审查发现安全问题时，你能理解严重程度并做优先级决策。

**Q: 这 18 个代理都需要手动调用吗？**

A: 不需要。大部分代理通过命令自动调用——你输 /tdd，系统自动调用 tdd-guide 代理。你只需要记住命令名，不需要记代理名。

**Q: /plan 和 BMM 的 Sprint Planning 有什么区别？**

A: Sprint Planning（/bmad-sm 的 SP）是项目级别的规划——安排多个 Story 到多个冲刺。/plan 是任务级别的规划——针对单个 Story 或功能的实现方案。前者回答"先做什么后做什么"，后者回答"这个怎么做"。

## 下一步

- [1] 进入下一课：Lesson 22 - 测试与代码审查
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 21/26 (阶段内 1/3) | 上一课: Lesson 20 - 故事讲述（阶段 3） | 下一课: Lesson 22 - 测试与审查*
