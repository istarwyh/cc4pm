# Graph Report - /Users/mac/Desktop/code-open/cc4pm/guide  (2026-05-01)

## Corpus Check
- 58 files · ~68,344 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 90 nodes · 53 edges · 40 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_PM Workflow (PRD)|PM Workflow (PRD)]]
- [[_COMMUNITY_Design Agents (FreyaSaga)|Design Agents (Freya/Saga)]]
- [[_COMMUNITY_Context Management|Context Management]]
- [[_COMMUNITY_Agent Loop & System Prompt|Agent Loop & System Prompt]]
- [[_COMMUNITY_UX Trigger Mapping|UX Trigger Mapping]]
- [[_COMMUNITY_Innovation & Brainstorming|Innovation & Brainstorming]]
- [[_COMMUNITY_Eval-Driven Development|Eval-Driven Development]]
- [[_COMMUNITY_Quality Gate & Hooks|Quality Gate & Hooks]]
- [[_COMMUNITY_Knowledge Systems (WikiQMD)|Knowledge Systems (Wiki/QMD)]]
- [[_COMMUNITY_Research (Domain & Tech)|Research (Domain & Tech)]]
- [[_COMMUNITY_Emotion Vectors (Chinese)|Emotion Vectors (Chinese)]]
- [[_COMMUNITY_CLI Proxy API|CLI Proxy API]]
- [[_COMMUNITY_Engineering Collaboration|Engineering Collaboration]]
- [[_COMMUNITY_Testing (TDD & E2E)|Testing (TDD & E2E)]]
- [[_COMMUNITY_Learning & Skill Creation|Learning & Skill Creation]]
- [[_COMMUNITY_Memory System|Memory System]]
- [[_COMMUNITY_Emotional Vectors (English)|Emotional Vectors (English)]]
- [[_COMMUNITY_Design Agent Workflow|Design Agent Workflow]]
- [[_COMMUNITY_React Prototyping|React Prototyping]]
- [[_COMMUNITY_UI Patterns|UI Patterns]]
- [[_COMMUNITY_Cattle vs Pets|Cattle vs Pets]]
- [[_COMMUNITY_Fork Verifier Agent|Fork Verifier Agent]]
- [[_COMMUNITY_Mentioned Elements|Mentioned Elements]]
- [[_COMMUNITY_Harness Audit|Harness Audit]]
- [[_COMMUNITY_Autonomous Loops|Autonomous Loops]]
- [[_COMMUNITY_HelixVerify|HelixVerify]]
- [[_COMMUNITY_Supervisor|Supervisor]]
- [[_COMMUNITY_MCP Integration|MCP Integration]]
- [[_COMMUNITY_Draw.io Integration|Draw.io Integration]]
- [[_COMMUNITY_SKILL.md Format|SKILL.md Format]]
- [[_COMMUNITY_Status Line|Status Line]]
- [[_COMMUNITY_Session Management|Session Management]]
- [[_COMMUNITY_Keyboard Shortcuts|Keyboard Shortcuts]]
- [[_COMMUNITY_tmux Integration|tmux Integration]]
- [[_COMMUNITY_Git Worktree|Git Worktree]]
- [[_COMMUNITY_Prompt Precision|Prompt Precision]]
- [[_COMMUNITY_Commands vs Skills|Commands vs Skills]]
- [[_COMMUNITY_Skill Anatomy|Skill Anatomy]]
- [[_COMMUNITY_Agent Teams|Agent Teams]]
- [[_COMMUNITY_Installation & Setup|Installation & Setup]]

## God Nodes (most connected - your core abstractions)
1. `John (PM 代理)` - 5 edges
2. `Bob (敏捷大师)` - 5 edges
3. `[CE] 创建 Epics 和 Stories 工作流` - 4 edges
4. `Context Window` - 4 edges
5. `cc4pm` - 3 edges
6. `CIS (Creative Intelligence Strategy)` - 3 edges
7. `WDS (Web Design System)` - 3 edges
8. `Trigger Map` - 3 edges
9. `[CP] 创建 PRD 工作流` - 3 edges
10. `Mary (分析师)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CIS (Creative Intelligence Strategy)` --conceptually_related_to--> `Sophia Agent`  [INFERRED]
  guide/_resources/understanding-map.md → guide/lessons/stage-3/lesson-4.md
- `CIS (Creative Intelligence Strategy)` --conceptually_related_to--> `Caravaggio Agent`  [INFERRED]
  guide/_resources/understanding-map.md → guide/lessons/stage-3/lesson-4.md
- `WDS (Web Design System)` --conceptually_related_to--> `Saga Agent`  [INFERRED]
  guide/_resources/understanding-map.md → guide/lessons/stage-3/lesson-1.md
- `WDS (Web Design System)` --conceptually_related_to--> `Freya Agent`  [INFERRED]
  guide/_resources/understanding-map.md → guide/lessons/stage-3/lesson-1.md
- `Eval-Driven Development (EDD)` --conceptually_related_to--> `Generator-Evaluator Separation`  [INFERRED]
  guide/lessons/stage-4/lesson-22.1.md → guide/lessons/stage-4/lesson-3.1.md

## Hyperedges (group relationships)
- **WDS Pipeline Components** — lesson_1_saga, lesson_1_freya, lesson_2_trigger_map, lesson_3_ux_scenario [INFERRED 0.85]
- **Engineering Collaboration Tools** — lesson_1_planner_agent, lesson_2_tdd_workflow, lesson_3_hooks_system, lesson_3_rules_system, lesson_3_quality_gate [INFERRED 0.85]
- **BMM 核心代理团队** — lesson_14_john, lesson_13_mary, lesson_16_bob [INFERRED 0.90]
- **CIS 核心代理团队** — lesson_11_carson, lesson_12_victor [INFERRED 0.90]
- **Context Management Strategies** — lesson_2_context_window, lesson_2_compact_command, lesson_2_clear_command, lesson_3_context_command, lesson_7_subagents [INFERRED 0.90]
- **Claude Code Extension System** — lesson_5_claude_md, lesson_8_rules, lesson_6_commands_vs_skills, lesson_7_subagents, lesson_8_hooks [INFERRED 0.90]

## Communities

### Community 0 - "PM Workflow (PRD)"
Cohesion: 0.18
Nodes (13): [MR] 市场研究, [CP] 创建 PRD 工作流, [EP] 编辑 PRD 工作流, John (PM 代理), [VP] 验证 PRD 工作流, [CE] 创建 Epics 和 Stories 工作流, [IR] 实现就绪检查, Bob (敏捷大师) (+5 more)

### Community 1 - "Design Agents (Freya/Saga)"
Cohesion: 0.25
Nodes (8): Freya Agent, Saga Agent, Caravaggio Agent, Sophia Agent, BMM (Business Modeling Method), cc4pm, CIS (Creative Intelligence Strategy), WDS (Web Design System)

### Community 2 - "Context Management"
Cohesion: 0.33
Nodes (6): Plan Mode, /clear Command, /compact Command, Context Window, /context Command, Subagents (子代理机制)

### Community 3 - "Agent Loop & System Prompt"
Cohesion: 0.4
Nodes (5): Agent Loop 11 Steps, System Prompt Assembly, CLAUDE.md, Hooks System, Rules System

### Community 4 - "UX Trigger Mapping"
Cohesion: 0.5
Nodes (4): Negative Drivers, Positive Drivers, Trigger Map, UX Scenario Outline

### Community 5 - "Innovation & Brainstorming"
Cohesion: 0.5
Nodes (4): 36种创意技巧, Carson (头脑风暴教练), 30种创新框架, Victor (创新战略家)

### Community 6 - "Eval-Driven Development"
Cohesion: 0.67
Nodes (3): Eval-Driven Development (EDD), Generator-Evaluator Separation, Harness Engineering

### Community 7 - "Quality Gate & Hooks"
Cohesion: 0.67
Nodes (3): Hooks System, Quality Gate, Rules System

### Community 8 - "Knowledge Systems (Wiki/QMD)"
Cohesion: 0.67
Nodes (3): Agentic 知识库 (LLM Wiki), QMD (Query Markup Documents), graphify 知识图谱

### Community 9 - "Research (Domain & Tech)"
Cohesion: 0.67
Nodes (3): [DR] 领域研究, Mary (分析师), [TR] 技术研究

### Community 10 - "Emotion Vectors (Chinese)"
Cohesion: 0.67
Nodes (3): 情绪向量 (Emotion Vectors), 压力光谱 (13种味道), 三条红线 (底线型约束)

### Community 11 - "CLI Proxy API"
Cohesion: 1.0
Nodes (2): CLIProxyAPI, Gemini CLI OAuth

### Community 12 - "Engineering Collaboration"
Cohesion: 1.0
Nodes (2): Engineering Collaboration, Planner Agent

### Community 13 - "Testing (TDD & E2E)"
Cohesion: 1.0
Nodes (2): E2E Testing, TDD Workflow

### Community 14 - "Learning & Skill Creation"
Cohesion: 1.0
Nodes (2): /learn 持续学习, /skill-create 提取模式

### Community 15 - "Memory System"
Cohesion: 1.0
Nodes (2): /memory Command, MEMORY.md

### Community 16 - "Emotional Vectors (English)"
Cohesion: 1.0
Nodes (2): Emotion concepts and their function in a large language model, Emotional Vectors

### Community 17 - "Design Agent Workflow"
Cohesion: 1.0
Nodes (1): Design Agent Workflow

### Community 18 - "React Prototyping"
Cohesion: 1.0
Nodes (1): No-compile React Prototype

### Community 19 - "UI Patterns"
Cohesion: 1.0
Nodes (1): UI Patterns

### Community 20 - "Cattle vs Pets"
Cohesion: 1.0
Nodes (1): Cattle vs Pets

### Community 21 - "Fork Verifier Agent"
Cohesion: 1.0
Nodes (1): fork_verifier_agent

### Community 22 - "Mentioned Elements"
Cohesion: 1.0
Nodes (1): mentioned-element

### Community 23 - "Harness Audit"
Cohesion: 1.0
Nodes (1): harness-audit

### Community 24 - "Autonomous Loops"
Cohesion: 1.0
Nodes (1): Autonomous Loops

### Community 25 - "HelixVerify"
Cohesion: 1.0
Nodes (1): HelixVerify

### Community 26 - "Supervisor"
Cohesion: 1.0
Nodes (1): ccc Supervisor

### Community 27 - "MCP Integration"
Cohesion: 1.0
Nodes (1): MCP 集成

### Community 28 - "Draw.io Integration"
Cohesion: 1.0
Nodes (1): Next AI Draw.io

### Community 29 - "SKILL.md Format"
Cohesion: 1.0
Nodes (1): SKILL.md (交互式软件交付形态)

### Community 30 - "Status Line"
Cohesion: 1.0
Nodes (1): Status Line (状态栏)

### Community 31 - "Session Management"
Cohesion: 1.0
Nodes (1): Session Management (continue, resume, fork)

### Community 32 - "Keyboard Shortcuts"
Cohesion: 1.0
Nodes (1): Keyboard Shortcuts

### Community 33 - "tmux Integration"
Cohesion: 1.0
Nodes (1): tmux Integration

### Community 34 - "Git Worktree"
Cohesion: 1.0
Nodes (1): Git Worktree

### Community 35 - "Prompt Precision"
Cohesion: 1.0
Nodes (1): Prompt Precision Strategies

### Community 36 - "Commands vs Skills"
Cohesion: 1.0
Nodes (1): Commands vs Skills

### Community 37 - "Skill Anatomy"
Cohesion: 1.0
Nodes (1): Skill Anatomy (SKILL.md, scripts, references)

### Community 38 - "Agent Teams"
Cohesion: 1.0
Nodes (1): Agent Teams

### Community 39 - "Installation & Setup"
Cohesion: 1.0
Nodes (1): cc4pm Installation & Setup

## Knowledge Gaps
- **68 isolated node(s):** `BMM (Business Modeling Method)`, `Design Agent Workflow`, `No-compile React Prototype`, `Sophia Agent`, `Caravaggio Agent` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `CLI Proxy API`** (2 nodes): `CLIProxyAPI`, `Gemini CLI OAuth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Engineering Collaboration`** (2 nodes): `Engineering Collaboration`, `Planner Agent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Testing (TDD & E2E)`** (2 nodes): `E2E Testing`, `TDD Workflow`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Learning & Skill Creation`** (2 nodes): `/learn 持续学习`, `/skill-create 提取模式`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Memory System`** (2 nodes): `/memory Command`, `MEMORY.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Emotional Vectors (English)`** (2 nodes): `Emotion concepts and their function in a large language model`, `Emotional Vectors`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Design Agent Workflow`** (1 nodes): `Design Agent Workflow`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Prototyping`** (1 nodes): `No-compile React Prototype`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Patterns`** (1 nodes): `UI Patterns`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cattle vs Pets`** (1 nodes): `Cattle vs Pets`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Fork Verifier Agent`** (1 nodes): `fork_verifier_agent`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mentioned Elements`** (1 nodes): `mentioned-element`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Harness Audit`** (1 nodes): `harness-audit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Autonomous Loops`** (1 nodes): `Autonomous Loops`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HelixVerify`** (1 nodes): `HelixVerify`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supervisor`** (1 nodes): `ccc Supervisor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MCP Integration`** (1 nodes): `MCP 集成`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Draw.io Integration`** (1 nodes): `Next AI Draw.io`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SKILL.md Format`** (1 nodes): `SKILL.md (交互式软件交付形态)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Status Line`** (1 nodes): `Status Line (状态栏)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Session Management`** (1 nodes): `Session Management (continue, resume, fork)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Keyboard Shortcuts`** (1 nodes): `Keyboard Shortcuts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `tmux Integration`** (1 nodes): `tmux Integration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Git Worktree`** (1 nodes): `Git Worktree`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prompt Precision`** (1 nodes): `Prompt Precision Strategies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Commands vs Skills`** (1 nodes): `Commands vs Skills`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skill Anatomy`** (1 nodes): `Skill Anatomy (SKILL.md, scripts, references)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Teams`** (1 nodes): `Agent Teams`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Installation & Setup`** (1 nodes): `cc4pm Installation & Setup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `BMM (Business Modeling Method)`, `Design Agent Workflow`, `No-compile React Prototype` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._