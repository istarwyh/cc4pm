---
title: 课件与参考工具
description: 了解安装模块包含什么，以及课件中的工具如何使用。
weight: 40
search_keywords: [模块, Skills, Agents, BMM, CIS, WDS, git clone, 参考实现]
---

## 两个教学模块

| 模块 | 用途 | 启动方式 |
| --- | --- | --- |
| `cc4pm-guide` | 产品主理人主线与补充课程 | `/cc4pm-guide` |
| `cc4lawyer-guide` | 使用模拟案例学习行业工作台方法，Beta | `/cc4lawyer-guide` |

课件安装清单以仓库中的 [install-modules.json](https://github.com/istarwyh/cc4pm/blob/main/manifests/install-modules.json) 为准。

## 课件讲解的参考实现

产品课程覆盖四类能力：

- **CIS**：创意发散、创新策略与故事讲述。
- **BMM**：市场研究、需求、PRD、拆解与规划。
- **WDS**：用户心理、UX 场景、设计与表达。
- **工程工具链**：计划、测试、审查、自动化和评估。

这些内容的详细讲解直接查看[产品课程](/courses/product/)。仓库 `.claude/` 与 `_bmad/` 中保存相关参考实现；安装教学模块不会把全部参考实现安装到全局目录。

需要完整参考环境时，按[快速开始](/docs/start/)克隆仓库，在该项目目录中使用 Claude Code。实际可用命令以当前目录中的配置为准。
