# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cc4pm (Claude Code for Product Makers)** — 面向产品主理人的 AI 全生命周期产品系统**交互式课件**。

`npx cc4pm install --modules cc4pm-guide` 安装后，在 Claude Code 里输入 `/cc4pm-guide` 即可开始 5 阶段、26+ 节课的渐进式学习。课件覆盖四大主题：

- **BMM（Business Modeling Method）** — 业务建模，市场研究→PRD→需求拆解→冲刺规划
- **CIS（Creative Intelligence Strategy）** — 创意智能，36 种创意技巧 + 30 种创新框架
- **WDS（Web Design System）** — 设计系统，用户心理→UX 场景→界面规范
- **工程工具链** — TDD、E2E、代码审查、自动化工作流

仓库同时收录课件讲解的**参考实现**（`.claude/` 下的 175 个 skill、9 个代理、37 个命令、45 条规则），可与课件配合检阅，也可独立 fork 使用。基于 [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) 构建。

## Running Tests

```bash
# 标准 CI 流程：manifest 校验 + 课件同步检查 + 单元测试
npm test

# 仅跑测试套件
node tests/run-all.js

# 单文件
node tests/lib/install-manifests.test.js
node tests/scripts/cc4pm.test.js
```

## Architecture

实际目录结构（与发布到 npm 的 `files` 字段保持一致）：

```
cc4pm/
├── guide/                   课件本体：5 阶段 × 26+ 节课 + course-map.yaml
├── .claude/
│   ├── skills/cc4pm-guide/    交互式教学入口（SKILL.md 驱动整套课程）
│   ├── skills/                175 个参考 skill（bmad-* / 工程 / 内容创作 等）
│   ├── agents/                9 个参考代理（planner, code-reviewer, tdd-guide ...）
│   ├── commands/              37 个参考斜杠命令
│   ├── rules/                 45 条编码规则（common + 7 种语言）
│   ├── hooks/                 事件驱动 hooks 配置
│   └── mcp-configs/           MCP 服务器配置
├── _bmad/                   BMAD METHOD V6 方法论源文档（BMM/CIS/WDS/Core）
├── manifests/               安装清单：install-modules.json（单模块 cc4pm-guide）
├── schemas/                 安装相关 JSON Schema
├── scripts/                 安装器（cc4pm.js / install-*.js / lib/）+ sync-courseware.js
├── tests/                   单元测试（install 库 + 课件同步）
├── docs/                    Showcase 站点源
├── packages/homepage/       @cc4pm/homepage 独立子包
├── examples/                CLAUDE.md / 状态栏配置示例
└── the-{long,short}form-guide.md  课件补充长/短文版
```

## Install Architecture

简化后的安装机制只支持**一条路径**：

```
npx cc4pm install --modules cc4pm-guide [--target claude] [--dry-run]
```

- 唯一模块 `cc4pm-guide` 定义在 `manifests/install-modules.json`，paths 为 `.claude/skills/cc4pm-guide`、`guide`、`scripts/cc4pm-guide-qmd-check.js`
- 唯一 target 为 `claude`，安装到 `~/.claude/`
- 安装状态写入 `~/.claude/cc4pm/install-state.json`
- 配套生命周期命令：`plan` / `list-installed` / `doctor` / `repair` / `uninstall`

## Key Commands

**课件交互（cc4pm-guide 安装后立即可用）：**
- `/cc4pm-guide` - 交互式教学教练

**参考实现里的命令（需要 git clone 整个仓库才能用）：**
- `/bmad-pm` - 产品经理代理（PRD 创建、验证、编辑）
- `/bmad-brainstorming` - 头脑风暴（36 种创意技巧）
- `/bmad-create-prd` - AI 辅助创建 PRD
- `/bmad-wds-ux-design` - UX 设计工作流
- `/plan` - 实现规划
- `/tdd` - 测试驱动开发
- `/code-review` - 代码审查
- `/e2e` - 端到端测试

## Development Notes

- 课件内容修改后运行 `node scripts/sync-courseware.js` 同步 SKILL.md 与 lesson 元数据
- QMD 索引校验：`node scripts/cc4pm-guide-qmd-check.js`
- 跨平台：Windows / macOS / Linux（Node ≥ 18）
- Skill 格式：Markdown + YAML frontmatter；Hook 格式：JSON

## Knowledge Graph (graphify)

`guide/` 目录被索引到 `graphify-out/`，可用于课程导航与跨主题关联：

```bash
/graphify query "PM 工作流如何连接设计代理？"
/graphify path "BMM" "TDD Workflow"
/graphify explain "Trigger Map"
/graphify guide/   # 重建索引
```

`graphify-out/graph.html` 是交互式可视化；`graphify-out/GRAPH_REPORT.md` 是完整审计报告。

## Contributing

参考 CONTRIBUTING.md 中的格式约定。文件命名：小写带连字符（如 `lesson-2.1.md`、`python-reviewer.md`）。
