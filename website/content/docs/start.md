---
title: 快速开始
description: 先阅读一课，再让 Claude Code 结合你的项目带练。
weight: 10
search_keywords: [安装, 入门, npx, install, cc4pm-guide, cc4lawyer-guide]
---

网页上的[课程](/courses/)可以直接阅读。要使用交互式教学，请先准备 Node.js 18 或以上版本，以及能正常使用的 Claude Code。

## 产品主理人课程 {#product}

在终端运行：

```bash
npx cc4pm install
```

交互菜单中选择 `cc4pm-guide`。自动化环境或想跳过选择时，可以显式指定模块：

```bash
npx cc4pm install --modules cc4pm-guide
```

安装完成后，打开 Claude Code，在对话中输入：

```text
/cc4pm-guide
```

教练会了解你的目标，再推荐起点。也可以直接告诉它你在网站上读到的课号和课名，例如“请带我学习 Lesson 1：cc4pm 全景”。

[阅读第一课](/courses/product/stage-1/lesson-1/) · [查看完整课程](/courses/product/)

## cc4Lawyer 课程 {#lawyer}

```bash
npx cc4pm install --modules cc4lawyer-guide
```

然后在 Claude Code 中输入：

```text
/cc4lawyer-guide
```

这是一门处于 Beta 阶段的行业工作台课程，使用模拟合同纠纷讲解方法。请先阅读[课程定位](/courses/lawyer/)，再使用[课堂材料](/courses/lawyer/materials/)。

## 获得完整参考实现

课件会讲解 BMM、CIS、WDS 与工程工具。安装教学模块不代表这些参考 Skills、Agents 和命令全部安装。需要检查或使用仓库参考实现时：

```bash
git clone https://github.com/istarwyh/cc4pm.git
cd cc4pm
claude
```

进入实操前阅读[模块区别](/docs/modules/)与[实操须知](/docs/practice/)。
