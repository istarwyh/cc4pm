# cc4pm

**Claude Code for Product Makers** — 一个人，一支产品团队

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/istarwyh/cc4pm?style=flat)](https://github.com/istarwyh/cc4pm)

> 一个人，一支产研团队。

<div align="center">

![cc4pm 交互式教学体系海报](https://github.com/user-attachments/assets/a018cb79-1315-4016-8853-d1bd37f3bd20)

https://github.com/user-attachments/assets/1098774d-c250-4be1-a2d6-3894be687f66

**[🎨 官网](https://aispeeds.me)** 

</div>

---

## 这是什么

cc4pm 最初是 **Claude Code for Product Makers**：一套面向**产品主理人**的 AI 全生命周期产品系统**交互式课件**。运行 `npx cc4pm install` 走交互式安装，然后在 Claude Code 里输入 `/cc4pm-guide` 即可开始产品主线学习。

基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 和 [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) 构建, 融合了作者的一线实战以及在阿里、蚂蚁、平安等各个团队的[分享经验](https://xiaohui.cool/journey)。

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

cc4pm 内置了一套完整的交互式课程（26 节主线课 + 49 节补充课，5 个阶段）：

```bash
# 启动教学
/cc4pm-guide
```

| 阶段 | 真实课程内容 |
|------|------|
| 1. Claude Code 基础入门 | 代理循环、上下文窗口、CLAUDE.md、命令与技能、Agent、Hooks/Rules、环境搭建与第一次综合实战 |
| 2. 产品主理人核心能力 | CIS 头脑风暴与创新策略，BMM 市场研究、PRD、需求拆解、冲刺规划与路线纠正 |
| 3. 网页设计系统 | WDS 全景、Trigger Map、UX 场景、产品叙事，并扩展 UI 模式、原型、设计系统、风格、品牌资产与演示 |
| 4. 工程工具链 | 计划、测试、代码审查、EDD、视觉校验、编码原则、TDD Prompt、无人评测、Harness、Agent 自举、模型切换与 Goal 模式 |
| 5. 高级应用与持续优化 | MCP、持续学习、插件与 SDK、知识库、AI 绘图、知识图谱、微信远程控制、微信读书、生图 Skill、完整项目实战与课程总结 |

---

欢迎大家共建项目，沉淀 AI 时代从普通人变成超级个体的路径。🚀🚀

## 致谢

cc4pm 初版基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 和 [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) 构建，感谢原作者 [Affaan Mustafa](https://x.com/affaanmustafa) 和所有贡献者。

---

## License

MIT
