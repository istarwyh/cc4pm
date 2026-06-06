---
name: knowledge-wechat-writer
description: "Research-backed WeChat article generator that uses the current project/repo as the primary knowledge base, then invokes/follows wechat-article to save .wechat.html. Use this when the user asks for a 微信公众号文章/公众号推文 and explicitly wants project knowledge, current repo/course materials, lessons/skills/commands/rules/agents/docs, local knowledge-base retrieval, material-pack synthesis, official external sources, reader review, or ~/wechat-exports output. Do not use for simple Markdown/HTML-to-WeChat conversion or generic WeChat formatting; use wechat-article for those."
origin: cc4pm
---

# Knowledge WeChat Writer

Turn a topic into a research-backed WeChat Official Account article using the current project as the primary knowledge base, then hand the draft to `wechat-article` for WeChat-compatible visual output.

Use this skill for article production, not for simple summaries. The expected result is a ready-to-paste `.wechat.html` file in `~/wechat-exports/`.

## Operating Principle

The article should feel like a real operator sharing hard-earned experience, not a tool manual. The research exists to give the article judgment, examples, install paths, verification steps, and believable details. The final HTML belongs to `wechat-article`; this skill owns the upstream research and synthesis.

## Inputs to Extract

From the user request, extract:

- **Topic** — the article's subject.
- **Target readers** — default to 产品主理人、独立开发者、长期使用 Claude Code 做真实项目的人 when unspecified.
- **Article goal** — what readers should understand or be able to do after reading.
- **Output constraints** — default to `.wechat.html` saved under `~/wechat-exports/`.
- **Required sources** — local repo first; external official sources only when needed.

If the user gave enough detail, do not ask confirmation. If one critical input is missing, infer a reasonable default and proceed.

## Workflow

### 1. Search the project knowledge base first

Search broadly before writing. Cover these source families when present:

- `guide/` lessons and `course-map.yaml`
- `.claude/skills/**/SKILL.md`
- `.claude/commands/*.md`
- `.claude/rules/**/*.md`
- `.claude/agents/*.md`
- `docs/`, `examples/`, `scripts/`, README/CLAUDE/AGENTS files
- QMD collections if available: `cc4pm-lessons`, `cc4pm-skills`, `cc4pm-commands`, `cc4pm-rules`, `cc4pm-agents`, `cc4pm-docs`

Do not only search the topic words. Expand into:

- adjacent concepts and underlying mechanisms
- commands, configuration, environment variables, hooks, skills, agents
- failure modes, verification steps, install paths
- reusable assets: prompts, commands, config snippets, checklists, tables
- logic worth visualizing: process, lifecycle, architecture, contrast, loop, decision tree

When QMD is available, use mixed queries:

```text
lex: exact terms, commands, variable names, file names
vec: semantic intent and failure scenarios
hyde: what a useful answer would look like, when recall is weak
```

Always include `intent` in QMD calls so snippets are disambiguated.

### 2. Add external sources only when the topic needs it

Use external research when the topic mentions a tool, plugin, SDK, model, API, Claude Code feature, or current documentation detail that could change. If the `web-access` skill is available and the task requires live web access, invoke it before direct web tooling so browsing follows the user's configured web workflow.

Prioritize:

1. Official docs
2. GitHub README / release notes / source code
3. Vendor docs or primary references
4. Reputable secondary writing only if no primary source exists

Do not invent install commands, config keys, limits, or behavior. If official docs disagree with local lessons, trust the current official source and mention version/context if useful.

### 3. Build a material pack before drafting

Organize findings into this internal pack:

```text
核心判断：3-6 条，必须能支撑文章主张
可复制资产：prompt、命令、配置、表格、清单
工具使用路径：安装、启用、触发、路线选择
验证方式：如何知道成功了，输出在哪里
常见坑：失败时先查什么
适合画图：流程、架构、对比、循环、隐喻
事实来源：本地文件 / 官方链接 / README
```

Keep the pack concise. It is for synthesis, not a second article.

### 4. Draft the article around reader outcomes

Title and structure should start from what the reader wants to achieve, not from the tool name.

For tool/workflow articles, naturally cover:

- how to install or how to ask Claude Code to install
- how to refresh or confirm the tool appears
- how to trigger it, with natural-language examples first
- how to choose between routes/providers/modes
- where output lands and how to verify success
- first checks for common failures

Use local project concepts as evidence, not as a catalog. Avoid turning the article into a directory tour.

### 5. Invoke or follow `wechat-article`

Before final formatting, invoke the current `wechat-article` skill if the Skill tool is available. Treat `wechat-article` as the source of truth for WeChat-compatible HTML, visual style, SVG rules, reader review, compliance wording, and final validation.

Pass it a compact handoff packet:

- topic, target reader, article goal
- material pack summary and source notes
- draft structure or draft body
- visual logic candidates
- tool-use requirements that must appear in the article
- final output path requirement: `~/wechat-exports/*.wechat.html`

If `wechat-article` is already loaded or Skill invocation is unavailable, read/follow the installed `wechat-article` instructions rather than maintaining a separate formatting checklist here. This avoids drift when the WeChat style guide changes.

### 6. Reader review loop

After the draft HTML exists, spawn 1-3 target-reader subAgents. At least one should answer: “Can I use this after reading?”

Ask them to check:

- install/use/route/verify/failure handling
- confusing terms or missing proof
- weak assets or missing copy-paste blocks
- AI-ish, marketing-ish, slogan-like lines
- whether the article is worth forwarding, and to whom

Only adopt feedback that improves clarity, trust, usability, or reader value. Do not dilute the article's main judgment just to please every reader.

### 7. Final validation

Run the `wechat-article` validation checks before delivery:

- platform compliance terms grep
- sentence-pattern / AI-tell grep
- marketing-superlative grep
- abstract-ending grep
- SVG count and animation tag count
- forbidden wrapper/style/class check
- `<mp-style-type>` marker check

If a grep hit is a required technical literal such as a command, env var, package name, or log output, preserve it and mention that in the delivery note. Otherwise rewrite.

## Output

Return:

```text
已保存：~/wechat-exports/<slug>.wechat.html
已完成：研究来源范围、读者审稿、自检项
采纳的读者意见：3-5 条
保留的技术字面量例外：如有
Sources: 官方链接和必要本地来源摘要
```

Keep the final chat response short. The article file is the deliverable.

## Good Trigger Examples

- “围绕 Claude Code 上下文管理写一篇公众号文章，先从 cc4pm 知识库检索，最后保存 .wechat.html。”
- “我要写公众号，主题是 Agent Teams，目标读者是产品主理人，要求图文并茂、能照着用。”
- “把这个仓库里的 Hooks/Rules 方法论写成一篇读者喜欢的微信长文，必要时查官方文档。”
- “请根据项目 lessons、skills、commands 里的素材，产出一篇微信公众号文章。”

## Anti-Patterns

- Do not write the article before searching the repo.
- Do not rely on topic-word search only.
- Do not cite external blogs when official docs are available.
- Do not output Markdown as the final deliverable when the user asked for WeChat.
- Do not skip reader review for tool/workflow articles.
- Do not create a separate FAQ section; integrate reader doubts into the relevant paragraphs.
