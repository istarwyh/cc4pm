# Lesson 22.1: Eval-Driven Development (EDD)——量化 AI 的表现

## 本课目标

- 理解评估驱动开发 (EDD) 的核心理念：先出考卷，后写代码
- 掌握 Generator-Evaluator (生成器-评估器) 分离模式
- 学会使用 pass@k 和 pass^k 指标量化 AI 的可靠性
- 能够为新功能定义 Capability Evals (能力评估) 和 Regression Evals (回归评估)

> **前置知识**：本课建立在 Lesson 22（测试与代码审查）的基础上。如果你还不了解 TDD 和 /e2e 命令，请先回顾上一课。

## 核心内容

### 什么是 EDD (Eval-Driven Development)？

在传统开发中，我们用测试驱动开发 (TDD)。在 AI 开发中，我们需要**评估驱动开发 (EDD)**。

AI 的输出具有随机性。同一个 Prompt，今天能跑通，明天可能就坏了。EDD 的核心就是**把对 AI 的主观感受变成客观的数字**。

```
传统 TDD：写失败的测试 → 写代码 → 测试通过
AI EDD：定义评估标准 (Eval) → 生成方案 → 运行评估 → 计算成功率 (pass@k)
```

### Generator-Evaluator 分离模式

Anthropic 工程团队发现：**AI 给自己的工作打分时，会系统性地偏高**。

```
❌ 错误做法：让同一个 AI 写代码并问它“这段代码好吗？”
✅ 正确做法：
   - Generator (生成器): 负责实现功能（如 tdd-guide 代理）
   - Evaluator (评估器): 负责独立审查（如 code-reviewer 代理）
```

评估器必须是“从未见过代码实现过程”的第三方，它只根据你的 **验收标准 (Success Criteria)** 给出 Pass 或 Fail。

### 量化指标：pass@k 与 pass^k

| 指标 | 含义 | 适用场景 |
| :--- | :--- | :--- |
| **pass@1** | 第一次尝试就成功的概率 | 衡量开发效率 (Efficiency) |
| **pass@3** | 试 3 次，至少成功一次的概率 | 衡量实用性 (Practicality) |
| **pass^3** | 连续 3 次尝试全部成功 | 衡量稳定性 (Stability)，用于核心链路 |

**PM 的经验公式**：
- 新功能开发：目标 `pass@3 >= 90%`
- 核心回归路径：目标 `pass^3 = 100%`

**实际概率参考**（假设单次成功率 70%）：

| 尝试次数 k | pass@k（至少 1 次成功） | pass^k（全部成功） |
|:---:|:---:|:---:|
| 1 | 70% | 70% |
| 3 | 91% | 34% |
| 5 | 97% | 17% |

**操作建议**：
- 只需要"能工作"→ 关注 **pass@k**（多试几次，总有一次对的）
- 需要"稳定可靠"→ 关注 **pass^k**（每次都必须对，如金融计算）
- 对关键功能，用 `/tdd` 跑 3 次，如果 3 次结果一致（pass^3），说明实现是稳定的

### 评估类型：Capability vs Regression

1.  **能力评估 (Capability Evals)**：测试 AI “能不能做到以前做不到的事”。
    *   例如：“AI 能否根据 PRD 自动生成符合规范的 GraphQL Schema？”
2.  **回归评估 (Regression Evals)**：确保 AI “在做新事时没把旧事搞砸”。
    *   例如：“添加了用户注册功能后，原有的登录功能还正常吗？”

### 评分器类型 (Grader Types)

- **Code Grader (确定性)**：用脚本检查结果。
  - `grep -q "export class User" src/models.ts` (检查类定义)
  - `npm test` (运行单元测试)
- **Model Grader (概率性)**：让另一个 AI 代理根据 Rubric (评分细则) 打分。
  - “评分 1-5：UI 布局是否符合 Apple 设计指南？”

---

## 🛠️ 实操练习

### 练习 1：定义一份 Eval 合约

为一个“自动生成 README 摘要”的功能定义评估标准：

```markdown
## EVAL: readme-summary-gen

### Capability Evals (能力)
- [ ] 摘要字数在 100-200 字之间
- [ ] 包含项目的所有核心模块名称
- [ ] 使用了 Markdown 引用格式

### Success Metrics
- pass@3 > 90%
```

### 练习 2：运行 eval-harness

你可以尝试在终端输入 `/eval check <feature-name>`（如果已配置评估集）来观察评估过程。

---

## 常见问题

**Q: 为什么要花时间写 Eval，而不是直接手动检查？**
A: 手动检查无法规模化。当你迭代 Prompt 或升级模型（比如从 Sonnet 3.5 升级到 4.6）时，Eval 是唯一的质量护栏，能瞬间告诉你新模型是否造成了质量倒退。

**Q: pass@3 达到 100% 就够了吗？**
A: 不够。如果 `pass@1` 很低（比如 20%），说明 AI 需要反复重试才能做对，这会消耗大量的 Token 和时间。你的目标是逐步优化 Prompt，提升 `pass@1` 的分数。

---

## 下一步

- [1] 继续 Lesson 23：自动化工作流——将 EDD 集成进闭环
- [2] 深入理解：**[Lesson 23.1 Harness 设计哲学](lesson-3.1.md)** —— 学习如何用闭环驱动评估
- [3] 返回主菜单

---
*阶段 4 | Lesson 22.1/26 | 上一课: Lesson 22 - 测试与审查 | 下一课: Lesson 22.2 - 视觉校验*
