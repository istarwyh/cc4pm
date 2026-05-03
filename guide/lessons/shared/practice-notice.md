# 实操须知

## 为什么要开新 Session？

课程中的 `/bmad-*`、`/bmad-agent-*` 等命令会启动 Skill 或 Agent，**接管当前对话的上下文**。如果在教学 session 中执行，教学教练角色会被中断，课程进度丢失。

## 正确做法

1. **新开一个 Claude Code session**（终端输入 `claude` 或在新的 tab 中打开）
2. 在新 session 中执行课程里的命令
3. 执行完毕后**回到教学 session** 继续学习

## 什么命令需要新 Session？

所有会启动代理或技能的斜杠命令，包括但不限于：

- `/bmad-brainstorming`、`/bmad-cis-*` — 启动 CIS 创意代理
- `/bmad-pm`、`/bmad-create-*`、`/bmad-validate-*` — 启动 BMM 流程
- `/bmad-sm`、`/bmad-sprint-*` — 启动敏捷大师
- `/bmad-wds-*`、`/bmad-agent-wds-*` — 启动 WDS 设计代理
- `/tdd`、`/e2e`、`/code-review` — 启动工程工具

**不需要新 Session 的**：纯查看类命令（如 `ls`、`cat`）和教学 session 内的对话。
