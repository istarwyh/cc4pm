---
number: 24.7
title: "微信读书 Skill——把读过的书变成 AI 的私人语料库"
short_title: "微信读书 Skill"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.7: 微信读书 Skill——把读过的书变成 AI 的私人语料库

> **前置课程**：Lesson 6（命令与技能系统）、Lesson 24.3（Agentic 知识库）、Lesson 24.5（graphify）
>
> **预计用时**：20 分钟
>
> **适合人群**：长期使用微信读书的产品主理人、希望让 AI 基于"自己读过的书"做决策与写作的所有人

## 为什么这件事比"操控微信读书"更重要

第一眼看，微信读书 Skill 像是把 App 功能搬到 Claude Code 里——搜书、查书架、看笔记。但它真正被低估的价值是：**让你过去几年读过的每一本书，变成 AI 的可查询语料库**。

公开网络的信息源有三个老问题：SEO 污染、评论区戾气、缺乏结构。微信读书的语料正好补在反面：

| 维度       | 公开网络             | 微信读书               |
|------------|----------------------|------------------------|
| 内容质量   | 噪声大、SEO 污染      | 出版社把关过的书籍     |
| 群体智慧   | 评论戾气重           | 数百万深度读者的划线   |
| 信号密度   | 自己筛选             | 热门划线 = 已投票的精华|
| 结构化     | HTML 散乱            | 章节、段落、想法层级   |

把这些数据接入 Claude，等于给 AI 多了一份**有版权保障的高质量语料**，而且这份语料和你的兴趣高度对齐——你读过的书，就是你思考的延伸。

## 学习目标

- 安装并配置微信读书 Skill，理解 API Key 的鉴权链路
- 掌握 Skill 的"Agent API Gateway"调用模式与 `skill_version` 握手机制
- 学会用「热门划线」捷径快速吸收一本书的精华
- 把微信读书数据和 QMD / graphify 接起来，构建你的个人外脑
- 识别 Skill 的能力边界与该数据源的隐私属性

## 一分钟理解架构

```
你的微信读书账号                你的 Claude Code
（vid 绑定 API Key）                   │
        ▲                              ▼
        │                       /weread-skills 触发
        │              ┌──────────────────────────────┐
        └──────────────│ POST i.weread.qq.com/agent/  │
                       │ Authorization: Bearer wrk-*  │
                       │ {"api_name":"...",            │
                       │  "skill_version":"1.0.3", ...}│
                       └──────────────────────────────┘
                                       │
                                       ▼
                              统一回包（JSON 裁剪过的核心字段）
```

核心是一个**统一入口的 Agent Gateway**：所有能力（搜书、书架、笔记、点评、推荐）都走同一个 POST 接口，靠 `api_name` 分发。这套架构和 cc-connect（L24.6）的"M 个平台 × N 个 Agent"哲学一脉相承——**协议层稳定，能力层可叠加**。

## Step 1：安装 Skill 与申请 API Key

1. 浏览器打开 [https://weread.qq.com/r/weread-skills](https://weread.qq.com/r/weread-skills)
2. 按页面指引下载 Skill 包，放到 `~/.claude/skills/weread-skills/`
3. 在同一页面申请 API Key，拿到形如 `wrk-xxxxxxxx` 的字符串
4. 配置环境变量：

```bash
# 加入你的 shell rc 文件（zshrc / bashrc）
export WEREAD_API_KEY=wrk-xxxxxxxx
```

5. 在 Claude Code 里输入 `/weread-skills` 触发，确认 Skill 已就位

> **API Key 即身份**：`wrk-` Key 绑定你的微信读书 `vid`（用户身份）。需要用户身份的接口（书架、个人笔记、阅读统计）会**自动注入** vid，无需在 body 里手动传——这是和大多数公开 API 不同的设计。

## Step 2：理解调用规范（一次学会，所有接口通用）

```bash
curl -X POST "https://i.weread.qq.com/api/agent/gateway" \
  -H "Authorization: Bearer $WEREAD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"api_name": "/store/search", "keyword": "三体", "count": 10, "skill_version": "1.0.3"}'
```

四条不可妥协的规则：

1. **业务参数平铺在 body 顶层**——不要嵌进 `params: {...}`。错误写法会让 `count`、`lastSort` 等参数被丢弃，看起来像"分页失效"。
2. **每次请求都要带 `skill_version`**——这是版本握手字段。
3. **回包里出现 `upgrade_info` 必须先升级再继续**——这是 Skill 自我演化的机制，下面单独讲。
4. **能力文档预检**——调用任何接口前先读对应说明文件（如 `notes.md`、`shelf.md`），字段含义以说明文件为准，不要凭字段名猜。

### `skill_version` 握手：Skill 设计的通用模式

这套机制值得单独记下来——它是 **Skill 长期可维护的关键设计**：

```
客户端 →  body 里上报 skill_version: "1.0.3"
服务端 ←  检查版本，如已过期回包附 upgrade_info
客户端 →  暂停当前操作，按 upgrade_info.message 升级
客户端 →  升级完成后重新执行用户原始请求
```

为什么这是好设计：服务端可以随时演进接口契约，老版本 Skill 不会"沉默失败"，而是主动告知用户升级。你设计自己的 Skill 时也应该抄这个模式——比 README 里写"请及时更新"有效得多（参考 L6.1 的 Skill 设计哲学）。

## Step 3：八大能力速览

按 Skill 文档，所有能力分八类，对应不同的说明文件：

| 能力       | 说明文件      | 用户怎么说                          |
|------------|--------------|------------------------------------|
| 搜索书籍   | `search.md`  | "帮我搜一下三体"                    |
| 书籍信息   | `book.md`    | "这本书多少章" / "我读到哪了"       |
| 书架管理   | `shelf.md`   | "看看我的书架"                      |
| 阅读统计   | `readdata.md`| "我这个月读了多久"                  |
| 个人笔记   | `notes.md`   | "导出我在三体里的划线"              |
| 热门划线   | `notes.md`   | "这章有什么热门划线"                |
| 书籍点评   | `review.md`  | "三体有什么高赞点评"                |
| 个性化推荐 | `discover.md`| "给我推荐几本书"                    |

> **`/_list` 探活技巧**：发送 `{"api_name": "/_list"}` 可查看当前 Skill 所有可用接口及参数定义。这是排查"某个能力到底支不支持"的最快方法。

## Step 4：四种被低估的"信息源玩法"

让 AI 操控微信读书只是开胃菜。下面才是这个 Skill 真正给产品主理人的杠杆。

### 玩法 1：30 分钟"读完"一本书

不用从头读到尾。先看群体投票出来的精华：

```
你：这本书的热门划线是哪些？
Claude：（调 /book/bestbookmarks，附 weread:// 跳转链接到划线位置）

你：高赞点评说了什么？
Claude：（调 /book/readreviews 排序取 top）
```

热门划线密度 = 这本书的"信号 / 噪声比"。一本 300 页的书可能只有 30 条值得记的——划线已经替你过滤过。

### 玩法 2：跨书检索个人观点演化

把你读过的所有书当成一个**带时间戳的私人 RAG 库**：

```
"我读过的所有关于'第一性原理'的笔记，按时间排序整理出来"
"两年前我在《思考快与慢》里划了哪些和决策偏差相关的句子？"
"对比我在《零到一》和《精益创业》中的想法，看看观点变化"
```

实现上：先 `/user/notebooks` 拿到有笔记的书单，再逐本调 `/book/bookmarklist` 取划线，最后让 Claude 跨书聚合。

### 玩法 3：让 AI 写作时调用你的私人观点库

```
"基于我在《被讨厌的勇气》里的所有划线，帮我写一篇关于课题分离的文章"
"我做产品决策时常引用哪些书？整理一份引用图谱"
```

效果：AI 输出的不再是"训练数据里的二手观点"，而是**你读过、划过、想过的内容**——风格和立场都对齐你。

### 玩法 4：和 graphify / QMD 组合成外脑

这是终局玩法，跨越三节课：

```
微信读书 Skill (L24.7)  →  导出全部划线/想法
       ↓
QMD (L24.3)              →  本地索引为语义可搜的语料
       ↓
graphify (L24.5)         →  构建概念关系图谱
       ↓
Claude Code              →  基于"你读过的书"思考与回答
```

执行步骤：

```bash
# 1. 让 Claude 导出全部笔记到本地 markdown
"调用 /user/notebooks 拿全部书单，逐本 /book/bookmarklist 取划线，
 按书名生成 ~/reading-notes/<书名>.md"

# 2. 用 QMD 建索引
qmd collection add ~/reading-notes --name reading
qmd embed

# 3. 用 graphify 建图
/graphify ~/reading-notes
```

之后 Claude 回答你的任何问题，都会同时考虑"训练数据 + 你读过的书"。这一步是真正把"读过的书"变成"思维的一部分"。

## Step 5：深度链接——把答案变成可点击的入口

微信读书 Skill 支持 `weread://` URL Schema，AI 回答时附上这种链接，用户点击直接跳到 App 对应位置：

| 场景         | URL 模板                                                         |
|--------------|------------------------------------------------------------------|
| 打开书籍     | `weread://reading?bId={bookId}`                                  |
| 跳转章节     | `weread://reading?bId={bookId}&chapterUid={chapterUid}`          |
| 跳转划线位置 | `weread://bestbookmark?bookId=...&chapterUid=...&rangeStart=...&rangeEnd=...&userVid=...` |

> **range 字段解析**：划线接口返回的 `range` 是 `"900-2004"` 这种格式，拆成 `rangeStart` 和 `rangeEnd` 即可。

这个细节决定了用户体验：搜到一本书 → 一键打开继续读；看到一段精彩划线 → 一键跳到原文上下文。**信息源和操作入口在同一回答里闭环**。

## 数据展示规范（避免新手坑）

Skill 文档明确强调两条展示纪律：

1. **时间戳必须转人话格式**：`updateTime`、`finishTime` 这些 Unix 秒数要显示成 `YYYY-MM-DD`，不能直接吐数字。
2. **阅读时长必须转 "X小时Y分钟"**：原始单位是秒，`3600` 直接吐给用户是反人类的。

这两条同样适用于你自己设计任何 Skill——**裸数据是给程序看的，UI 字段是给人看的**。

## 隐私与合规边界

- API Key 本质上代理你登录微信读书，**不要把 Key 提交到 Git 或写进截图**
- 导出的笔记可能包含付费书内容，**只用于个人使用**，不要二次发布
- 书架和阅读统计属于个人数据，**用于团队协作前要先脱敏**

## 实操练习

### 练习 1：跑通基础调用

```
1. 配置 WEREAD_API_KEY，触发 /weread-skills
2. 让 Claude 搜一本你正在读的书
3. 让 Claude 列出你的书架前 10 本
4. 让 Claude 导出你某本书的全部划线，附 weread:// 跳转链接
```

验证标准：返回结果里时间戳是 `2025-05-30` 而非 `1748563200`。

### 练习 2：组合 graphify 建立外脑

```
1. 用 Skill 导出 5 本你读过的同主题书的笔记到 ~/reading-notes/
2. /graphify ~/reading-notes
3. 打开 graphify-out/graph.html，找出这 5 本书的「概念神节点」
4. 问 Claude："这些书在 X 概念上的观点有什么差异？"
```

观察：Claude 是不是基于图谱而非凭空回答？

### 练习 3：和 QMD 联动

```
1. qmd collection add ~/reading-notes --name reading && qmd embed
2. 配置 QMD MCP（参考 L24.3）
3. 问 Claude："我读过的关于'用户增长'的内容，哪几本最相关？"
```

## FAQ

**Q：和直接打开微信读书 App 比有什么差别？**

App 适合"专注阅读单本书"。Skill 适合"跨书检索 + 让 AI 基于你读过的内容工作"。两者互补，不是替代。

**Q：能用来收藏整本书内容做训练数据吗？**

不能、也不该。Skill 返回的是核心字段（划线、想法、统计），不是全文。书的版权属于出版社——只用于个人理解和创作。

**Q：API Key 失效了怎么办？**

回 [weread.qq.com/r/weread-skills](https://weread.qq.com/r/weread-skills) 重新申请。Key 绑定 vid，换设备无需重新申请。

**Q：Skill 升级了 Claude 怎么知道？**

`upgrade_info` 字段。回包里一旦出现就**必须**先停下来按指引升级，再继续原始请求——这是 Skill 文档明文要求，AI 不能忽略。

**Q：和 Lesson 24.6 的 cc-connect 能联动吗？**

可以。在 cc-connect 配置好 Claude Code 后，在微信里发"导出我这周读完的书的笔记"，本地 Claude 自动调用 weread-skills、整理笔记、回传到你的微信。**手机里看书 + 手机里调度 AI 整理笔记 = 完整闭环**。

## 课后思考

1. 你读过最多笔记的 3 本书是什么？这些书的划线足够构成一个"你的观点库"吗？
2. 如果让 AI 自动每月生成一份"我这个月读过的书的关键观点摘要"，应该怎样组合本课和 L24.6？
3. 微信读书的"群体智慧"是高质量信号，但也可能是"舒适圈回音壁"——你打算如何利用，又如何避免？

---

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 返回 Lesson 24：高级特性
- 前往 Lesson 24.8：OpenAI 生图 Skill
- 返回主菜单

---
*阶段 5 | Lesson 24.7/26 | 上一课: Lesson 24.6 - 微信远程控制 CC | 下一课: Lesson 24.8 - OpenAI 生图 Skill*
