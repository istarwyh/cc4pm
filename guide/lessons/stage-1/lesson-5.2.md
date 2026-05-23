# Lesson 5.2: 持久上下文运维——让 Claude 真的记得住、用得准

## 本课目标

- 掌握 CLAUDE.md、CLAUDE.local.md、Rules 和 Auto Memory 的加载边界
- 学会用 `/memory` 诊断“Claude 为什么没听我的”
- 理解 Auto Memory 的存储位置、加载上限和清理方式
- 能为个人项目、团队项目和组织级环境选择合适的上下文载体

## 核心内容

### 从“会写”到“会运维”

Lesson 5 教你写 CLAUDE.md，Lesson 5.1 教你分层。真实项目里，还会遇到这些问题：

```text
我写了 CLAUDE.md，Claude 为什么没遵守？
我想给自己留私有规则，应该放哪里？
我有多个 worktree，memory 会不会丢？
团队已有 AGENTS.md，Claude Code 怎么复用？
组织级安全规则靠 CLAUDE.md 还是 settings？
```

这些不是写作问题，而是**上下文运维问题**。你要知道每个文件何时加载、加载多少、谁能看到、能不能被排除。

先记住三条边界：

```text
CLAUDE.md / Rules / Auto Memory 都是上下文，不是硬约束。

需要 Claude 倾向遵守       → CLAUDE.md / Rules / Memory
需要客户端强制执行         → settings / hooks / permissions
需要当前事实准确无误       → 读取代码、文档、Git、Issue
```

### Claude Code 的记忆载体总表

| 载体 | 谁写 | 典型位置 | 共享范围 | 适合内容 |
|------|------|----------|----------|----------|
| Managed CLAUDE.md | 组织 | 系统级目录 | 机器上所有用户 | 公司安全与合规规则 |
| User CLAUDE.md | 你 | `~/.claude/CLAUDE.md` | 你的所有项目 | 个人长期偏好 |
| Project CLAUDE.md | 团队 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 项目成员 | 项目架构、测试命令、红线 |
| CLAUDE.local.md | 你 | 项目目录 | 当前机器 | 私有测试数据、沙盒 URL |
| `.claude/rules/` | 团队或个人 | 项目或用户规则目录 | 取决于位置 | 路径、语言、主题规则 |
| Auto Memory | Claude | `~/.claude/projects/<project>/memory/` | 本机同仓库 worktree | Claude 学到的偏好和线索 |

判断时问四个问题：

```text
要不要提交到 Git？
是否只对我个人成立？
是否必须强制执行？
是否会随代码变化？
```

答案不同，位置就不同。

### CLAUDE.md 的四级作用域

Claude Code 支持从组织到个人的多层 CLAUDE.md。加载顺序从宽到窄，越靠近当前工作目录越晚进入上下文。

| 作用域 | 位置 | 适合场景 |
|--------|------|----------|
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`；Linux/WSL: `/etc/claude-code/CLAUDE.md`；Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | 组织统一下发的安全、合规、数据处理提醒 |
| User | `~/.claude/CLAUDE.md` | 你自己的沟通偏好、常用工具习惯 |
| Project | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享的项目说明 |
| Local | `./CLAUDE.local.md` | 不应提交 Git 的个人项目偏好 |

`CLAUDE.local.md` 适合放私有但不敏感的项目说明：

```markdown
# Local Sandbox

- 我常用的预览地址是 http://localhost:5173
- E2E 调试优先使用 Chrome profile: local-debug
- 测试账号从密码管理器获取，不写入仓库
```

配套动作：

```bash
printf '\nCLAUDE.local.md\n' >> .gitignore
```

如果你在多个 git worktree 之间切换，可以在项目 CLAUDE.md 里导入家目录文件：

```markdown
@~/.claude/my-project-instructions.md
```

### 真实加载顺序

Claude Code 启动时会从当前目录向上查找 `CLAUDE.md` 和 `CLAUDE.local.md`。它不是“最近的覆盖最远的”，而是**全部拼接进上下文**。

```text
在 repo/apps/web/ 启动 claude：

repo/CLAUDE.md
repo/CLAUDE.local.md
repo/apps/CLAUDE.md
repo/apps/CLAUDE.local.md
repo/apps/web/CLAUDE.md
repo/apps/web/CLAUDE.local.md
```

顺序规律：

| 规则 | 含义 |
|------|------|
| 从根到当前目录 | 越具体的目录越晚出现 |
| 同一目录中 local 在后 | `CLAUDE.local.md` 追加在 `CLAUDE.md` 后 |
| 子目录文件按需加载 | 更深层 CLAUDE.md 会在读取相关目录文件时加载 |
| HTML 块注释会被剥离 | `<!-- maintainer notes -->` 不占上下文，代码块内注释保留 |

如果 monorepo 上层 CLAUDE.md 属于别的团队，可以在本地 settings 里排除：

```json
{
  "claudeMdExcludes": [
    "**/monorepo/other-team/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

组织级 managed policy CLAUDE.md 不能被排除。

### `@path` 导入：引用，不复制

CLAUDE.md 可以用 `@path/to/file` 导入其他文件。相对路径按**包含导入语句的文件位置**解析。

```markdown
# Project Context

See @README.md for product overview.
See @package.json for npm scripts.
See @docs/git-workflow.md for release rules.
```

导入适合解决两个问题：

| 问题 | 做法 |
|------|------|
| README、package.json 已有事实，不想复制 | 用 `@README.md`、`@package.json` 引用 |
| 团队已经维护 AGENTS.md | 在 CLAUDE.md 顶部写 `@AGENTS.md`，再补 Claude Code 专属规则 |

递归导入最多五层。首次引用项目外文件时，Claude Code 会请求审批；拒绝后不会自动再弹。

不要把 AGENTS.md 和 CLAUDE.md 互相复制。复制会带来漂移，导入才是单一事实源。

### Rules 的运维细节

`.claude/rules/` 适合把规则拆成多个主题文件：

```text
~/.claude/rules/              # 用户级规则，所有项目先加载
project/.claude/rules/        # 项目级规则，团队共享
project/.claude/rules/**/*.md # 可递归组织子目录
```

无 `paths` frontmatter 的 rule 会在启动时加载：

```markdown
# Security

Never commit `.env` files. If a credential appears in a diff, stop and ask for rotation.
```

带 `paths` 的 rule 只在 Claude 处理匹配文件时加载：

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "tests/api/**/*.ts"
---

API 返回结构变化前，先检查客户端调用方和测试；错误响应必须保持统一 envelope。
```

不要写这种路径规则：

```markdown
---
paths:
  - "**/*"
---
```

这等于失去按需加载意义。短小、全局、所有任务都相关的规则，放 CLAUDE.md 或无 frontmatter rule 更清楚。

### Auto Memory 的真实结构

Auto Memory 是 Claude 自己写给未来会话看的笔记。它默认开启，通常存放在：

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 入口索引，启动时加载前 200 行或前 25KB
├── debugging.md       # 需要时再读取的主题文件
├── api-conventions.md # 需要时再读取的主题文件
└── ...
```

关键限制：

| 规则 | 含义 |
|------|------|
| 只加载 `MEMORY.md` 前 200 行或前 25KB | 超出部分不会自动进上下文 |
| 主题文件不启动加载 | Claude 需要时才读取 |
| 同一 git 仓库共享 memory | 多个 worktree 和子目录会共享同一套 auto memory |
| 本机私有 | 不会随 Git 同步到其他机器 |

你可以用 `/memory` 查看当前会话加载了哪些 CLAUDE.md、Rules、Auto Memory，以及 memory 文件夹在哪里。

常见控制方式：

| 需求 | 做法 |
|------|------|
| 关闭某项目 Auto Memory | 项目 settings: `"autoMemoryEnabled": false` |
| 临时禁用 | `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` |
| 交互式查看和开关 | `/memory` |
| 改存储位置 | user 或 policy settings: `autoMemoryDirectory` |

存储位置不能由项目仓库控制，这是安全设计：不能让克隆下来的仓库把你的 memory 重定向到敏感位置。

### 用 `/memory` 做故障排查

当你觉得“Claude 明明应该知道”时，不要猜，直接查。

#### 场景 1：CLAUDE.md 没生效

```text
/memory
```

检查三件事：

| 检查项 | 可能问题 |
|--------|----------|
| 文件是否在列表里 | 启动目录不对，或文件名/位置不对 |
| 是否有多个冲突规则 | 上层和下层 CLAUDE.md 写了相反要求 |
| 指令是否太抽象 | “格式化好代码”不如“使用 2-space indentation” |

#### 场景 2：规则应该强制执行却被忽略

CLAUDE.md 是上下文，不是硬约束。如果必须在固定时机执行，用 Hook：

```text
每次提交前必须跑 lint         → PreToolUse / Bash hook
每次编辑后自动格式化           → PostToolUse hook
调试加载了哪些指令文件       → InstructionsLoaded hook（专门记录加载来源）
```

> 需要“提醒 Claude”用 CLAUDE.md；需要“无论如何都执行”用 Hook 或 settings。

#### 场景 3：`/compact` 后指令像丢了

项目根目录的 CLAUDE.md 会在压缩后重新注入。子目录 CLAUDE.md 不一定立刻重新注入，它会在 Claude 再次读取那个子目录文件时加载。

如果一条规则只在对话里说过，没有写入 CLAUDE.md、Rules 或 Memory，压缩后就可能消失。

### 组织级：CLAUDE.md 和 settings 的边界

组织可以把统一说明放在 managed CLAUDE.md，也可以把文本直接放进 managed settings 的 `claudeMd` 字段。

| 目标 | 应放位置 |
|------|----------|
| 禁止某些工具或路径 | managed settings 的 permissions |
| 强制 sandbox | managed settings |
| 设置环境变量和 API provider | managed settings |
| 说明公司编码规范 | managed CLAUDE.md |
| 提醒不要泄露客户数据 | managed CLAUDE.md + 必要时 Hook |

一句话：settings 是执行层，CLAUDE.md 是行为引导层。

### 补充：`--add-dir` 与额外目录

`--add-dir` 可以让 Claude 访问主项目外的目录，但默认不会加载那些目录里的 CLAUDE.md。

如果你确实要加载额外目录的说明，需要显式开启：

```bash
CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1 claude --add-dir ../shared-config
```

这会加载额外目录里的 `CLAUDE.md`、`.claude/CLAUDE.md`、`.claude/rules/*.md` 和 `CLAUDE.local.md`。只有在共享配置目录可信时才这样做。

## 演示案例：给产品团队设计上下文运维方案

假设你有三人小团队：你负责需求和验收，前端同事负责 React，后端同事负责 API 和数据库；大家都用 Claude Code，也有人用 Cursor / Codex。

推荐结构：

| 文件 | 放什么 |
|------|--------|
| `AGENTS.md` | 所有 Agent 工具共享：项目目标、安全红线、测试命令 |
| `CLAUDE.md` | Claude Code 专属：`/cc4pm-guide`、hooks、skills、常用命令 |
| `CLAUDE.local.md` | 你的本地沙盒说明，必须 gitignore |
| `.claude/rules/api-contract.md` | `paths: src/api/**, tests/api/**` 的 API 契约规则 |
| `.claude/rules/frontend.md` | `paths: src/**/*.tsx` 的前端规则 |
| `docs/adr/` | 正式架构决策，不放 Memory |

`CLAUDE.md` 可以导入 `@AGENTS.md`，再补 Claude Code 专属规则；Auto Memory 只记偏好和历史原因，不记当前 API 字段、token 或临时 bug 进度。

## 动手试试

### 练习 1：检查当前会话加载了什么

运行 `/memory`，记录当前加载了哪些 CLAUDE.md、有没有 CLAUDE.local.md、Auto Memory 是否开启。如果文件没出现，先检查当前工作目录，再检查文件名和所在层级。

### 练习 2：把 AGENTS.md 作为单一事实源

如果项目已有 AGENTS.md，在 CLAUDE.md 顶部导入 `@AGENTS.md`，再补 Claude Code 专属说明。然后运行 `/memory`，确认导入后的项目规则已经进入上下文。

### 练习 3：清理 Auto Memory

让 Claude 只报告可能过期、包含临时任务状态、或不应长期保存的 memory 条目；先审查报告，再决定是否删除。

## 常见问题

**Q: CLAUDE.md 写了 IMPORTANT，为什么 Claude 还是偶尔没遵守？**

A: CLAUDE.md 是上下文，不是强制执行层。必须执行的检查要写成 Hook、permission 或 settings。

**Q: Auto Memory 会不会把我的秘密写进去？**

A: 不应该把密钥、token、账号密码写入 Memory。发现敏感信息进入 memory 后，删除它，并按安全流程轮换凭证。

**Q: CLAUDE.local.md 和 Auto Memory 有什么区别？**

A: CLAUDE.local.md 是你手写的本项目私有说明，结构可控；Auto Memory 是 Claude 自己积累的长期笔记，适合偏好、线索和历史原因。

**Q: Rules 和 Skills 怎么选？**

A: 规则类约束放 Rules，任务型流程放 Skills。比如“API 文件必须验证输入”是 Rule；“生成市场研究报告的完整步骤”是 Skill。

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 6 - 命令与技能系统
- 返回主菜单
- 退出学习

---
*阶段 1 | Lesson 5.2/26 | 上一课: Lesson 5.1 - 上下文治理分层 | 下一课: Lesson 6 - 命令与技能*
