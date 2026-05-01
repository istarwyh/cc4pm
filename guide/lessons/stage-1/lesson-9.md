# Lesson 9: 环境搭建：安装与验证

## 本课目标

- 理解 cc4pm 目录结构与 `~/.claude/` 全局配置的映射关系
- 掌握三种使用方式：项目内体验、全局安装、按角色选择性安装
- 成功验证安装，确保命令在你自己的项目中可用
- 知道如何按需选择组件，避免安装不需要的内容

## 核心内容

### 获取 cc4pm

如果你还没有克隆仓库，现在就动手：

```bash
git clone https://github.com/istarwyh/cc4pm.git
cd cc4pm
```

这一步拿到了全部内容——33 个代理、96 个技能、48 个命令、完整的 Rules 和 Hooks。

### 理解目录结构与 ~/.claude/ 的映射

cc4pm 仓库的目录结构和 Claude Code 的全局配置目录 `~/.claude/` 有直接的对应关系：

```
cc4pm/（仓库）                      ~/.claude/（全局配置）
├── rules/
│   ├── common/*              →    ~/.claude/rules/
│   ├── typescript/*           →    ~/.claude/rules/  （按需）
│   ├── python/*               →    ~/.claude/rules/  （按需）
│   └── golang/*               →    ~/.claude/rules/  （按需）
├── commands/*.md              →    ~/.claude/commands/
├── skills/*/SKILL.md          →    ~/.claude/skills/
├── agents/*.md                →    ~/.claude/agents/  （需 v2.1.63+）
└── hooks/hooks.json           →    合并到 settings.json
```

**为什么有这个映射？**

- 在 cc4pm 目录内启动 `claude`：Claude Code 自动读取项目内的配置，一切开箱即用
- 在**你自己的项目**目录内启动 `claude`：需要把 cc4pm 的内容复制到 `~/.claude/` 才能全局生效

### 方式一：在 cc4pm 目录内直接体验（最简单）

这是最快的入门方式，零配置：

```bash
cd cc4pm
claude

# 输入 / 查看所有可用命令
# 你会看到 /plan、/code-review、/bmad-brainstorming 等全部命令
```

**原理**：Claude Code 启动时会自动扫描当前项目的 `.claude/` 目录和项目根目录下的配置。cc4pm 仓库本身就包含了完整的 `.claude/` 配置，所以在项目内一切都已就绪。

**适合场景**：
- 第一次学习和体验 cc4pm
- 了解各个命令和技能的效果
- 暂时不想修改全局配置

**限制**：离开 cc4pm 目录后，这些命令就不可用了。

### 方式二：复制到全局 ~/.claude/ 让所有项目生效

如果你想在**任何项目**中都能使用 cc4pm 的能力，需要把相关内容复制到全局配置目录。

#### 第 1 步：复制通用规则（推荐所有人安装）

```bash
# 创建目录（如果不存在）
mkdir -p ~/.claude/rules

# 复制通用规则——编码风格、安全、测试、Git 规范等
cp -r rules/common/* ~/.claude/rules/
```

这些规则适用于所有编程语言和项目类型，是 cc4pm 的质量基石。

#### 第 2 步：复制你的技术栈规则（按需选择）

```bash
# 前端 / Node.js 开发者
cp -r rules/typescript/* ~/.claude/rules/

# Python 开发者
cp -r rules/python/* ~/.claude/rules/

# Go 开发者
cp -r rules/golang/* ~/.claude/rules/

# Kotlin 开发者
cp -r rules/kotlin/* ~/.claude/rules/

# 可以同时安装多种语言的规则（如果你是全栈开发者）
```

#### 第 3 步：复制斜杠命令

```bash
mkdir -p ~/.claude/commands

# 复制所有命令
cp commands/*.md ~/.claude/commands/
```

这样你在任何项目中都可以使用 `/plan`、`/code-review`、`/bmad-brainstorming` 等命令。

#### 第 4 步：复制核心技能（按需选择）

```bash
mkdir -p ~/.claude/skills

# 推荐先安装核心技能：
cp -r skills/tdd-workflow ~/.claude/skills/
cp -r skills/coding-standards ~/.claude/skills/
cp -r skills/security-review ~/.claude/skills/
cp -r skills/backend-patterns ~/.claude/skills/

# 如果你是产品主理人，还推荐安装 BMM/CIS 相关技能
# （这些技能通过斜杠命令触发，已在 commands/ 中包含）
```

#### 第 5 步：复制代理

```bash
mkdir -p ~/.claude/agents

# 复制所有代理定义
cp agents/*.md ~/.claude/agents/
```

> 注意：自定义代理功能需要 Claude Code v2.1.63 或更高版本。运行 `claude --version` 查看你的版本。

### 方式三：按角色选择性安装

不是每个人都需要全部 96 个技能。以下是按角色推荐的最小安装集：

#### 产品主理人推荐

```bash
# 通用规则
mkdir -p ~/.claude/rules
cp -r rules/common/* ~/.claude/rules/

# 所有命令（包含 BMM/CIS 的斜杠命令）
mkdir -p ~/.claude/commands
cp commands/*.md ~/.claude/commands/
```

产品主理人主要使用的命令：

| 命令 | 用途 |
|------|------|
| `/bmad-brainstorming` | 结构化头脑风暴 |
| `/bmad-create-prd` | 创建产品需求文档 |
| `/bmad-validate-prd` | 验证 PRD 完整性 |
| `/bmad-market-research` | 市场研究和竞争分析 |
| `/bmad-cis-innovation-strategy` | 蓝海分析和创新策略 |
| `/bmad-sprint-planning` | 冲刺规划 |
| `/bmad-cis-storytelling` | 产品叙事和演示 |

#### 开发者推荐

```bash
# 通用规则 + 语言规则
mkdir -p ~/.claude/rules
cp -r rules/common/* ~/.claude/rules/
cp -r rules/typescript/* ~/.claude/rules/   # 按你的语言选择

# 所有命令
mkdir -p ~/.claude/commands
cp commands/*.md ~/.claude/commands/

# 核心技能
mkdir -p ~/.claude/skills
cp -r skills/tdd-workflow ~/.claude/skills/
cp -r skills/coding-standards ~/.claude/skills/
cp -r skills/security-review ~/.claude/skills/

# 所有代理
mkdir -p ~/.claude/agents
cp agents/*.md ~/.claude/agents/
```

开发者主要使用的命令：

| 命令 | 用途 |
|------|------|
| `/plan` | 需求转化为开发计划 |
| `/tdd` | 测试驱动开发流程 |
| `/code-review` | 代码质量审查 |
| `/e2e` | 端到端测试 |
| `/build-fix` | 修复构建错误 |
| `/learn` | 提取会话中的经验模式 |

#### QA 推荐

```bash
# 通用规则
mkdir -p ~/.claude/rules
cp -r rules/common/* ~/.claude/rules/

# 测试相关命令
mkdir -p ~/.claude/commands
cp commands/e2e.md ~/.claude/commands/
cp commands/code-review.md ~/.claude/commands/
cp commands/tdd.md ~/.claude/commands/
```

### 验证安装

安装完成后，验证一切是否正常工作：

```bash
# 进入你自己的项目目录（不是 cc4pm 目录）
cd ~/your-project

# 启动 Claude Code
claude

# 输入 / 查看命令列表
# 如果你能看到 /plan、/code-review 等命令 → 安装成功！
```

**验证清单**：

| 检查项 | 怎么验证 | 预期结果 |
|--------|---------|---------|
| 命令可用 | 在交互模式输入 `/` | 看到 cc4pm 的命令列表 |
| 规则加载 | 问 Claude "你加载了哪些规则？" | 列出 security、testing 等规则 |
| 代理可用 | 运行 `claude agents` | 看到 planner、code-reviewer 等代理 |

### 演示案例：从零安装并验证

完整的安装流程演示：

```bash
# 1. 克隆仓库
git clone https://github.com/istarwyh/cc4pm.git
cd cc4pm

# 2. 选择安装方式（这里用"全局安装核心组件"）
mkdir -p ~/.claude/rules ~/.claude/commands ~/.claude/agents

# 复制通用规则
cp -r rules/common/* ~/.claude/rules/

# 复制命令
cp commands/*.md ~/.claude/commands/

# 复制代理
cp agents/*.md ~/.claude/agents/

# 3. 验证——回到你的项目
cd ~/your-project
claude

# 4. 试一个命令
/plan "给项目添加用户反馈功能"
# 如果看到结构化的规划输出 → 安装成功！
```

### 动手试试

**练习 1：浏览 cc4pm 的目录结构**

```bash
cd cc4pm
claude

"帮我列出 cc4pm 的完整目录结构（只到第二层），
 并标注每个目录包含多少个文件"
```

**练习 2：在 cc4pm 目录内体验**

```bash
cd cc4pm
claude

# 试试输入 /，浏览所有可用命令
# 选一个感兴趣的命令运行
```

**练习 3：安装到全局并验证**

按照上面"方式二"或"方式三"的步骤，把你需要的组件安装到 `~/.claude/`。然后切换到你自己的项目目录，验证命令是否可用。

### 进阶：动态系统提示注入

安装完成后，你可能会发现不同的工作场景需要不同的上下文。与其把所有内容都塞进 CLAUDE.md（每次都加载），不如用 `--system-prompt` 按需注入：

```bash
# 启动时动态注入上下文文件
claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"
```

**实际设置——用 alias 创建不同的工作模式**：

```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

每个 context 文件只包含该模式需要的指令——`dev.md` 关注编码规范和测试要求，`review.md` 关注安全检查和质量标准，`research.md` 关注信息收集和总结格式。

**为什么比放在 CLAUDE.md 好？** 系统提示的权威性高于用户消息，而且不同场景只加载相关上下文，避免无关规则占用上下文窗口。

### 环境变量配置：性能与成本优化

安装目录结构只是第一步。Claude Code 还有一组关键的环境变量，直接影响你的使用成本和体验。把以下配置加入 `~/.zshrc` 或 `~/.bashrc`：

```bash
# ===== Claude Code 推荐环境变量 =====

# 关闭自动更新（避免工作中被打断）
export DISABLE_AUTOUPDATER=1

# 调大输出 token 上限（默认较低，复杂任务容易截断）
export CLAUDE_CODE_MAX_OUTPUT_TOKENS=50000

# 关闭遥测数据上报（减少不必要的网络请求）
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

# 禁用归因信息头（API 中转用户必开，见下方说明）
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
```

配置后记得 `source ~/.zshrc` 使其生效。

#### API 中转用户必读：缓存失效陷阱

如果你通过 API 中转服务（而非直连 Anthropic）使用 Claude Code，`CLAUDE_CODE_ATTRIBUTION_HEADER` 这个配置**极其重要**。

**问题**：Claude Code 默认会在每次请求中附加一个归因标识头（每次内容不同）。直连 Anthropic 时没有问题，但经过中转站时，这个变化的标识会导致**缓存永远命中不了**——你的每一次请求都被当作全新请求计费。

**解决**：一行搞定——

```bash
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
```

**怎么验证缓存是否生效？** 运行 `/cost` 命令，观察是否有 `cache_read` 类型的 token 计数。如果全是 `input` 而没有 `cache_read`，说明缓存没命中，检查这个配置。

> **直连 Anthropic 的用户**：这个变量不影响你，保持默认即可。归因头不会增加额外计费。

### 升级和更新

cc4pm 是一个活跃的开源项目，持续更新中。保持更新的方法：

```bash
cd cc4pm
git pull

# 重新复制更新过的文件到全局配置
cp -r rules/common/* ~/.claude/rules/
cp commands/*.md ~/.claude/commands/
cp agents/*.md ~/.claude/agents/
```

> 提示：如果你修改过 `~/.claude/rules/` 中的规则文件，`cp` 会覆盖你的修改。建议把自定义规则放在单独的文件中，避免被覆盖。

## 常见问题

**Q: 全局安装和项目内安装冲突吗？**

A: 不冲突。Claude Code 的加载优先级是：项目配置 > 全局配置。如果你的项目有自己的 `.claude/rules/`，它会与全局规则合并（项目级优先）。

**Q: 安装后 commands 里的命令看不到怎么办？**

A: 检查以下几点：
1. 确认文件已正确复制到 `~/.claude/commands/`（运行 `ls ~/.claude/commands/`）
2. 确认你在 Claude Code 的交互模式中（不是 print 模式）
3. 尝试退出并重新启动 `claude`

**Q: 我只想用产品主理人相关的功能，需要安装代理吗？**

A: 如果你只使用 BMM/CIS 的斜杠命令（如 `/bmad-brainstorming`、`/bmad-create-prd`），不需要安装 agents/。代理主要是工程团队在子代理模式下使用的。但安装代理也不会有坏处——它们只在被调用时才会消耗资源。

**Q: hooks.json 怎么安装？**

A: Hooks 的安装稍有不同——需要将 hooks.json 的内容合并到你的 `~/.claude/settings.json` 中。如果你是通过 Claude Code 的插件系统安装 cc4pm 的，这个步骤会自动完成。手动安装时，可以让 Claude 帮你合并。

## 相关概念

- **cc4pm Architecture** — 安装后的目录结构映射到 `~/.claude/` 全局配置（agents/、skills/、rules/、hooks/）
- **Commands vs Skills**（Lesson 6）— 安装后命令和技能自动生效
- **Hooks & Rules**（Lesson 8）— 安装后自动化守护规则开始运行

## 下一步

- [1] 进入下一课：Lesson 10 - 综合实战：为 cc4pm 构思新功能
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 1 | Lesson 9/26 (阶段内 9/10) | 上一课: Lesson 8 - Hooks 与 Rules | 下一课: Lesson 10 - 综合实战*
