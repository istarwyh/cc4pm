---
title: 安装与维护
description: 查看计划、检查安装状态，以及修复或移除已安装课件。
weight: 30
search_keywords: [安装, 路径, doctor, repair, uninstall, 卸载, 修复, dry-run]
---

## 查看可安装内容

```bash
npx cc4pm plan --list-modules
npx cc4pm install --modules cc4pm-guide --dry-run
```

`--dry-run` 用于查看计划，不执行安装。交互式选择需要终端支持交互；在脚本中显式传入 `--modules`。

## 安装位置

默认目标为 Claude Code，安装内容位于 `~/.claude/`。产品教学模块包含：

- `skills/cc4pm-guide/`：教学入口。
- `guide/`：课程地图和课件。
- `scripts/cc4pm-guide-qmd-check.js`：可选搜索环境检测。

安装状态记录在 `~/.claude/cc4pm/install-state.json`。律师模块安装自己的教学入口和 `verticals/lawyer/` 内容。

## 查看状态与诊断

```bash
npx cc4pm list-installed
npx cc4pm doctor
```

这些命令帮助确认安装状态，以及由 cc4pm 管理的文件是否缺失或发生变化。

## 修复与卸载

先查看相关命令的参数和计划，尤其是在修改过安装文件之后：

```bash
npx cc4pm help repair
npx cc4pm repair --dry-run
npx cc4pm help uninstall
npx cc4pm uninstall --dry-run
```

确认计划符合预期后，再运行相应命令去掉 `--dry-run`。需要保留自己的课件修改时，先将它们存入自己的项目或提交到仓库。

## 安装之后没有出现课程入口

确认当前 Claude Code 使用的用户目录与安装目录一致，检查 `list-installed` 和 `doctor` 的输出，再重新打开教学会话。更多参数以 `npx cc4pm --help` 和各子命令帮助为准。
