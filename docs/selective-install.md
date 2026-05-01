# Selective Install System

cc4pm ships a CLI tool (`cc4pm`) that selectively installs agents, rules, skills, hooks, and commands into Claude Code, Cursor, Antigravity, Codex, and OpenCode environments. Instead of cloning the entire repo, users pick what they need via profiles, modules, or components.

## Quick Start

```bash
# Install TypeScript rules into ~/.claude/rules/
npx cc4pm typescript

# Install a preset profile
npx cc4pm install --profile developer --target claude

# Preview without copying
npx cc4pm install --profile full --dry-run
```

## Architecture Overview

```
cc4pm.js (CLI dispatcher)
  └─ install-apply.js (orchestrator)
       ├─ request.js       — parse CLI args, decide legacy vs manifest mode
       ├─ config.js         — optionally load cc4pm-install.json
       ├─ runtime.js        — route to legacy or manifest planner
       ├─ install-executor.js — legacy plan builder (hardcoded copy logic)
       ├─ install-manifests.js — manifest plan builder (declarative JSON)
       ├─ registry.js       — target adapter registry
       ├─ apply.js          — execute copy operations, write state
       └─ install-state.js  — state file creation and validation
```

## Two Install Modes

### Legacy Mode

Triggered by bare language arguments:

```bash
npx cc4pm typescript python go
```

Uses hardcoded copy logic in `install-executor.js`. For `--target claude` (default), copies `rules/common/` and `rules/<language>/` into `~/.claude/rules/`. Supports three targets: `claude`, `cursor`, `antigravity`.

### Manifest Mode

Triggered by `--profile`, `--modules`, `--with`, or `--without` flags:

```bash
npx cc4pm install --profile developer
npx cc4pm install --modules rules-core,agents-core --with lang:typescript
npx cc4pm install --profile core --without capability:database
```

Uses three declarative JSON manifests (see below) and the adapter scaffold system. Supports five targets: `claude`, `cursor`, `antigravity`, `codex`, `opencode`.

**Legacy and manifest modes cannot be mixed.** Passing both language args and `--profile` throws an error.

## Manifest System

### Modules (`manifests/install-modules.json`)

14 modules, each defining:
- `id` — e.g. `rules-core`, `framework-language`, `orchestration`
- `kind` — `rules`, `agents`, `commands`, `hooks`, `platform`, `skills`, `orchestration`
- `paths[]` — source-relative paths to copy (e.g. `rules`, `skills/backend-patterns`)
- `targets[]` — which targets support this module
- `dependencies[]` — module IDs that must be resolved first
- `cost` — `light`, `medium`, `heavy`

Dependency graph (simplified):

```
rules-core ─────────┐
agents-core ────────┤
commands-core ──────┤
hooks-runtime ──────┤
platform-configs ───┤
                    ├─→ framework-language
                    │     (depends on all 5 baseline modules)
workflow-quality ───┤
                    ├─→ security (depends on workflow-quality)
database ───────────┤
orchestration ──────┤
research-apis ──────┤
business-content ───┤
                    ├─→ social-distribution (depends on business-content)
media-generation ───┘
```

### Profiles (`manifests/install-profiles.json`)

| Profile | Modules | Use Case |
|---------|---------|----------|
| `core` | 6 baseline modules | Minimal harness |
| `developer` | core + framework-language, database, orchestration | Default for app developers |
| `security` | core + security | Security-heavy setup |
| `research` | core + research-apis, business-content, social-distribution | Research and content |
| `full` | all 14 modules | Everything |

### Components (`manifests/install-components.json`)

21 user-facing components in 4 families, used with `--with` / `--without`:

- `baseline:*` — rules, agents, commands, hooks, platform, workflow
- `lang:*` — typescript, python, go, java (all resolve to `framework-language` module)
- `framework:*` — react, nextjs, django, springboot (same)
- `capability:*` — database, security, research, content, social, media, orchestration

### Resolution Algorithm

`resolveInstallPlan()` in `install-manifests.js`:

1. Load all three manifests
2. Build `requestedModuleIds` from profile + explicit modules + `--with` component expansion
3. Build `excludedModuleIds` from `--without` component expansion
4. For each requested module, recursively resolve dependencies (depth-first, cycle detection)
5. Skip modules not supported by the target (unless pulled in as a dependency — then throw)
6. Generate scaffold operations via the target adapter

## Target Adapters

Five adapters in `scripts/lib/install-targets/`:

| Adapter | Target | Kind | Root Path | State File |
|---------|--------|------|-----------|------------|
| `claude-home` | `claude` | home | `~/.claude/` | `~/.claude/cc4pm/install-state.json` |
| `cursor-project` | `cursor` | project | `<project>/.cursor/` | `<project>/.cursor/cc4pm-install-state.json` |
| `antigravity-project` | `antigravity` | project | `<project>/.agent/` | `<project>/.agent/cc4pm-install-state.json` |
| `codex-home` | `codex` | home | `~/.codex/` | `~/.codex/cc4pm-install-state.json` |
| `opencode-home` | `opencode` | project | `<project>/.opencode/` | `<project>/.opencode/cc4pm-install-state.json` |

Each adapter implements:
- `resolveRoot(input)` — resolves the target root directory
- `resolveDestinationPath(sourceRelativePath, input)` — maps source path to destination
- `determineStrategy(sourceRelativePath)` — `preserve-relative-path` or `sync-root-children`
- `createScaffoldOperation(moduleId, sourceRelativePath, input)` — creates copy operations

The `sync-root-children` strategy handles a special case: when a module's source path (like `.claude-plugin`) maps directly to the target root itself, files are copied as children of the root rather than into a subdirectory.

## Apply Phase

`applyInstallPlan()` in `install/apply.js`:

```js
for (const operation of plan.operations) {
  fs.mkdirSync(path.dirname(operation.destinationPath), { recursive: true });
  fs.copyFileSync(operation.sourcePath, operation.destinationPath);
}
writeInstallState(plan.installStatePath, plan.statePreview);
```

Simple and direct: create parent dirs, copy files, write state.

## State Tracking

Each install writes a JSON state file (`install-state.json`) that records:

- Schema version, install timestamp
- Target adapter metadata
- Request parameters (profile, modules, components)
- Resolution results (selected/skipped modules)
- Source metadata (repo version, git commit, manifest version)
- Every file operation (source path, destination path, strategy, ownership)

This state file enables the lifecycle commands:

### `cc4pm doctor`

Byte-for-byte comparison of installed files against source repo. Detects:
- Missing or drifted managed files
- Missing source files
- Target root mismatches
- Manifest or repo version drift
- Resolution drift (re-resolving yields different modules)

### `cc4pm repair`

Re-copies missing or drifted files. For manifest mode, re-creates the full plan from the recorded request. For legacy mode, rebuilds operations from the state record.

### `cc4pm uninstall`

Surgically removes only files listed in `operations[]` with `ownership: 'managed'`, then cleans up empty parent directories. Does not remove directories directly.

### `cc4pm list-installed`

Reads all discovered state files across targets and reports what's installed where.

## Config File

Instead of CLI flags, users can create an `cc4pm-install.json`:

```json
{
  "version": 1,
  "target": "claude",
  "profile": "developer",
  "includeComponents": ["lang:typescript"],
  "excludeComponents": ["capability:database"]
}
```

Validated against `schemas/cc4pm-install-config.schema.json` with Ajv.

## Concrete Example

`cc4pm install --profile developer --target claude` resolves to:

| Module | Source Paths | Destination |
|--------|-------------|-------------|
| `rules-core` | `rules/` | `~/.claude/rules/` |
| `agents-core` | `agents/` | `~/.claude/agents/` |
| `commands-core` | `commands/` | `~/.claude/commands/` |
| `hooks-runtime` | `hooks/`, `scripts/hooks/` | `~/.claude/hooks/`, `~/.claude/scripts/hooks/` |
| `platform-configs` | `.claude-plugin/`, `mcp-configs/`, `scripts/setup-package-manager.js` | `~/.claude/.claude-plugin/`, `~/.claude/mcp-configs/`, `~/.claude/scripts/` |
| `framework-language` | 15 skill directories | `~/.claude/skills/backend-patterns/`, etc. |
| `database` | 3 skill directories | `~/.claude/skills/clickhouse-io/`, etc. |
| `workflow-quality` | 7 skill directories | `~/.claude/skills/continuous-learning/`, etc. |
| `orchestration` | specific files + `skills/dmux-workflows` | `~/.claude/commands/multi-workflow.md`, etc. |
