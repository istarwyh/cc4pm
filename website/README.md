# cc4pm 官方文档站维护

网站直接发布仓库中的课件，使用 [OINK](https://oink.pgsty.com/docs/start/starter/) 与 Hugo Extended。课程正文、顺序、互动页和课堂材料各有一份源文件；网站与教学入口从这些文件生成。

## 第一次配置

Node.js 与 Hugo Extended 的版本由 [`toolchain.json`](toolchain.json) 统一配置，本地与 CI 读取同一文件。Go 的版本与 OINK 模块版本由 [`go.mod`](go.mod) 固定，依赖校验值保存在 `go.sum`；npm 依赖使用根目录 `package-lock.json`。安装对应版本的 [Hugo Extended](https://gohugo.io/installation/) 和 [Go](https://go.dev/doc/install)，然后在仓库根目录执行：

```bash
npm ci --ignore-scripts
npx playwright install chromium
npm run site:doctor
```

没有全局 Hugo 时，设置 `HUGO_BIN` 为本机二进制路径。首次构建会下载固定版本的 Go 模块。浏览器测试使用独立的 Chromium，不使用个人浏览器配置。

## 日常修改：同步、检查、提交

```bash
npm run site:sync
npm run site:check
```

`site:sync` 根据课程地图同步课程数量、产品课程原有教学目录和课末导航，并生成独立首页。`site:check` 检查派生内容是否同步，运行项目测试、课程生成回归、桌面与手机浏览器流程，最后完成生产构建。检查失败会返回非零状态；修复对应源文件后再运行。CI 使用同一个命令，不会自动修改课件来掩盖漏同步。

预览用 `npm run dev:site`，打开 <http://127.0.0.1:1313/cc4pm/>。保存源文件后自动同步、重新构建，刷新页面查看；`SITE_PORT=1314` 可以更换端口。预览同步可能修改课末导航与首页派生文件，提交前检查 diff。

| 要修改的内容 | 应编辑的源文件 |
| --- | --- |
| 产品课程顺序、编号、标题、补充标记、互动入口 | `guide/course-map.yaml` |
| 产品课程正文和互动 HTML/CSS | `guide/lessons/` |
| 律师课程与材料 | `verticals/lawyer/` 下的 `guide/`、`templates/`、`examples/` |
| 课程注册信息和生产站点地址 | `website/site.yaml` |
| 安装、学习方式、FAQ、贡献指南 | `website/content/docs/` |
| 首页布局和文案 | `docs/index.html` |
| 文档布局、样式与交互 | `website/layouts/`、`website/assets/` |

新增课程：复制同阶段的课件格式，保留课末 `*阶段 …*` 导航占位；在地图中登记唯一 lesson ID、标题、文件名和编号，然后执行上述两个命令。`17.10` 这类编号必须写成带引号的字符串，顺序取自地图。标记 `supplementary: true` 后统计会自动同步，无需改测试数量。删除课程也从地图和源文件开始；已公开地址发生变更时，在迁移 PR 中实现并验证旧地址重定向，避免读者旧链接失效。

不要直接编辑 `website/.generated/`、`website/public/` 或 `packages/homepage/index.html`。提交源文件以及 `site:sync` 修改的地图、课末导航、教学目录和首页副本。生成器只在忽略提交的目录中适配元数据、链接和标题，不重写正文。微信专用 HTML 变体不发布；普通互动 HTML 保留脚本/CSS并提供返回入口。律师材料同时生成阅读页和原文件下载。

## 检查范围与排错

- 项目测试验证安装清单、课件同步和原有功能。
- 网站测试在临时副本中修改、增加、删除课程，验证正文、目录与首页同步，保留原代码块；另测试旧版本、缺文件和哈希不一致的发布失败场景。
- Chromium 在桌面与手机尺寸验证首页到课程与互动页的往返、中文/文件名/编号搜索、主线筛选、剪贴板成功与拒绝、模板下载字节、手机导航与页面宽度。测试隔离外部图片、字体和视频，因此它们是否仍在线需要人工抽查。
- 构建拒绝警告，检查全部站内链接和锚点、CSS 资源、每课唯一 H1、Markdown 输出、`llms.txt`、导航和源文件哈希。

浏览器失败会保留 `website/test-results/browser/` 的截图、上下文与 trace；CI 上传 `site-browser-failure`，保存 7 天。用 `npx playwright show-trace <trace.zip>` 查看交互过程。`SITE_TEST_PORT` 可调整验收端口，默认 4173；端口被占用时检查会失败，避免连到其他项目。

单独调试可用 `npm run test:site`、`npm run build:site`。只有先按本地地址构建，才能单独运行 `npm run test:site:browser`：

```bash
npm run build:site -- --baseURL http://127.0.0.1:4173/cc4pm/
npm run test:site:browser
```

`site:check` 会自动完成这些步骤，最后把 `website/public/` 还原为生产地址的构建。也可用 `npm run site:check -- --baseURL https://example.org/project/` 验证其他部署路径。

## 发布与恢复

每个 PR 都运行固定名称 `cc4pm-site-checks`，不按文件路径跳过。`main` 的合并检查要求该检查通过且分支最新；管理员同样适用。规则的可恢复配置保存在 [`.github/main-protection.json`](../.github/main-protection.json)，有管理权限时可应用：

```bash
gh api --method PUT repos/istarwyh/cc4pm/branches/main/protection --input .github/main-protection.json
```

[Pages 工作流](../.github/workflows/pages.yml) 在 `main` 上检查通过后部署。每次构建产生 `site-release.json`，记录提交 SHA、工作区是否有未提交内容和所有发布文件的 SHA-256。部署后等待 CDN 更新，逐个验证线上文件与该构建一致，并检查未知地址返回 404；整条工作流通过才算发布验收完成。CI 拒绝发布带未提交内容的产物。报告 `site-live-verification` 保存 30 天；`site-bundle` 保存 90 天。

需要恢复时，找到这套工作流产生的、已成功完成线上验收且仍保留 `site-bundle` 的 `main` run ID。先演练：

```bash
gh workflow run pages-restore.yml --ref main -f run_id=RUN_ID -f dry_run=true
```

在 Actions 中确认演练成功后，使用同一 run ID，将 `dry_run` 改成 `false` 才会实际部署。恢复流程验证来源工作流、分支、成功状态、提交 SHA、文件清单、哈希和生产地址，不需要安装旧构建依赖。恢复后再次逐文件验证线上内容；普通部署与恢复共用部署并发锁。

恢复只更换站点产物，不改变 Git 历史；下一次 `main` 部署会覆盖恢复版本。通过 PR 修复或 revert 引入问题的提交，作为永久修复。90 天前或产物已过期的版本需从 Git 重建，通过完整检查后发布。修改域名后不能直接使用旧域名产物，应重新构建。网络校验失败不会自动回滚；先看报告确认是传播延迟、网络故障还是内容错误。

Pages Source 使用 **GitHub Actions**。自定义域名时更新 `website/site.yaml`、GitHub Pages 设置，并重新同步首页。

## 持续维护的最小节奏

仓库维护者负责合并与发布验收；课件修改者负责实际跑通受影响的练习。每月集中处理一次 Dependabot 的 npm、Go 模块和 Actions 更新 PR；Hugo、Node 和 Go 主版本由维护者检查支持周期并主动更新固定版本。主题升级保持独立 PR，完整浏览器验收通过后再合并，不自动合并依赖升级。

每月抽查安装 → 第一课 → 实操入口，以及有外部工具变化的相关课件。命令、接口、模型用法发生变化时，在内容 PR 中记录实测工具版本和结果。页面的 Git 更新时间只表示编辑时间，不宣称整课已重新实测。失效反馈的 Issue 应提供课程地址、工具版本、步骤和预期结果；优先处理阻塞入门路径的问题。每季度用仍在保留期的最近成功产物跑一次恢复演练。

首页 npm 包保持 `filePath` 和 `html()` 接口。日常内容提交只校验生成首页，不查询 npm、发布包或通知下游。真正需要发布首页包时，提升 `packages/homepage/package.json` 版本，再手动运行 `publish-homepage.yml`；该流程会检查已发布版本是否一致，发布成功或显式强制通知时才通知下游。

主项目版本发布也遵守 PR 检查：在干净且最新的 `main` 上运行 `scripts/release.sh VERSION`，脚本创建 `codex/release-vVERSION` 分支，更新版本、首页包 patch、锁文件和首页并提交。随后运行 `site:check`，推送该分支并创建 PR。合并且 `main` 部署验收通过后，对已验证的合并 SHA 创建并推送 `vVERSION` 标签。脚本会打印这些后续命令；准备阶段不推送 `main`、打标签或发布 npm 包。

本站保持静态部署，没有账号系统、服务端数据库或学习进度同步。网页负责阅读、搜索与互动演示；教学实操继续在用户本机进行。
