# Lesson 21: 工程协作概览：产品主理人的交付引擎

## 本课目标

- 掌握 cc4pm 工程协作层——你把创意变成可运行产品的核心引擎
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

### 从创意到交付——你的最后一公里

你已经完成了：

```
CIS  → 创意和方向        (阶段 2, L11-12)
BMM  → 需求和计划        (阶段 2, L13-16)
WDS  → 设计和用户体验     (阶段 3, L17-20)
```

现在进入"把设计变成可运行产品"的阶段。**作为产品主理人，这些工程工具就是你的交付引擎**——你用 AI 代理来完成编码、测试和发布，就像前面用 AI 代理做头脑风暴和设计一样自然。

```
1. /plan 规划实现方案     → 你决定怎么做
2. /tdd 驱动代码生成      → AI 帮你写代码和测试
3. /build-fix 自动修复    → 构建出错自动解决
4. /code-review 质量把关  → AI 审查代码质量和安全
5. /e2e 验证用户流程      → 确保功能真正可用
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

除了你已经认识的 CIS 和 WDS 代理，cc4pm 还有 18 个工程专业代理。按模型分三层：

| 模型 | 代理 | 角色 | 何时使用 |
|------|------|------|---------|
| **opus** | planner | 规划专家 | 开始新功能、复杂重构前 |
| opus | architect | 架构师 | 系统设计决策 |
| opus | security-reviewer | 安全审查 | 安全敏感的代码变更 |
| opus | harness-optimizer | 性能调优 | 优化代理系统本身 |
| opus | chief-of-staff | 通讯助理 | 邮件/消息分流 |
| **sonnet** | tdd-guide | TDD 教练 | 编写新功能、修复 Bug |
| sonnet | code-reviewer | 代码审查 | 提交代码前 |
| sonnet | e2e-runner | E2E 测试 | 验证用户流程 |
| sonnet | build-error-resolver | 构建错误修复 | 编译/构建失败时 |
| sonnet | go-reviewer / python-reviewer / kotlin-reviewer | 语言审查 | 对应语言项目 |
| sonnet | database-reviewer | 数据库审查 | SQL/Supabase 变更 |
| sonnet | go-build-resolver / kotlin-build-resolver | 构建修复 | 对应语言构建失败 |
| sonnet | doc-updater | 文档同步 | 代码变更后更新文档 |
| sonnet | refactor-cleaner | 重构清理 | 清除死代码 |
| sonnet | loop-operator | 自主循环 | 长时间自动化任务 |

**选择逻辑**：opus 用于需要深度推理的决策（架构、安全、规划），sonnet 用于编码执行（写代码、审查、测试），haiku 用于轻量只读任务（可自定义代理）。

### "规划→测试→开发→审查"的完整流程

产品主理人的完整工程流程：

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

**这个流程和 BMM 的 Story 实现对接**：John 创建的 Story（含 BDD 验收标准）→ /plan → /tdd → /build-fix → /code-review → /e2e → Story 完成 → 回到 Bob 的冲刺状态追踪。

### 产品主理人的工程节奏

| 工程阶段 | 你做什么 |
|---------|---------|
| /plan | 确认需求复述、调整阶段拆解、把控风险优先级 |
| /tdd | 定义验收标准，让 AI 按标准生成代码和测试 |
| /build-fix | 遇到构建失败时一键修复，不用自己排查 |
| /code-review | 审阅 CRITICAL/HIGH 问题，决定是否修复或接受 |
| /e2e | 确认测试场景覆盖核心用户旅程，验收产品质量 |
| PR/合并 | 确认功能完整后合并，准备发布 |

### GitHub Actions CI/CD——让 Claude 自动审查每个 PR

上面的流程都是你**手动触发**的——输 /plan、输 /code-review。但在团队协作中，你不可能每个 PR 都亲自盯。

**GitHub Actions 让 Claude 自动化参与 CI/CD 流程**——代码一提交，Claude 自动审查。

#### CI/CD 是什么

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
你只需要看审查结果，决定是否合并
```

**对你意味着什么**：
- **你不需要配置**——GitHub Actions 是一次性设置
- **你能看懂**——Claude 打回 PR 时，你知道原因
- **你能利用**——Claude 的审查报告帮你快速判断功能是否达标

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

#### 实战配置：GitHub Actions 工作流

把下面的 YAML 保存为 `.github/workflows/claude-review.yml`，Claude 就会在每个 PR 创建或更新时自动审查：

```yaml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Claude Code
        run: |
          npm install -g @anthropic/claude-code

      - name: Run Claude Code Review
        run: |
          claude -p "
          对这个 PR 进行代码审查：
          1. 检查代码质量
          2. 识别潜在问题
          3. 提供改进建议
          4. 验证测试覆盖
          " --allowedTools Read,Bash
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**关键点**：
- `--allowedTools Read,Bash` —— 只给 Claude 读文件和执行命令的权限，不能改代码
- `ANTHROPIC_API_KEY` —— 在 GitHub 仓库 Settings → Secrets 中配置
- 触发条件是 PR 的 `opened` 和 `synchronize`（有新 push）事件

#### 实战配置：自动化部署检查

部署前让 Claude 跑一遍全量检查，把下面的脚本保存为 `deploy-check.sh`：

```bash
#!/bin/bash
# deploy-check.sh — 部署前自动检查

claude -p "
执行部署前检查：
1. 验证所有测试通过
2. 检查构建是否成功
3. 验证环境配置
4. 检查数据库迁移
5. 确认依赖版本兼容性
6. 生成部署报告
" --allowedTools Bash,Read,Write
```

**使用方式**：

```bash
# 手动执行部署检查
chmod +x deploy-check.sh
./deploy-check.sh

# 或者集成到 CI 流程中，在部署步骤之前调用
```

**和 GitHub Actions 的区别**：
- GitHub Actions —— 每个 PR 自动触发，面向团队协作
- deploy-check.sh —— 手动或部署流水线触发，面向发布决策

## 🛠️ 实操练习

### 练习 1：使用 /plan 生成实现计划

选择一个 Story（如"用户注册功能"），运行 `/plan`，查看任务分解、风险评估和依赖分析。

### 练习 2：探索工程代理和命令

```bash
ls agents/          # 查看 18 个工程代理
/plan               # 实现规划
/tdd                # 测试驱动开发
/code-review        # 代码审查
/build-fix          # 构建错误修复
/e2e                # 端到端测试
```

**检查清单**：
- [ ] 成功运行 `/plan` 生成实现计划
- [ ] 了解了 18 个工程代理的分类
- [ ] 理解了 /plan、/tdd、/code-review、/build-fix 的协作关系

---

## 常见问题

**Q: 工程命令和前面的 BMM/CIS/WDS 是什么关系？**

A: 一句话：**CIS 决定做什么，BMM 规划怎么做，WDS 设计长什么样，工程命令把它变成真的**。你从头到尾都是决策者和执行者，AI 代理是你的工具。

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
