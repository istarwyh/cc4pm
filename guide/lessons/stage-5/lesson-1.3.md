# Lesson 24.3: graphify——用知识图谱秒懂任意知识库

## 本课目标

- 理解 graphify 如何把代码、文档、论文、图片、视频统一变成一张可查询的知识图谱
- 掌握 `/graphify` 命令在 Claude Code 中的基本使用
- 学会用「神节点」和社区结构快速定位任意语料的核心概念
- 配置 Always-on Hook，让 Claude 在搜索文件前自动读图谱导航

## 核心内容

### 为什么产品主理人需要知识图谱？

两个典型场景：

**场景一：接手老项目**。你接手一个有 3 年历史的项目，光是看懂目录结构就要两天。你问 Claude："这个登录模块的核心逻辑在哪？" Claude 开始 `grep` 翻文件——搜了 20 个文件，还没找到真正的「为什么」。

**场景二：消化混合语料**。Andrej Karpathy 有一个 `/raw` 文件夹，里面堆着论文 PDF、推文截图、技术博客、手写笔记——他想从里面找到概念之间的联系，但没有任何工具能把这些东西统一理解。

**graphify 是这两个场景的同一个答案**：它一次性把任意文件夹里的内容（代码、文档、图片、视频）的结构关系提取出来，存成知识图谱。之后你每次问 Claude 任何架构或概念问题，Claude 看的是图谱，不是原始文件。

对比效果：
```
传统方式：Claude grep 200 个文件 → 读 40,000 行代码 → 给你答案
graphify：Claude 读一份图谱摘要  → 精准定位 3 个节点 → 给你答案

token 消耗：减少 71.5 倍（官方测试数据）
```

### Step 1：安装 graphify

```bash
# 推荐方式（Mac/Linux，自动处理 PATH）
uv tool install graphifyy && graphify install

# 或者用 pipx
pipx install graphifyy && graphify install

# 安装完成后，Claude Code 会多一个 /graphify 命令
```

> **注意**：PyPI 包名是 `graphifyy`（双 y），CLI 命令是 `graphify`。

### Step 2：构建第一张知识图谱

在你的项目根目录执行：

```bash
/graphify .                    # 对整个项目建图
/graphify ./src --mode deep    # 只对 src 目录，更深度的推断关系
```

执行完毕后，项目里会生成：

```
graphify-out/
├── graph.html          ← 在浏览器里打开，点节点、搜关键词
├── GRAPH_REPORT.md     ← 神节点、社区摘要、推荐提问（一页纸）
├── graph.json          ← 机器可读的图，支持跨 session 持续使用
└── cache/              ← SHA256 缓存，只重处理改动过的文件
```

#### 理解 GRAPH_REPORT.md：你的「项目地图」

GRAPH_REPORT.md 包含三个核心板块：

**1. 神节点（God Nodes）**：连接度最高的概念。在任何大型项目里，真正「枢纽」的类或模块只有 3–5 个，graphify 帮你把它们找出来。

**2. 社区（Communities）**：图谱通过 Leiden 算法自动把代码分组——不是按文件夹，而是按实际调用关系。你可能发现 `auth` 和 `middleware` 其实比 `auth` 和 `user` 关联更紧。

**3. 推荐提问**：系统自动生成 4–5 个这张图谱最适合回答的问题，例如：「DigestAuth 和 Session 之间通过什么连接？」

### Step 3：用图谱回答架构问题

```bash
# 直接在终端查询，不需要打开 Claude
graphify query "auth 流程是怎样的"
graphify query "什么连接了 UserService 和 Cache"
graphify path "LoginController" "Database"    # 两个节点之间的最短路径
graphify explain "SessionManager"              # 某个节点的白话解释
```

> **置信度标签**：图谱里每条关系都带标签：
> - `EXTRACTED`：从代码中直接提取（置信度 1.0）
> - `INFERRED`：合理推断，带置信度分数（0.0–1.0）
> - `AMBIGUOUS`：需要人工确认
>
> 你总能知道哪些是事实、哪些是推断。

### Step 4：让 Claude 自动读图谱（Always-on）

构建完图谱后，运行一次：

```bash
graphify claude install
```

这会做两件事：
1. 在 `CLAUDE.md` 里加一节，告诉 Claude 在回答架构问题前先读 `GRAPH_REPORT.md`
2. 在 `settings.json` 里装一个 `PreToolUse` Hook——每次 Claude 准备搜索文件时，如果图谱存在，自动提醒 Claude 先走图谱导航

效果：你再也不需要手动说「先看图谱」，Claude 会主动用。

### 增量更新：不需要每次全量重建

```bash
graphify update ./src          # 只重处理改动过的文件（代码，无需 LLM）
/graphify . --update           # 文档/图片改了，重新跑语义提取
graphify watch ./src           # 后台监控，代码变动时自动更新图谱
```

### 多模态语料：不只是代码

graphify 能处理的不只是代码文件：

| 类型 | 格式 | 提取方式 |
|------|------|---------|
| 代码 | `.py .ts .go .rs .java` 等 25 种 | AST 静态分析，无需 LLM |
| 文档 | `.md .txt .rst .html` | Claude 提取概念和关系 |
| 论文 | `.pdf` | 引用挖掘 + 概念提取 |
| 图片 | `.png .jpg .webp` | Claude Vision 识别内容 |
| 视频/音频 | `.mp4 .mp3` 等 | Whisper 本地转录 + Claude 提取 |

对产品主理人来说，这意味着你可以把竞品分析截图、用户访谈录音、PRD PDF、代码库，放进同一个图谱里统一查询。

### 团队协作：把图谱提交到 Git

```bash
# 推荐的 .gitignore 配置
graphify-out/cache/        # 本地缓存，不必同步
graphify-out/manifest.json # 基于 mtime，clone 后失效

# 提交（建议）
graphify-out/graph.json
graphify-out/GRAPH_REPORT.md
graphify-out/graph.html
```

一人构建，全团队直接用——不需要每个人都重跑提取。

---

## 实操练习

### 练习 1：对 cc4pm 本身建图

```bash
cd ~/Desktop/code-open/cc4pm   # 或你的 cc4pm 目录
/graphify .
```

1. 打开 `graphify-out/graph.html`，找出 cc4pm 的「神节点」是什么
2. 读 `graphify-out/GRAPH_REPORT.md`，看它推荐你问什么问题
3. 在终端运行：`graphify query "skills 和 agents 是什么关系"`

### 练习 2：配置 Always-on，让 Claude 主动读图谱

```bash
graphify claude install
```

配置完成后，新开一个 Claude Code 会话，问："hooks 系统的核心节点是什么？" 观察 Claude 是否先读图谱再回答。

### 练习 3：增量更新

修改任意一个 `.md` 文件，然后：

```bash
/graphify . --update
```

观察 `graphify-out/GRAPH_REPORT.md` 的变化。

---

## FAQ

**Q：graphify 和 QMD（Lesson 24.1）是什么关系？**

QMD 是文档的「全文 + 语义搜索」——你有问题时主动去搜。graphify 是「预建结构图谱」——在你开始任何查询之前，Claude 已经有了全局地图。两者互补：QMD 找文档，graphify 理解架构。

**Q：建图要花多少 token？**

初次建图：取决于项目规模。代码文件用 AST 解析（不耗 token），文档和图片才调用 Claude。之后每次更新只处理改动的文件，成本大幅下降。

**Q：有比 Claude 更便宜的提取后端吗？**

有。安装 `pip install 'graphifyy[kimi]'` 后设置 `MOONSHOT_API_KEY`，可以用 Kimi K2.6 做语义提取。官方数据：关系提取丰富度提升 3–6 倍，成本降低约 3 倍。

**Q：.graphifyignore 怎么用？**

在项目根目录创建 `.graphifyignore`，语法和 `.gitignore` 一样：

```
node_modules/
dist/
CLAUDE.md       # 防止把 AI 指令本身当知识提取
```

---

## 下一步

- [1] 返回 Lesson 24：高级特性
- [2] 前往 Lesson 25：完整项目实战
- [3] 返回主菜单

---
*阶段 5 | Lesson 24.3/26 | 上一课: Lesson 24.2 - AI 绘图 (Draw.io) | 下一课: Lesson 25 - 完整项目实战*
