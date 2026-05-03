# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cc4pm (Claude Code for Product Makers)** — 为产品主理人打造的 AI 全生命周期产品系统。

cc4pm 不只是工具集合，而是一个完整的**产品主理人 AI 私教系统**，涵盖从创意到上线的全流程。四大核心模块：

- **BMM（Business Modeling Method）** — 业务建模，需求定义与拆解（John、Mary、Bob 代理）
- **CIS（Creative Intelligence Strategy）** — 创意智能，36 种创意技巧 + 30 种创新框架（Sophia、Caravaggio 代理）
- **WDS（Web Design System）** — 设计系统，从用户心理到界面规范（Saga、Freya 代理）
- **工程工具链** — TDD、E2E、代码审查、自动化工作流

本仓库是这套系统的**实现层**：生产级的 agents、skills、hooks、commands、rules 和 MCP 配置。

## Running Tests

```bash
# Run all tests
node tests/run-all.js

# Run individual test files
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

## Architecture

```
cc4pm
├── BMM (Business Modeling Method) → John, Mary, Bob (PM agents)
├── CIS (Creative Intelligence Strategy) → Sophia, Caravaggio (innovation agents)
├── WDS (Web Design System) → Saga, Freya (UX/design agents)
└── 工程工具链 → planner, tdd-guide, code-reviewer, e2e-runner 等
```

实现层的目录结构：

- **agents/** - 专业子代理（planner, code-reviewer, tdd-guide 等 18 个代理）
- **skills/** - 工作流定义与领域知识（含 BMM、CIS、WDS 三大模块的技能）
- **commands/** - 斜杠命令（/tdd, /plan, /e2e 等）
- **hooks/** - 事件驱动的自动化（session 持久化、pre/post-tool hooks）
- **rules/** - 始终遵循的准则（安全、编码风格、测试要求）
- **mcp-configs/** - MCP 服务器配置
- **guide/** - 交互式教学课程（5 阶段，26 节课 + 补充课）
- **scripts/** - 跨平台 Node.js 工具脚本
- **tests/** - 测试套件

## Key Commands

**产品主理人流程（BMM + CIS）：**
- `/bmad-pm` - 产品经理代理（PRD 创建、验证、编辑）
- `/bmad-brainstorming` - 头脑风暴（36 种创意技巧）
- `/bmad-analyst` - 市场研究与领域分析
- `/bmad-create-prd` - AI 辅助创建 PRD
- `/bmad-create-epics-and-stories` - 需求拆解为 Epics 和 Stories
- `/bmad-sprint-planning` - 冲刺规划

**设计系统（WDS）：**
- `/bmad-wds-ux-design` - UX 设计工作流
- `/bmad-wds-design-system` - 设计系统搭建
- `/bmad-wds-wireframes` - 线框图设计

**工程工具链：**
- `/tdd` - 测试驱动开发
- `/plan` - 实现规划
- `/e2e` - 端到端测试
- `/code-review` - 代码审查
- `/build-fix` - 构建修复

**教学与学习：**
- `/cc4pm-guide` - 交互式教学教练
- `/learn` - 从 session 中提取模式
- `/skill-create` - 从 git 历史生成技能

## Development Notes

- Package manager detection: npm, pnpm, yarn, bun (configurable via `CLAUDE_PACKAGE_MANAGER` env var or project config)
- Cross-platform: Windows, macOS, Linux support via Node.js scripts
- Agent format: Markdown with YAML frontmatter (name, description, tools, model)
- Skill format: Markdown with clear sections for when to use, how it works, examples
- Hook format: JSON with matcher conditions and command/notification hooks

## Knowledge Graph (graphify)

The `guide/` directory has been indexed into a knowledge graph at `graphify-out/`. Use it to navigate the curriculum structure and find cross-topic connections.

### Quick Commands

```bash
# Query the graph (BFS - broad context)
/graphify query "How does the PM workflow connect to design agents?"

# Trace a specific path between two concepts
/graphify path "BMM" "TDD Workflow"

# Explain a single node
/graphify explain "Trigger Map"

# Rebuild after guide changes
/graphify guide/
```

### Graph Stats (as of 2026-05-01)
- 90 nodes, 53 edges, 40 communities
- Core hubs: `John (PM 代理)`, `Bob (敏捷大师)`, `Context Window`, `cc4pm`
- `graphify-out/graph.html` - interactive visualization (open in browser)
- `graphify-out/GRAPH_REPORT.md` - full audit report

### Architecture Insight

The graph reveals a hub-and-spoke structure centered on `cc4pm`:

```
cc4pm
├── BMM (Business Modeling Method) → John, Mary, Bob (PM agents)
├── CIS (Creative Intelligence Strategy) → Sophia, Caravaggio (innovation agents)
└── WDS (Web Design System) → Saga, Freya (UX/design agents)
```

Stage 1 lessons (CLI basics) are mostly isolated nodes — they describe standalone concepts (shortcuts, tmux, git worktree) without cross-references to the workflow system.

## Contributing

Follow the formats in CONTRIBUTING.md:
- Agents: Markdown with frontmatter (name, description, tools, model)
- Skills: Clear sections (When to Use, How It Works, Examples)
- Commands: Markdown with description frontmatter
- Hooks: JSON with matcher and hooks array

File naming: lowercase with hyphens (e.g., `python-reviewer.md`, `tdd-workflow.md`)
