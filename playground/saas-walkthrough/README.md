# SaaS 软件服务合同纠纷沙盒工作台

> **本仓库是 cc4Lawyer 课程的练习沙盒**,使用一宗虚构 SaaS 合同纠纷案例,演示 Claude Code 如何把"项目目录 + CLAUDE.md + Skills + Rules"组合成一个律师工作台。所有材料均为教学模拟,**不构成法律意见**。

## 你现在站在哪里

```
saas-walkthrough/
├── README.md              ← 你正在看的这份
├── SWARM_PROMPT.md        ← 旧版提示词备份(推荐优先使用 saas-case-swarm Skill)
├── WALKTHROUGH.md         ← Swarm 架构 + 4 个检查点 + 干预手册
├── CLAUDE.md              ← AI 助理的工作守则
├── .claude/
│   ├── agents/            ← 5 个 Agent 定义文件(supervisor / intake / contract / strategist / reviewer)
│   ├── skills/            ← 6 个 Skill(含 saas-case-swarm 自动编排入口)
│   └── rules/             ← 4 条工作纪律(no-fabrication / source-required / sensitive-info / output-disclaimer)
├── 00-项目说明/           ← 案件背景与元数据
├── 01-客户原始材料/        ← 9 份虚构材料(合同、邮件、聊天记录、付款记录...)
├── 02-证据材料/           ← 待你填:整理过的证据
├── 03-法律检索/           ← 待你填:法条、判例
├── 04-工作过程/           ← Swarm Wave 1-4 产出落地处
├── 05-文书草稿/           ← 起诉状、代理意见草稿
├── 06-客户交付/           ← Wave 5 客户版本(已清理内部痕迹)
└── 99-复盘沉淀/           ← Wave 6 可复用模板
```

## 怎么开始(Swarm 自动模式)

```bash
cd playground/saas-walkthrough
claude                   # 在本目录打开 Claude Code
```

然后在 Claude Code 中输入:

```text
/saas-case-swarm
```

Claude 主进程会调用本地 Skill `.claude/skills/saas-case-swarm/SKILL.md`,扮演 `legal-supervisor`,自动创建团队、调度 6 个 Wave、在 **4 个关键点上用 AskUserQuestion 停下来问你拍板**。预计 20-30 分钟跑完一案到底。

`@legal-supervisor` 只是调用一个 Agent 角色,不会自动触发 Swarm Skill;请使用 `/saas-case-swarm`。

想先理解架构再启动?读 `WALKTHROUGH.md`(架构图 + 检查点详解 + 监控干预手册)。
想看旧版手动提示词?读 `SWARM_PROMPT.md`。

## 案件一句话

A 公司给 B 公司搭企业 AI 知识库,合同 30 万,B 公司付了 10 万首付后说"系统不行",拒付 20 万尾款。我方代理 A 公司。

## 重要边界(再说一次)

- 本仓库**不是律师行业标准 SOP**,所有 Skill / Rule / 输出格式都是教学模板。
- 真实落地必须由你所律师团队**替换为本所**的流程、标准、复核机制。
- 所有 AI 输出都是**律师审阅初稿**,最终必须由律师复核才能对外使用。
- `.claude/skills/` 下的 Skill **不是 cc4pm 官方法律 runtime 资产**——它们是你 fork 改造的起点。
