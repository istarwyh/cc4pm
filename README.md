# cc4pm

**Claude Code for Product Makers** — 一个人，一支产品团队

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/istarwyh/cc4pm?style=flat)](https://github.com/istarwyh/cc4pm)

> 一个人，一支产研团队。

<div align="center">

![cc4pm 交互式教学体系海报](https://github.com/user-attachments/assets/a018cb79-1315-4016-8853-d1bd37f3bd20)

**[🎨 Interactive Showcase](https://istarwyh.github.io/cc4pm/)** — 可视化了解四大核心模块、200+ Skills、完整产品工作流

</div>

---

## 这是什么

cc4pm 最初是 **Claude Code for Product Makers**：一套面向**产品主理人**的 AI 全生命周期产品系统**交互式课件**。运行 `npx cc4pm install` 走交互式安装，然后在 Claude Code 里输入 `/cc4pm-guide` 即可开始产品主线学习。

课件覆盖四大主题，从灵感验证到产品上线发布的完整链路：

- **BMM**（业务建模）— 市场研究、PRD 创建、需求拆解、冲刺规划
- **CIS**（创意智能）— 36 种创意技巧、30 种创新框架、故事讲述
- **WDS**（设计系统）— 用户心理映射、UX 场景、设计规范、原型
- **工程工具链** — TDD、代码审查、E2E 测试、安全扫描、CI/CD

仓库里同时收录了课件讲解的**参考实现**（`.claude/` 下的 170+ 个 skill、10+ 个代理、37 个命令、40+ 条规则），可以与课件配合检阅，也可以独立 fork 使用。基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 和 [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) 构建。

---

## 快速开始

```bash
# 交互式安装（推荐）
npx cc4pm install

# 看其他命令
npx cc4pm --help
```

安装完成后打开 Claude Code，输入 `/cc4pm-guide` 启动产品主线交互式教学。

也可以克隆仓库后直接使用（同时获得参考实现）：

```bash
git clone https://github.com/istarwyh/cc4pm.git
cd cc4pm && claude
```

默认安装目标是 Claude Code，内容会写入 `~/.claude/`：

- `skills/cc4pm-guide`
- `guide`
- `scripts/cc4pm-guide-qmd-check.js`
- `cc4pm/install-state.json`


---

## 产品全生命周期

一个创始人使用 cc4pm 从零到一的典型路径：

```
灵感 ─── CIS 头脑风暴 + 创意技巧
  │
验证 ─── BMM 市场研究 + 竞争分析
  │
设计 ─── WDS Trigger Map + UX 场景
  │
规划 ─── BMM PRD + 架构 + 冲刺规划
  │
开发 ─── /plan → /swarm → /simplify
  │
测试 ─── /e2e + 安全扫描
  │
上线 ─── 部署 + 产品叙事
```

---

## 交互式教学

cc4pm 内置了一套完整的交互式课程（26 节课，5 个阶段）：

```bash
# 启动教学
/cc4pm-guide
```

| 阶段 | 内容 | 时长 |
|------|------|------|
| 1. 基础入门 | Claude Code 核心能力、四大模块全景 | ~30 min |
| 2. 产品核心 | BMM + CIS，头脑风暴到冲刺规划 | ~30 min |
| 3. 设计与心理 | WDS，Trigger Map 到 UX 设计 | ~20 min |
| 4. 工程协作 | TDD、E2E、代码审查、质量门禁 | ~15 min |
| 5. 高级实战 | MCP 集成、完整项目从零到发布 | ~25 min |

---

## 项目结构

```
cc4pm/
├── guide/                  产品主线课件：5 阶段 × 26+ 节课 + course-map.yaml
├── verticals/              垂直行业版本（首个 MVP：cc4Lawyer）
├── .claude/
│   ├── skills/cc4pm-guide/   交互式教学入口（SKILL.md）
│   ├── skills/               170+ 个参考 skill（含 bmad-* / 工程 / 内容创作等）
│   ├── agents/               10+ 个参考代理（planner / tdd-guide / code-reviewer 等）
│   ├── commands/             37 个参考斜杠命令
│   ├── rules/                40+ 条编码与行业规则（通用 + 语言等）
│   ├── hooks/                事件驱动 hooks 配置
│   └── mcp-configs/          MCP 服务器配置
├── _bmad/                  BMAD METHOD V6 方法论源文档（BMM/CIS/WDS/Core）
├── manifests/              安装清单（cc4pm-guide / cc4lawyer-guide 等模块）
├── scripts/                安装器（cc4pm.js / install-*.js）+ 课件同步脚本
├── docs/                   Showcase 站点
├── packages/homepage/      @cc4pm/homepage 独立子包
└── the-{long,short}form-guide.md   课件补充长/短文版
```

---

欢迎大家共建项目，沉淀 AI 时代从普通人变成超级个体的路径。🚀🚀

## 致谢

cc4pm 初版基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 和 [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) 构建，感谢原作者 [Affaan Mustafa](https://x.com/affaanmustafa) 和所有贡献者。

---

## License

MIT
