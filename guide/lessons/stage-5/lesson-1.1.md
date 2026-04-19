# Lesson 24.1: Agentic 知识库——产品主理人的「外挂大脑」

## 本课目标

- 理解从「被动 RAG」到「主动知识编译」的思维转换
- 掌握如何利用 Agent 维护一个永不过时的项目 Wiki
- 学习如何在 Obsidian 中可视化项目知识图谱

## 核心内容

### 为什么你需要「Agentic 知识库」？

作为产品主理人，你是否遇到过：
- 需求文档（PRD）是半年前的，代码已经是 3.0 版了，文档彻底失效。
- 新人入职，问你：“这个登录模块的逻辑是怎么设计的？”你得去翻 Git 提交记录。
- 你有一个关于产品未来方向的灵感，却找不到半年前讨论时的背景资料。

**Agentic 知识库（LLM Wiki）** 就是要把 AI 变成一个「永不疲倦的文档官」，让你的项目知识保持实时在线。

> **深度参考**：[Agentic Knowledge Base 技术架构与三层模型](../../../../../docs/wiki/agentic-knowledge-base.md)

### 思维转换：从 RAG 到知识编译

| 模式 | RAG (传统) | Agentic Wiki (新) |
|------|-----------|------------------|
| **本质** | 临时翻书 | 主动编写百科全书 |
| **状态** | 碎片、孤立 | 互联、结构化 |
| **价值** | 解决当下提问 | 积累项目资产 |

### 知识循环：产品主理人的三板斧

1.  **灌入 (Ingest)**：当你写完一份调研笔记，让 Agent 把它「编译」进项目。它会自动更新相关的需求页、技术实现页。
2.  **提问 (Query)**：当你需要决策时，问你的 Wiki。它能给出带引用的全景分析。
3.  **巡检 (Inspect)**：让 Agent 每天跑一次巡检，发现你文档里的逻辑漏洞。

### 工具选型：Obsidian 是你的 IDE

在 cc4pm 的世界里，**Obsidian 不只是笔记软件，它是项目管理的仪表盘**。利用它的图谱视图，你可以直观地看到：
- 需求节点是如何连接到功能模块的。
- 哪部分知识还没有被 AI 充分理解（孤立节点）。

### QMD——本地优先的文档搜索引擎

上面介绍了 Ingest（灌入）和 Inspect（巡检），但**最高频的操作其实是 Query（查询）**：你有几百篇 Markdown 笔记、会议记录、技术文档，想找某个内容时只能用文件名硬搜。

[QMD（Query Markup Documents）](https://github.com/tobi/qmd) 由 Shopify CEO Tobias Lutke 开发，是一个**完全本地运行**的 Markdown 搜索引擎。它的核心价值：

```
传统搜索 (grep/Spotlight):
  你搜 “项目时间线” → 文档里写的是 “Q4 规划” → 搜不到

QMD 混合搜索:
  BM25 全文检索（精确匹配）+ 向量语义搜索（理解意图）+ LLM 重排序（精选结果）
  → 即使用词不同，也能找到相关文档
  → 全部在你的设备上运行，文档不上传到任何云端
```

**为什么产品主理人应该关注**：你的会议记录、竞品分析、内部讨论不适合上传到第三方 RAG 服务。QMD 让你在保证隐私的前提下，获得语义级别的搜索能力。

#### 快速上手

```bash
# 安装
npm install -g @tobilu/qmd

# 索引你的笔记目录
qmd collection add ~/notes --name notes
qmd collection add ~/Documents/meetings --name meetings

# 生成向量索引（首次需下载约 2GB 模型，之后缓存）
qmd embed

# 搜索——三种模式
qmd search “认证流程”                         # 关键词搜索（快）
qmd vsearch “用户怎么登录”                     # 语义搜索（理解意图）
qmd query “季度规划会议说了什么” -c meetings    # 混合搜索（推荐）
```

#### 集成到 Claude Code（MCP）

QMD 支持 MCP 协议，配好后 Claude 能直接搜索你的本地文档：

```json
{
  “mcpServers”: {
    “qmd”: {
      “command”: “qmd”,
      “args”: [“mcp”]
    }
  }
}
```

配置完成后，你可以直接问 Claude：”在我的笔记里搜一下关于用户增长的讨论”——Claude 会通过 QMD MCP 在本地文档中进行语义搜索，然后基于搜索结果回答你。

#### QMD vs 其他搜索方案

| 特性 | QMD | grep/Spotlight | 云端 RAG |
|------|-----|---------------|---------|
| 语义理解 | 有 | 无 | 有 |
| 隐私保护 | 本地运行 | 本地运行 | 需上传 |
| API 费用 | 无 | 无 | 有 |
| MCP 集成 | 支持 | 不支持 | 部分 |

> **适用场景**：个人知识库、团队内部文档、会议记录。如果你有大量 Markdown 笔记且在意隐私，QMD 是目前最好的本地搜索选择。注意它目前只支持 Markdown 格式，其他格式需先转换。

#### 与 Agentic 知识库的关系

```
Agentic 知识库的三板斧：
  灌入 (Ingest)  → Agent 把新知识编译进 Wiki    ← LLM Wiki 方法
  提问 (Query)   → 搜索已有知识获取答案          ← QMD 在这里
  巡检 (Inspect) → Agent 定期检查知识的一致性     ← LLM Wiki 方法
```

QMD 和 LLM Wiki 不是竞争关系——它们覆盖知识管理的不同阶段。LLM Wiki 负责「写」（让 AI 维护结构化知识），QMD 负责「搜」（在海量文档中找到你需要的内容）。两者结合，就是一个完整的本地优先知识系统。

---

## 实操练习

### 练习 1：开启你的第一个 LLM Wiki

1.  在项目根目录下创建一个 `research/` 文件夹。
2.  告诉 Claude Code：”请根据 `docs/wiki/agentic-knowledge-base.md` 的架构，为我初始化一个项目研究知识库，并对我们刚才讨论的 Karpathy 观点进行一次 Ingest。”
3.  在 Obsidian 中打开 `research/` 文件夹，查看 AI 生成的第一个实体页面。

### 练习 2：用 QMD 索引你的文档

1.  安装 QMD：`npm install -g @tobilu/qmd`
2.  索引一个 Markdown 目录：`qmd collection add ~/your-notes --name notes && qmd embed`
3.  测试三种搜索：分别用 `qmd search`、`qmd vsearch`、`qmd query` 搜索同一个主题，对比结果差异。
4.  （可选）配置 QMD 的 MCP 集成，让 Claude Code 直接搜索你的本地文档。

---


## 下一步

- [1] 返回 Lesson 24：高级特性
- [2] 前往 Lesson 25：完整项目实战
- [3] 返回主菜单

---
*阶段 5 | Lesson 24.1/26 | 上一课: Lesson 24 - 高级特性 | 下一课: Lesson 25 - 完整项目实战*
