# cc4pm 官方文档站

本站使用 [OINK](https://oink.pgsty.com/docs/start/starter/)（v1.0.0）和 Hugo Extended（0.165.0），直接发布仓库中已有的课件。构建工具还需要 Node.js 22+、npm 和 Go 1.27.0。版本由 CI、`go.mod` 和构建脚本固定。

## 本地预览

在仓库根目录执行：

```bash
npm ci --ignore-scripts
npm run dev:site
```

打开 <http://127.0.0.1:1313/cc4pm/>。编辑课件后会重新生成，刷新浏览器即可查看。用 `SITE_PORT=1314` 更换预览端口；未全局安装 Hugo 时可以用 `HUGO_BIN=/absolute/path/to/hugo` 指定二进制。首次构建需下载 Go 模块。

## 内容从哪里来

| 要修改的内容 | 应编辑的源文件 |
| --- | --- |
| 产品课程顺序、编号、标题、补充标记、互动资源 | `guide/course-map.yaml` |
| 产品课程正文 | `guide/lessons/` |
| 律师课程与材料 | `verticals/lawyer/` 下的 `guide/`、`templates/`、`examples/` |
| 课程注册信息和生产站点地址 | `website/site.yaml` |
| 安装、学习方式、FAQ、贡献指南 | `website/content/docs/` |
| 首页布局和文案 | `docs/index.html` |
| 文档布局、样式与交互 | `website/layouts/`、`website/assets/` |

课件目录和正文始终以原文件为准。生成器只在忽略提交的 `website/.generated/` 中适配 front matter、链接和重复标题；不会重写原课件。每节课使用「课程 / 阶段 / lesson ID」组成稳定地址，显示编号按字符串处理，排序按课程地图的原顺序。补充课默认完整发布。

11 个普通 HTML 课件保留原脚本及 CSS，并增加返回课程的入口；微信专用变体不发布。律师案例、模板和参考交付件保留阅读页与原文件下载。共享实操须知只生成一个正文页面。

修改课程地图后，先同步项目原有的派生目录，再生成独立首页：

```bash
node scripts/sync-courseware.js
npm run build:homepage
npm run check:homepage
```

不要直接编辑 `website/.generated/`、`website/public/` 或 `packages/homepage/index.html`。首页 npm 包保留 `filePath` 和 `html()` 接口；首页内容变化时应同步提升 `packages/homepage/package.json` 的版本。发布主项目时，`scripts/release.sh` 会生成首页并提升首页包的 patch 版本。

## 构建和验证

```bash
npm test
npm run test:site
npm run check:homepage
npm run build:site
```

生产产物为 `website/public/`，默认地址是 <https://istarwyh.github.io/cc4pm/>。验证其他部署路径：

```bash
npm run build:site -- --baseURL https://example.com/
```

`build:site` 检查课程同步状态、Hugo 版本、构建警告、全部本地链接与锚点、CSS 资源、每课唯一 H1、Markdown 输出、`llms.txt`、导航索引以及原文件哈希。源文件中的代码块不会作为 Markdown 链接改写。`test:site` 在临时副本里测试修改原课件后目录、正文和首页同步更新，并拒绝冲突元数据。

提交前还应在桌面和手机宽度下走通：首页 → 课程 → 第一课 → 互动页 → 返回；检查中文全文搜索、只看主线、复制学习提示和律师材料下载。全文检索为静态客户端搜索，首次使用会加载约 1.1 MB 的索引（gzip 约 0.4 MB），无需后端。

## 发布

`.github/workflows/pages.yml` 在 PR 中构建并验证，在 `main` 上通过检查后部署 `website/public/`。GitHub 仓库的 Pages Source 应设为 **GitHub Actions**（原项目已有 Pages 工作流）。自定义域名时，需同时更新 `website/site.yaml` 的生产地址并重新生成独立首页。

`.github/workflows/publish-homepage.yml` 在推送时校验首页包：验证生成文件与源一致；若版本已发布，比较 npm 中的 HTML。需要发布 npm 时，手动运行该工作流；只有此次手动发布成功或明确强制通知时才通知下游。Pages 部署和主项目发布脚本不自动发布首页 npm 包。

站点没有账号系统或学习进度同步。网页提供阅读、搜索、互动演示和学习提示；实操仍在本机 Claude Code 中进行。第三方图片、字体和视频继续引用已有外部资源，断网时这些资源不可用。
