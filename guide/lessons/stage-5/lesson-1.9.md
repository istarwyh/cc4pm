---
number: "24.9"
title: "OINK 内容站——项目、Book 与下载页的默认发布框架"
short_title: "OINK 内容站"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.9: OINK 内容站——项目、Book 与下载页的默认发布框架

> **前置课程**：Lesson 17.2（AI 原型实验室）、Lesson 21（工程协作概览）、Lesson 24.8（OpenAI 生图 Skill）
>
> **预计用时**：25 分钟
>
> **适合人群**：需要发布项目官网、工程文档、Book、版本说明或下载中心，并希望内容、配置和构建产物都可版本管理的产品主理人
>
> **实操须知**：本课命令请在一个新的 Claude Code session 中执行。详见 [practice-notice.md](../shared/practice-notice.md)。

## 为什么内容站需要单独选型
单页原型解决“这个交互能不能被看见、被点击”；内容站还要回答：几十个页面怎样组织、导航怎样随文件变化、多语言怎样对应、版本说明和下载入口怎样持续更新、错误怎样在发布前被拦住。

**OINK** 的全称是 **Open. Indexed. Navigable. Knowledge.**。它是基于 Hugo 的 local-first 工程知识发布框架，官方新站模板叫 **OINK Starter**。你把 Markdown、YAML 和本地资源放进仓库，它把这些内容构建成可部署的静态站点。

```text
Markdown / YAML / images
  → OINK + Hugo Extended
    → HTML / Search / Print / Markdown twin / RSS
      → public/ → 静态托管
```

cc4pm 的默认路由是：

> **内容是产品主体时，优先用 OINK；交互或业务状态是产品主体时，回到原型或应用开发栈。**

| 交付物 | 默认路线 | 原因 |
|-------|---------|------|
| 工程项目站、开源项目站 | OINK | Landing、Docs、Blog、Release 可在一个仓库维护 |
| 文档或知识库 | OINK | 文件树驱动侧边栏、目录、面包屑和翻页 |
| 顺序阅读的 Book | OINK | 支持章节树、交叉引用、索引和整书 Print |
| Release / 下载中心 | OINK 作为展示前端 | 展示版本、渠道、命令和校验和 |
| 可点击的单页原型 | Lesson 17.2 | 快速验证交互，不建立内容发布系统 |
| 登录、数据库、支付、实时状态 | 常规应用栈 | OINK 不提供服务端业务能力或 CMS |

这里的“默认”是在符合**工程知识发布站**条件时减少重复决策，不是把所有网站都塞进同一技术栈。

## 学习目标
完成本课后，你将能够：

- 判断项目站、Docs、Book、下载页是否适合 OINK
- 让 Claude 检查并安装 Hugo Extended 与 Go，再启动 OINK Starter
- 用 `content/` 文件树组织导航，用 `data/` 维护首页和下载数据
- 为 Book、Release 和多语言内容选择正确结构
- 用严格构建把 warning 变成发布失败，并验证 `public/`
- 识别 OINK 与 CMS、动态应用、制品托管的能力边界

## Step 1：让 Claude 准备工具链
OINK 不需要 Node、npm、PostCSS 或 CDN。消费站点需要 **Hugo Extended**；通过 Hugo Module 使用 OINK 时还需要 **Go**。

这里演示的是官方 Starter。cc4pm 为复用现有课件，另加了 Node.js 生成与验证脚本；维护本仓库时使用 `npm run site:sync` 和 `npm run site:check`，具体环境见 [网站维护手册](https://github.com/istarwyh/cc4pm/blob/main/website/README.md)，无需把课件再复制到另一个 Starter。

在新的 Claude Code session 中直接说：

```text
请检查当前系统是否具备 Hugo Extended、Go 和 Git。
如果缺少，请帮我安装；安装后打印版本，并确认 Hugo 是 Extended 版本。
然后再创建 OINK 站点，不要跳过环境验证。
```

验证命令：

```bash
hugo version
go version
git --version
```

当前 Starter 示例锁定 OINK `v1.0.0`、Go `1.27` 和 Hugo Extended `0.165.0`；OINK 声明的 Hugo Extended 下限为 `0.160.1`。版本会变化，**以项目的 `go.mod` 和 `hugo.yaml` 为准，不要靠记忆猜**。

## Step 2：先跑通原样 Starter
正式项目优先用 `pgsty/oink-starter` 创建自己的 GitHub Template 仓库，再 clone：

```bash
git clone https://github.com/OWNER/PROJECT-DOCS.git
cd PROJECT-DOCS
hugo server
```

临时评估可以使用一次性 clone：

```bash
git clone https://github.com/pgsty/oink-starter.git
cd oink-starter
hugo server
```

先确认**未经修改的站点可以运行**，再检查模块解析结果：

```bash
hugo mod graph | grep github.com/pgsty/oink
```

Starter 当前应解析到 `github.com/pgsty/oink@v1.0.0`。把 `hugo.yaml`、`go.mod`、`go.sum` 一起提交，生产环境不要依赖浮动 `latest`。

如果一开始就确定语言范围，可切换官方完整配置档：

```bash
cp examples/hugo.single.yaml hugo.yaml       # 仅英文
cp examples/hugo.bilingual.yaml hugo.yaml    # 英文 + 中文
```

它们是完整配置，不是应该混贴进现有文件的片段。

## Step 3：读懂骨架并选择内容面
你最常接触的目录是：

```text
hugo.yaml                         站点、语言、输出、模块和功能开关
go.mod / go.sum                   OINK 版本锁定与依赖校验
content/docs/                     文档
content/blog/                     Blog、设计记录和发布公告
content/book/                     顺序阅读的 Book
content/**/_index.md              分区元数据和继承规则
data/home/<lang>.yaml             数据驱动首页
data/landing/<key>/<lang>.yaml    普通 Landing Page 数据
data/download/<key>.yaml          下载版本、渠道、命令和校验和
assets/icons/logo.svg             经 Hugo pipeline 处理的品牌资源
static/openapi/*.yaml             OpenAPI 规范
.github/workflows/                静态站部署工作流
```

构建生成的 `public/`、`resources/`、`.hugo_build.lock` 不是内容源。

Starter 自带 Docs、Blog 和短 Book。你不必全部保留：

| 内容面 | 适合放什么 | 不需要时 |
|-------|-----------|---------|
| Docs | 安装、使用方法、概念、API 指南 | 删除内容及导航、首页入口 |
| Blog | 设计记录、公告、Release | 删除文章及引用入口 |
| Book | 有稳定阅读顺序的长内容 | 删除整棵树及相关链接 |
| Landing | 价值主张、功能、案例、CTA | 保留并重写首页数据 |
| Download | 渠道、版本、校验和 | 无真实制品时不发布 pinned 渠道 |

推荐修改顺序：

```text
站点身份 → 语言档 → 首页 → 内容与导航 → 品牌 → 读者功能 → 外部集成
```

删除一个内容面时，一起检查首页卡片、顶部导航、侧边栏和跨页链接；只删目录会留下死链接。

## Step 4：让文件树成为信息架构
OINK 的侧边栏不是另一份手写菜单。`content/` 目录就是导航树：

- `_index.md` 定义 section
- `weight` 决定同级顺序
- `linkTitle` 控制导航短标题
- `cascade` 把页面类型等设置继承给子页面
- Page Bundle 让页面和图片等资源共置

```text
content/docs/
├── _index.md
├── start/
│   ├── _index.md
│   ├── install.md
│   └── configure.md
└── reference/
    ├── _index.md
    └── cli.md
```

页面 front matter 至少说清标题和顺序：

```yaml
---
title: 安装 OINK
linkTitle: 安装
weight: 10
---
```

多语言页面使用配对文件，例如 `install.md`、`install.zh.md`、`install.fr.md`。首页数据则放在 `data/home/en.yaml`、`data/home/zh.yaml`。

会被别处引用的标题应显式写锚点，例如 `## 严格构建 {#strict-build}`，不要让链接依赖未来可能变化的自动 slug。

## Step 5：用数据组装首页和 Landing Page
OINK 用 `data/home/<lang>.yaml` 的 `sections` 组合 Hero、Cards、CTA、指标、案例、下载等区块；普通 Landing Page 使用 `data/landing/<key>/<lang>.yaml`。

这让文案、结构和视觉可以分别评审，也便于多语言对应。让 Claude 修改时，明确要求保留 Starter schema：

```text
请基于 OINK Starter 现有的 data/home/zh.yaml 修改首页。
保留原文件 schema，只替换项目定位、目标读者、核心入口和 CTA；
所有链接必须指向当前 content/ 中真实存在的页面。
```

不要凭印象重造 YAML 字段。复制可运行示例，小步修改，每次预览。

## Step 6：发布 Book
Book 是一棵 `type: book` 的内容树。章节用子目录和 `_index.md` 表示，`weight` 控制顺序：

```text
content/handbook/
├── _index.md
├── ch01/
│   ├── _index.md
│   ├── install.md
│   └── bootstrap.md
└── appendix.md
```

Book 根页面可以声明：

```yaml
---
title: 产品主理人手册
type: book
book_number: B
cascade:
  type: book
outputs: [HTML, print, markdown]
---
```

OINK 可从同一棵树生成章节导航、前后翻页、目录、图表/公式/示例索引、整书 Print 和可选 BookManifest。但有三条边界：

1. 章节号和图表编号由作者手写，不会自动编号
2. `book_status: draft` 只显示编辑状态，不会阻止发布
3. Hugo 不直接生成 PDF/EPUB；它们需要 BookManifest、Print HTML 和主题附带的外部脚本

发布前检查：

```bash
hugo --printPathWarnings --panicOnWarning
python3 /path/to/oink/bin/check-book.py --site-public public
```

第二条路径要按本机 OINK 模块位置调整。它会验证引用锚点、编号一致性、重复 ID 和图片替代文本。Book 内容还必须是你拥有或获授权发布的内容，不要把私人阅读语料直接公开。

## Step 7：发布 Release 与下载页
OINK 的下载能力负责**展示和说明**，不负责托管真实制品。

Release 页面放在 `content/blog/release/<version>.md`，以准确的 GitHub tag release URL 作为事实来源：

```yaml
release_url: https://github.com/OWNER/REPO/releases/tag/v1.0.0
```

下载数据放在 `data/download/<key>.yaml`，允许的顶层字段是：

```yaml
version: 1.0.0
repo: OWNER/REPO
tag: v1.0.0
published: false
channels:
```

`channels` 必须是非空数组；上面只展示顶层字段，实际渠道应从 Starter 或官方示例复制后再改。

页面中引用：

```go-html-template
{{< release-card >}}
{{< download "product" >}}
```

推荐发布顺序：

```text
更新 download 版本 → 写 release page 与 release_url
  → 保持 published: false → 创建真实 tag 与制品
    → 核对下载链接和 checksum → 切换 published: true
```

`published: false` 时，rolling 渠道仍可工作，但 pinned 链接、命令、资产链接和复制按钮会被禁用。

**边界**：OINK 构建不访问 GitHub，不检查远端资产是否存在，也不验证文件与 checksum 是否匹配。对象存储、Release Assets、包注册表、签名和供应链验证仍由外部系统负责。

## Step 8：严格构建、部署与验收
开发预览：

```bash
hugo server
hugo server -D
```

严格生产构建：

```bash
hugo --cleanDestinationDir --gc --minify --environment production \
  --printPathWarnings --panicOnWarning
```

`--printPathWarnings` 检查多个页面写入同一路径等问题；`--panicOnWarning` 把第一个 Hugo 或 OINK warning 变成失败。构建成功后，可部署产物位于 `public/`。

```text
验收 = 退出码 0 + 无 ERROR + 无 WARNING + public/ 存在预期入口
```

Starter 自带 GitHub Pages 和 Cloudflare Pages Direct Upload 工作流，也可把 `public/` 交给其他静态托管服务：

| 目标 | 核心配置 |
|------|---------|
| GitHub Pages | Settings → Pages → Source 选择 GitHub Actions |
| Cloudflare Pages | 配置 Account ID、API Token；Direct Upload 与 Git Integration 二选一 |
| Netlify / Vercel | Build command 使用 Hugo，Output directory 为 `public`，固定 `HUGO_VERSION` |
| Nginx / Caddy / 对象存储 | 直接托管 `public/` |

`baseURL` 必须匹配最终域名和子路径，否则绝对链接、语言根路径或 canonical URL 会错。

上线后抽查：首页、Docs、Book、Release、导航、侧边栏、搜索、深色模式、404、Print、Markdown 输出、多语言根路径、下载链接、版本号、checksum 和 canonical URL。

## 面向搜索与 Agent 的输出
OINK 可按配置输出 Markdown twin、`llms.txt`、`llms-full.txt`、`navigation.json`、RSS、Print 和 BookManifest。它们适合搜索索引、内容迁移和 AI 读取，但必须在 `hugo.yaml` 或页面 outputs 中显式启用。

local-first 也不等于绝对离线。主题资产和搜索可以本地运行，但 Analytics、Giscus、远程 OpenAPI、远程媒体或 Assistant links 仍会产生网络请求。未完整配置的外部集成保持关闭。

## 给 Claude 的完整建站指令
```text
请用官方 pgsty/oink-starter 为这个工程产品建立中文优先、英文可选的内容站。

内容面：
- 首页：产品承诺、适合人群、核心入口、CTA
- Docs：安装、快速开始、配置、FAQ
- Book：按章节组织的完整使用手册
- Release/Download：版本说明、安装渠道、真实资产链接与 checksum

执行要求：
1. 先检查并安装 Hugo Extended、Go、Git，再预览未经修改的 Starter
2. 固定 OINK 版本，保留 go.mod/go.sum
3. 用 content/ 文件树驱动导航，不另写重复菜单
4. 基于 Starter schema 修改 data/home 和 data/download
5. 删除不用的示例内容及所有关联入口
6. 运行严格生产构建，任何 warning 都视为失败
7. 浏览器检查桌面、移动端、深色模式、导航、404 和下载链接
8. 交付源码目录、public/ 路径、验证结果和部署说明

不要把 OINK 当成动态应用框架；若需求涉及登录、数据库或服务端状态，请停止并说明应切换的应用栈。
```

## 实操练习
在新的 Claude Code session 中，选择一个你有权发布的项目，完成以下闭环：

```text
□ 让 Claude 安装并验证 Hugo Extended、Go、Git
□ 从自己的 OINK Starter Template 仓库启动，并先预览原样站点
□ 只保留项目真正需要的内容面
□ 写 3 个 Docs 页面和 1 个中文首页
□ 有真实版本再添加 Release/Download；没有就保持 published: false
□ 运行严格生产构建，检查 public/ 和上线验收项
□ 选择一个静态托管目标并验证真实 URL
```

做 Book 时，再增加章节顺序、显式锚点、交叉引用、整书 Print 和 `check-book.py` 检查。

## FAQ
**Q：OINK 能替代 Next.js、React 或其他应用框架吗？**
不能。OINK 的优势是 Git + Markdown/YAML + 静态发布。登录、数据库、支付、实时协作和复杂客户端状态仍应使用应用框架。也可让主应用使用常规栈，Docs 和 Book 使用 OINK。

**Q：为什么不继续用 Lesson 17.2 的单文件 HTML？**
单文件 HTML 适合验证一个交互方向。页面增加后，导航、多语言、搜索、版本和构建会变成长期维护问题；这正是 OINK 的范围。

**Q：OINK 会托管安装包并验证 checksum 吗？**
不会。它展示下载渠道、命令、链接和 checksum，但不托管制品，也不核对远端文件与 hash。

**Q：Book 会自动生成 PDF 和 EPUB 吗？**
不会。Hugo 可生成 HTML、Print、Markdown 和可选 BookManifest；PDF/EPUB 是构建外的可选打包流程。

**Q：OINK 是完全离线的吗？**
核心主题资产、构建和本地搜索可以 local-first；主动启用的 Analytics、评论、远程媒体或远程 API 规范仍需要网络。

## 相关概念
- **AI 原型实验室**（Lesson 17.2）— 区分点击原型与可发布内容站
- **工程协作概览**（Lesson 21）— 把严格构建接入 CI/CD 门禁
- **视觉校验**（Lesson 22.2）— 构建正确之后继续验证页面外观
- **OpenAI 生图 Skill**（Lesson 24.8）— 为首页、Book 和 Release 生成视觉素材
- **完整项目实战**（Lesson 25）— 发布前按内容站与动态应用分流

## 官方资料
- [OINK Starter](https://oink.pgsty.com/docs/start/starter/)
- [OINK 是什么](https://oink.pgsty.com/docs/about/)
- [组织内容](https://oink.pgsty.com/docs/write/organize/)
- [Book 发布](https://oink.pgsty.com/docs/write/book/)
- [Release 与下载](https://oink.pgsty.com/docs/write/releases/)
- [预览与严格构建](https://oink.pgsty.com/docs/admin/preview/)
- [部署](https://oink.pgsty.com/docs/admin/deploy/)

## 下一步
请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 25 - 完整项目实战
- 返回 Lesson 17.2：AI 原型实验室
- 返回主菜单

---
*阶段 5 | Lesson 24.9/26 | 上一课: Lesson 24.8 - OpenAI 生图 Skill | 下一课: Lesson 25 - 完整项目实战*
