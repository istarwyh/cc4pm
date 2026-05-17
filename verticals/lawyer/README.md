# cc4Lawyer by cc4pm

cc4Lawyer 是 cc4pm 的第一个垂直行业课程 MVP。它不提供法律行业解决方案，也不替律师行业编写权威 SOP；它用一个接近实际的 SaaS 软件服务合同纠纷教学案例，讲清楚 Claude Code 的能力如何组合成一套行业工作台课程。

这门课的核心问题不是“cc4pm 帮律师做什么”，而是“律师、法务、律所团队如何把自己的专业流程、团队分工、复核标准和交付模板，沉淀成 Claude Code 项目”。

## 课程定位

- **我们提供的是课程**：讲项目目录、CLAUDE.md、上下文管理、Skills、Agents、Supervisor、Reviewer/Evaluator、交付包和模板沉淀。
- **法律只是教学场景**：SaaS 合同纠纷案例用于串联 Claude Code 能力，不代表 cc4pm 拥有或交付法律行业标准答案。
- **示例是教学脚手架**：`skills/`、`agents/`、`rules/` 中的内容用于课堂演示结构，真实机构必须替换成自己的 SOP、审查标准和复核机制。
- **目标是方法迁移**：学员学完后，应能把同样的方法迁移到自己的案由、业务线、机构流程或其他行业场景。

## 适用边界

- 仅用于课程教学和律师工作辅助方法演示。
- 不替代执业律师的专业判断。
- 不构成法律意见。
- 不提供权威法律 SOP、标准法律 Agent 或可直接生产使用的法律工作流。
- 所有 AI 输出必须由律师复核。
- 不应上传未脱敏的客户敏感信息、刑事案卷、商业秘密或未公开交易资料。

## 目录

- `guide/`：4 阶段、10 节课的垂直行业课程。
- `templates/`：用于讲解项目工作台结构的模板。
- `examples/saas-contract-dispute/`：贯穿课程的模拟案例材料。
- `skills/`：教学用 Skill 模板，展示如何封装机构自己的高频流程。
- `agents/`：教学用 Agent 模板，展示如何拆分角色和协作边界。
- `rules/`：教学用 Rule 模板，展示如何显性化输出边界和复核原则。
- `manifests/`：课程模块安装清单。

## 推荐讲课主线

1. 用项目目录把案件材料变成 Claude Code 可理解的上下文。
2. 用 `CLAUDE.md` 写清楚机构工作守则、保密边界和输出口径。
3. 用 Skills 演示“如何把重复流程封装成可复用动作”。
4. 用 Agent Teams 演示“如何把多人协作拆成角色和责任边界”。
5. 用 Supervisor 演示“如何调度 Detect → Execute → Evaluate → Package 的课程流程”。
6. 用 Reviewer/Evaluator 演示“如何让质量控制独立于生成动作”。
7. 用交付包和复盘模板演示“如何把一次项目沉淀成下一次可复用资产”。

## 使用方式

安装后在 Claude Code 中运行：

```bash
/cc4lawyer-guide
```

也可以直接阅读 `guide/course-map.yaml` 与 `guide/lessons/`，按课程搭建本地教学工作台。课堂中出现的 Skill、Agent、Rule 都应被解释为“结构示例”，而不是法律行业标准答案。
