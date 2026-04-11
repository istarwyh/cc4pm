# cc4pm

**Claude Code for Product Makers** — AI 驱动的产品全生命周期系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/istarwyh/cc4pm?style=flat)](https://github.com/istarwyh/cc4pm)

> 从想法到上线，一个人就是一支产品团队。

---

<div align="center">

**🌐 Language / 语言**

[English](README.md) | [**简体中文**](README.zh-CN.md)

</div>

---

## 这是什么

cc4pm 是一套面向**产品主理人**的 AI 全生命周期产品系统。基于 Claude Code 插件体系，整合了 200+ Skills、18 个 AI 代理、48 个命令，覆盖从灵感验证到产品上线发布的完整链路。

不是配置集合，而是一套完整的产品方法论 + 工程工具链：

- **BMM**（业务建模）— 市场研究、PRD 创建、需求拆解、冲刺规划
- **CIS**（创意智能）— 36 种创意技巧、30 种创新框架、故事讲述
- **WDS**（设计系统）— 用户心理映射、UX 场景、设计规范、原型
- **工程工具链** — TDD、代码审查、E2E 测试、安全扫描、CI/CD

前身是 [Everything Claude Code](https://github.com/istarwyh/cc4pm)（Anthropic 黑客马拉松获奖项目，50K+ Stars），cc4pm 在其工程基础上增加了产品方法论层，将工具升级为系统。

<div align="center">

**[🎨 可视化 Showcase](https://istarwyh.github.io/cc4pm/)** — 了解四大核心模块、200+ Skills、完整产品工作流

</div>

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

### CIS — 创意智能战略

5 个创意代理（头脑风暴教练、创新战略家、设计思维教练、问题解决专家、故事讲述大师），36 种创意技巧分 7 大类，30 种创新框架。

### WDS — Web 设计系统

从用户心理驱动产品设计。2 个设计代理（Saga 故事女神、Freya UX 设计师），8 阶段设计方法，Trigger Map 用户心理→功能映射。

### 工程工具链

18 个工程代理，48 个命令，46 条规则，支持 8 种语言（TypeScript、Python、Go、Swift、Kotlin、PHP、Perl、C++）。

---

## 产品全生命周期

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

内置 26 节交互式课程，运行 `/cc4pm-guide` 启动。

| 阶段 | 内容 | 时长 |
|------|------|------|
| 1. 基础入门 | Claude Code 核心能力、四大模块全景 | ~30 min |
| 2. 产品核心 | BMM + CIS，头脑风暴到冲刺规划 | ~30 min |
| 3. 设计与心理 | WDS，Trigger Map 到 UX 设计 | ~20 min |
| 4. 工程协作 | TDD、E2E、代码审查、质量门禁 | ~15 min |
| 5. 高级实战 | MCP 集成、完整项目从零到发布 | ~25 min |

---

## 致谢

cc4pm 基于 [cc4pm](https://github.com/istarwyh/cc4pm) 构建，感谢原作者 [Affaan Mustafa](https://x.com/affaanmustafa) 和所有贡献者。

---

## 许可证

MIT
