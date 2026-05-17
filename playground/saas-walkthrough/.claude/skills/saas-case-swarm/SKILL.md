---
name: saas-case-swarm
description: 自动化执行 SaaS 合同纠纷一案到底 Swarm 流程，调度法律 Agent Team，并在关键检查点用 AskUserQuestion 征求律师意见。
---

# SaaS Case Swarm

本 Skill 用于 `playground/saas-walkthrough/` 沙盒项目：自动执行一宗虚构 SaaS 软件服务合同纠纷的一案到底演示流程。

它是 cc4Lawyer 课程的教学 Skill，不是法律行业 SOP，不构成法律意见，也不替代律师判断。所有输出均为律师审阅初稿。

## 触发后立即执行

当用户调用本 Skill 时，不要解释 Skill 内容，不要让用户再复制提示词。直接按下列流程执行。

如果当前目录不是 `saas-walkthrough/`，或缺少 `README.md`、`CLAUDE.md`、`00-项目说明/案件背景.md`、`01-客户原始材料/`，先停下来说明需要在沙盒项目根目录启动。

## 全局约束

- 严守 `CLAUDE.md` 的工作边界、保密要求、禁止事项、复核要求。
- 关键事实必须标注来源文件路径。
- 无来源事实标注 `【材料未见】`。
- 法律判断、策略选择、金额口径、对外发送内容标注 `【需律师确认】`。
- 不编造事实、证据、金额、日期、法律依据、案例或司法观点。
- 不使用“必胜”“稳赢”“法院一定支持”等绝对化表达。
- 客户版不得出现：Claude、AI、Skill、Agent、Reviewer、提示词、内部复核过程、`【需律师确认】`、`【材料未见】`。
- 4 个人工检查点必须使用 `AskUserQuestion`，不要用普通文字提问代替。
- 每个 Wave 完成后，只向用户简短汇报 3-5 行。
- 任一 teammate 报告“信息不足”“材料冲突”“超出能力”，立即暂停并汇报，不要继续推进。
- 不对外发送邮件、消息或文件；`06-客户交付/00-给客户的话.md` 只是草稿。

## Wave 0：准备

1. 读取：
   - `README.md`
   - `CLAUDE.md`
   - `00-项目说明/案件背景.md`
2. 调用 `TeamCreate`：
   - `team_name`: `saas-case`
   - `description`: `SaaS contract dispute end-to-end`
3. 用 `TaskCreate` 建立 6 个任务节点：
   - Wave 1：基础事实与合同审查
   - Wave 2：证据目录
   - Wave 3：诉讼准备报告
   - Wave 4：独立风险复核
   - Wave 5：客户交付包
   - Wave 6：复盘沉淀
4. 用 `TaskList` 显示任务全貌。
5. 用 5-7 行汇报已读取的案件背景、默认代理立场和执行边界。

## 人工检查点 1：启动前拍板

调用 `AskUserQuestion` 一次问完 3 个问题：

1. 代理立场：
   - 确认代理 A 公司（青石云科技）
   - 切换代理 B 公司（北辰制造）
2. 优先目标：
   - 先看完报告再定
   - 协商
   - 诉讼
   - 仲裁
3. 特别指示：
   - 暂无特别指示
   - 强调系统已交付和登录使用记录
   - 强调继续合作与和解空间
   - 重点识别对我方不利事实

用户可通过 Other 补充自定义指示。后续所有 agent prompt 必须继承用户在本检查点的选择。

## Wave 1：基础事实（并行）

在同一个回复中并行 spawn 两个 teammate。

### teammate A：intake-analyst

使用 `Agent`：

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `intake-analyst`
- `description`: `Run lawyer-case-intake on raw materials`
- `prompt`:

```text
你扮演 .claude/agents/legal-intake-analyst.md 的角色。
先读 .claude/skills/lawyer-case-intake/SKILL.md 和项目根目录 CLAUDE.md。
然后逐一读 01-客户原始材料/ 下全部 9 份 .md。
产出两个文件：
- 04-工作过程/01-案件摘要.md：覆盖当事人、争议焦点、核心金额、材料缺口、客户追问清单。
- 04-工作过程/02-事实时间线.md：markdown 表格，列为 日期 / 事实 / 来源文件 / 证明意义 / 待确认事项。
所有事实必须标注来源文件路径。
无来源标【材料未见】，不确定的法律判断标【需律师确认】。
继承 Supervisor 告知的代理立场、优先目标和特别指示。
完成后向 Supervisor 报告产出文件路径和 3 行内容摘要，然后 idle。
```

### teammate B：contract-reviewer

使用 `Agent`：

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `contract-reviewer`
- `description`: `Run lawyer-contract-review on contract and supplementary agreement`
- `prompt`:

```text
你扮演 .claude/agents/contract-reviewer.md 的角色。
先读 .claude/skills/lawyer-contract-review/SKILL.md 和项目根目录 CLAUDE.md。
审查 01-客户原始材料/软件服务合同.md 和 01-客户原始材料/补充协议.md。
产出 04-工作过程/03-合同风险审查表.md，用 7 列表格：
条款编号 | 原文摘要 | 风险等级 | 风险说明 | 修改建议 | 谈判优先级 | 给业务的白话解释
重点覆盖：付款 / 服务内容 / 验收 / 违约责任 / 争议解决 / 新增需求 / 知识产权 / 保密。
“给业务的白话解释”必须是非法律背景客户能看懂的中文短句。
无法确认的适用背景标【需律师确认】。
继承 Supervisor 告知的代理立场、优先目标和特别指示。
完成后向 Supervisor 报告产出文件路径和 3 行内容摘要，然后 idle。
```

两个 teammate 都完成后，Supervisor 读取三份产出并做 5 项快速校验：

- 是否所有事实都有来源。
- 是否出现 `【材料未见】` 或 `【需律师确认】`。
- 金额、日期、主体是否与原始材料一致。
- 是否避免绝对化表达。
- 合同审查中是否识别验收条款与双方风险。

## Wave 2：证据目录

Spawn `evidence-cataloger`：

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `evidence-cataloger`
- `description`: `Build evidence catalog`
- `prompt`:

```text
你是证据目录助理。
先读 .claude/skills/lawyer-evidence-catalog/SKILL.md 和 CLAUDE.md。
读 04-工作过程/01-案件摘要.md 和 04-工作过程/02-事实时间线.md 作为事实索引。
然后对 01-客户原始材料/ 下全部 9 份材料，产出 04-工作过程/04-证据目录.md，用 7 列表格：
序号 | 证据名称 | 来源文件 | 证明目的 | 对应事实 | 证明力风险 | 需补强事项
每份材料至少出现一次；同一份材料可服务多个证明目的。
客户投诉邮件必须如实列入，并标注可能支持对方抗辩。
系统登录记录的证明力风险列必须提到后台导出、防篡改、账号对应关系。
继承 Supervisor 告知的代理立场、优先目标和特别指示。
完成后报告产出路径和 3 行摘要，然后 idle。
```

## Wave 3：诉讼准备报告

Spawn `litigation-strategist`：

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `litigation-strategist`
- `description`: `Generate litigation brief`
- `prompt`:

```text
你扮演 .claude/agents/litigation-strategist.md 的角色。
先读 .claude/skills/lawyer-litigation-brief/SKILL.md 和 CLAUDE.md。
读 04-工作过程/01-案件摘要.md、04-工作过程/02-事实时间线.md、04-工作过程/03-合同风险审查表.md、04-工作过程/04-证据目录.md 作为输入。
产出 04-工作过程/05-诉讼准备报告.md，包含 9 个部分：
1. 案件基本事实
2. 我方可能诉讼请求：标注金额、利息、违约金计算口径，所有计算口径标【需律师确认】
3. 争议焦点：至少 4 个
4. 举证责任：我方 / 对方各需证明什么
5. 现有证据情况：对应到证据目录
6. 对方可能抗辩：基于 01-客户原始材料/对方律师函.md
7. 我方回应思路
8. 需补充材料
9. 需进一步法律检索的问题
严禁出现“必胜”“稳赢”“法院一定支持”。
所有策略判断标【需律师确认】。
不利事实必须如实保留并提供回应思路。
继承 Supervisor 告知的代理立场、优先目标和特别指示。
完成后报告产出路径和 3 行摘要，然后 idle。
```

## 人工检查点 2：策略拍板

Supervisor 读取 `04-工作过程/05-诉讼准备报告.md`，提取核心要点 3-5 行，然后调用 `AskUserQuestion`：

1. 争议焦点取舍：从报告中选出 2-4 个最关键争议焦点作为选项，允许用户多选；保留 Other。
2. 诉求金额和违约金口径：
   - 暂按 200,000 元尾款 + 合同违约金口径
   - 只主张 200,000 元尾款，暂缓违约金
   - 金额和口径都需律师重新指定
3. 程序路径：
   - 先发律师函再决定
   - 直接准备起诉
   - 优先协商和解
   - 先补充证据再决定

将用户选择写入后续 Wave 的上下文。

## Wave 4：独立风险复核

Spawn `risk-reviewer`。这一步必须独立于生成 agent，不要让上游 teammate 自审。

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `risk-reviewer`
- `description`: `Independent risk review`
- `prompt`:

```text
你扮演 .claude/agents/legal-risk-reviewer.md 的角色 + Risk Reviewer 视角。
先读 .claude/skills/lawyer-risk-review/SKILL.md 和 CLAUDE.md。
然后读 04-工作过程/01-案件摘要.md、04-工作过程/02-事实时间线.md、04-工作过程/03-合同风险审查表.md、04-工作过程/04-证据目录.md、04-工作过程/05-诉讼准备报告.md。
按 SKILL.md 8 项检查清单逐项复核，产出 04-工作过程/06-复核报告.md，用 5 列表格：
问题清单 | 风险等级 | 涉及文件 | 修改建议 | 是否必须律师确认
硬性纪律：
- 不重写正文，只挑问题，只给建议。
- 不替律师做最终判断。
- 至少识别 5 处问题；任何完美无瑕的报告都是失职信号。
- 至少 1 处标为“高”风险。
完成后报告产出路径和高风险问题摘要，然后 idle。
```

## 人工检查点 3：复核结果处置

Supervisor 读取 `04-工作过程/06-复核报告.md`，把高 / 中风险问题清单压缩成表格显示给用户，然后调用 `AskUserQuestion`：

1. 处置方式：
   - 全部修订：调相关生成 agent 定点修订，再二次复核
   - 只修高风险：中低风险暂接受
   - 全部接受继续：不进入修订循环
2. 额外检查项：
   - 暂无额外检查项
   - 再查事实来源完整性
   - 再查客户版表达风险
   - 再查对方可攻击点

如果用户选择修订：

- 并行 spawn 相关生成 agent 做定点修订。
- 只修改 reviewer 指出的问题，不整篇重写。
- 完成后再 spawn `risk-reviewer` 做二次复核。
- 修订循环最多 2 轮；超过 2 轮必须停下来问用户。

## Wave 5：客户版本清理

Spawn `client-packager`：

- `subagent_type`: `general-purpose`
- `team_name`: `saas-case`
- `name`: `client-packager`
- `description`: `Clean internal traces for client deliverable`
- `prompt`:

```text
你是客户交付包整理助理。
先读 CLAUDE.md 中关于 06-客户交付 的规则。
读 04-工作过程/01-案件摘要.md、04-工作过程/02-事实时间线.md、04-工作过程/03-合同风险审查表.md、04-工作过程/04-证据目录.md、04-工作过程/05-诉讼准备报告.md 中已通过复核或被 Supervisor 标记为接受的内容。
清理规则：
- 不得把【需律师确认】【材料未见】直接删掉后改成确定结论；必须逐项改写为客户可读的“建议补充 / 待核验 / 需进一步确认”表述。
- 删除任何关于 Claude / AI / Skill / Agent / Reviewer / 提示词的痕迹。
- 删除内部推演过程，改为客户可读的结论、风险提示与待核验事项。
- 保留不利事实，客户必须知道全貌。
- 保留风险提示。
- 将“待补充”改为“建议补充”；不稳妥的“可能”只能改为有依据的谨慎表达，不能包装成确定判断。
产出 5 份文件：
- 06-客户交付/01-客户版案件摘要.md
- 06-客户交付/02-客户版时间线.md
- 06-客户交付/03-客户版合同审查要点.md
- 06-客户交付/04-客户版诉讼策略汇报.md
- 06-客户交付/00-给客户的话.md：300 字以内邮件草稿，告知初步分析完成、附件清单、下次会议建议讨论 3 个问题。
最后自检：客户版文件绝不出现 Claude / AI / Skill / Agent / Reviewer / 提示词；内部标记【需律师确认】/【材料未见】必须已改写为客户可读的待核验或建议补充事项。
完成后报告产出路径和自检结果，然后 idle。
```

## 人工检查点 4：客户版终审

Supervisor 读取 `06-客户交付/` 全部 5 份，向用户显示 `06-客户交付/00-给客户的话.md` 全文，然后调用 `AskUserQuestion`：

1. 客户版终审：
   - 可以作为律师审阅初稿进入人工复核
   - 重写邮件语气
   - 退回重做客户交付包
2. 邮件抄送占位：
   - 暂不填写抄送
   - 抄送客户法务
   - 抄送客户业务负责人
   - 抄送律所项目组

强调这只是草稿和占位，不执行真实发送。

## Wave 6：复盘沉淀

不需要 spawn agent。Supervisor 自己整理：

`99-复盘沉淀/saas-合同纠纷-模板片段.md`

包含：

1. 本案适用的 SOP 维度清单。
2. 这类案件的事实必查项。
3. 这类案件最常缺的材料。
4. 6 项自检中最容易漏的几项。
5. 5 个法律 Skill 在本案中最有价值和最需要本所定制的 backlog。

## 收尾报告

最后向用户报告：

1. 全部产出文件：`04-工作过程/`、`06-客户交付/`、`99-复盘沉淀/`，每个文件 1 行说明。
2. 全程共出现多少处 `【需律师确认】`、多少处 `【材料未见】`。
3. Supervisor 对 6 项自检中最不放心的一项及原因。
4. 从启动到完成的总耗时。

完成后不要创建 PR，不要提交 git，除非用户明确要求。