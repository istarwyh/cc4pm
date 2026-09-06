---
title: 修改课件与参与贡献
description: 修改原始课件，一次更新同时服务网站与教学入口。
weight: 70
search_keywords: [贡献, 修改, 课件, 预览, course-map, build]
---

## 修改已有课程

从课程页的“编辑本页”进入源文件。产品课件位于 `guide/lessons/`，律师课件位于 `verticals/lawyer/guide/lessons/`。

只修改这份正文，网站构建会生成新的阅读页。需要改变课号、标题或顺序时，同步修改对应的 `course-map.yaml`。

## 增加课程与互动页面

在课程地图的适当位置登记课程，再添加对应 Markdown 文件。顺序取自地图，补充课用 `supplementary: true` 标记。像 `17.10` 这样的编号使用带引号的字符串。

互动 HTML 与必要 CSS 保留在课件目录中，在正文添加相对链接。需要额外展示入口时，可在该课的 `visuals` 字段登记文件与标题。

## 本地检查与预览

在仓库根目录安装依赖后：

```bash
npm ci --ignore-scripts
npx playwright install chromium
npm run site:doctor
npm run site:sync
npm run site:check
npm run dev:site
```

网站构建另需固定版本的 Hugo Extended 和 Go，具体版本及安装方式见仓库的 [website/README.md](https://github.com/istarwyh/cc4pm/blob/main/website/README.md)。普通课件使用者不需要安装它们。

提交原始课件、课程地图以及必要配置，保留首页包的生成副本。`.generated/`、`public/` 和缓存目录不提交。

`site:sync` 同步课程统计、产品教学入口中的目录及课末导航、首页。`site:check` 只检查，不替你修改源文件；它会运行课件回归、桌面与手机浏览器验收，再生成生产站点。每个 PR 都执行相同检查，通过后再合并发布。

## 保持课件有效

修改安装方式、命令或外部工具用法时，实际执行相应练习，并在 PR 中记录工具版本和结果。正文标注了适用版本时一并更新。页面上的更新时间取自 Git，表示源文件修改时间；它不代表所有外部工具用法都已重新验证。

发现失效示例时，提交包含课程地址、工具版本、复现步骤的 Issue。优先修复安装与第一课等入门路径；旧链接需要迁移时保留重定向。维护者每月集中处理依赖更新，并抽查入门课和有变动的工具相关课程。
