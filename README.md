# cc4pm

**Claude Code for Product Makers** — AI 驱动的产品全生命周期系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/istarwyh/cc4pm?style=flat)](https://github.com/istarwyh/cc4pm)

> 从想法到上线，一个人就是一支产品团队。

<div align="center">

**[🎨 Interactive Showcase](https://istarwyh.github.io/cc4pm/)** — 可视化了解四大核心模块、200+ Skills、完整产品工作流

</div>

---

## 这是什么

cc4pm 是一套面向**产品主理人**的 AI 全生命周期产品系统。基于 Claude Code 插件体系，整合了 200+ Skills、18 个 AI 代理、48 个命令，覆盖从灵感验证到产品上线发布的完整链路。

不是配置集合，而是一套完整的产品方法论 + 工程工具链：

- **BMM**（业务建模）— 市场研究、PRD 创建、需求拆解、冲刺规划
- **CIS**（创意智能）— 36 种创意技巧、30 种创新框架、故事讲述
- **WDS**（设计系统）— 用户心理映射、UX 场景、设计规范、原型
- **工程工具链** — TDD、代码审查、E2E 测试、安全扫描、CI/CD

前身是 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)（Anthropic 黑客马拉松获奖项目，50K+ Stars），cc4pm 在其工程基础上增加了产品方法论层，将工具升级为系统。

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/istarwyh/cc4pm.git
cd cc4pm

# 在 Claude Code 中直接使用
claude
```

所有 skills、agents、commands、hooks 会被自动加载。

### 核心命令速览

| 命令 | 用途 |
|------|------|
| `/bmad-brainstorming` | 头脑风暴，36 种创意技巧 |
| `/bmad-create-prd` | AI 辅助创建 PRD |
| `/bmad-market-research` | 市场研究与竞争分析 |
| `/bmad-sprint-planning` | 冲刺规划与进度追踪 |
| `/plan` | 技术实现规划 |
| `/tdd` | 测试驱动开发 |
| `/code-review` | 代码质量审查 |
| `/e2e` | 端到端测试 |
| `/cc4pm-guide` | 交互式教学（26 节课） |

---

## 四大核心模块

### BMM — 业务建模方法

端到端产品开发工作流。8 个角色代理（分析师、PM、架构师、开发者、QA、敏捷大师、UX 设计师、快速开发者），33 个工作流覆盖分析→规划→方案→实现全阶段。

**典型流程**：市场研究 → 产品简报 → PRD → 架构设计 → 需求拆解 → 冲刺规划 → 开发交付

### CIS — 创意智能战略

5 个创意代理（头脑风暴教练、创新战略家、设计思维教练、问题解决专家、故事讲述大师），36 种创意技巧分 7 大类，30 种创新框架。

**典型流程**：头脑风暴 100+ 想法 → 蓝海分析 → 商业模式设计 → 产品叙事

### WDS — Web 设计系统

从用户心理驱动产品设计。2 个设计代理（Saga 故事女神、Freya UX 设计师），8 阶段设计方法。

**核心能力**：Trigger Map（用户心理→功能映射）→ UX 场景 → 设计规范 → 原型 → 设计系统

### 工程工具链

18 个工程代理，48 个命令，46 条规则，支持 8 种语言（TypeScript、Python、Go、Swift、Kotlin、PHP、Perl、C++）。

**核心能力**：/plan 规划 → /tdd 开发 → /e2e 测试 → /code-review 审查 → /build-fix 修复

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
开发 ─── /plan → /tdd → /code-review
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
├── _bmad/              四大方法论模块（BMM/CIS/WDS/Core）
├── agents/             18 个工程代理
├── commands/           48 个斜杠命令
├── skills/             94 个工程技能
├── hooks/              事件驱动自动化
├── rules/              46 条编码准则（通用 + 7 种语言）
├── .claude/skills/     BMAD 技能（100+ 产品/设计/创意技能）
├── docs/               文档 + Showcase
├── scripts/            安装、钩子、CI 脚本
└── tests/              测试套件
```

---

## 致谢

cc4pm 基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 构建，感谢原作者 [Affaan Mustafa](https://x.com/affaanmustafa) 和所有贡献者。

---

## License

MIT
