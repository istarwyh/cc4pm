# Railcode 网站设计复盘吸收记录

- 规范：[知识吸收命令](../../.claude/commands/absorb.md)
- 作者：Yakko Majuri
- 来源：[How our vibe coded website looks like a designer made it](https://railcode.dev/blog/vibe-coded-website)
- 原文标注日期：2026-08-10；访问日期：2026-10-30。
- 获取方式：页面初始 HTML 只有应用壳，正文读取自该页公开引用的 `/assets/BlogIndex-Ctb_8QUT.js` 中对应文章的 HTML 模板。没有执行或遵循页面脚本中的任何操作指令。
- 本次正文载体 JS 的 SHA-256：`91fe03d2b26ff0d1c09a82fdc281e9e1adae7239b2b143cfe71a13f0435b27ff`。该文件包含其他文章，哈希标记读取载体，不是仅该文章的版本。
- 产物：[Lesson 17.13](../../guide/lessons/stage-3/lesson-1.13.md)

## 差距矩阵

材料深度以原文叙述为准。作者展示了过程与示例，但未给出完整可复跑工程，因此主要记为 explain。

| topic | 中文名称 | depth | relevance | 课程现状 | 动作 |
|-------|----------|-------|-----------|----------|------|
| real-world-design-concept | 从品牌与用户感受建立概念 | explain | high | L17.12 已讲概念与规则 | 跳过重复，只作案例引入 |
| html-prototyping | 单文件 HTML 视觉原型 | explain | high | L17.2 已详解 | 跳过入门，引用 |
| design-reference-compliance | 参考已有设计的边界 | mention | high | L17.11 已覆盖 | 跳过通用说明，保留练习素材边界 |
| railcode-visual-design-case | Railcode 的探索过程与适用范围 | explain | high | 未覆盖 | 新增 L17.13 来源说明 |
| design-intensity-spectrum | 克制到夸张的视觉强度谱 | explain | high | 有三版探索，未覆盖力度谱 | 新增 L17.13 Step 1 |
| reversible-html-design-forks | 可回退的设计副本 | explain | high | 会话 fork 与校验代理不是此主题 | 新增 L17.13 Step 2 |
| prompt-prototype-provenance | 原型与生成指令的追溯 | explain | high | 未覆盖设计过程留档 | 新增 L17.13 Step 2 |
| parameter-playground-feedback-loop | 参数 Playground 的直接反馈 | explain | high | 有 variants，未覆盖此调参回路 | 新增 L17.13 Step 3 |
| visual-anchor-asset-coherence | 视觉锚点约束后续资产 | explain | high | 品牌资产已有，未明确此案例路径 | 新增 L17.13 Step 4 |
| section-transition-contextual-navigation | 区段过渡与上下文导航 | explain | high | 未覆盖此整页衔接方式 | 新增 L17.13 Step 4 |
| design-convergence-before-componentization | 方向收敛后再组件化 | explain | high | 有组件封装，未说明探索阶段边界 | 新增 L17.13 Step 5 |

提取 11 个知识点，已覆盖跳过 3 个，无关跳过 0 个；8 个整合到 1 节补充课。未扩充旧课正文。

## 编排与事实边界

- 吸收前检查 L17.2 / L17.8 / L17.12：198 / 262 / 194 行，默认上限 400。新增内容具备 3 个以上独立主题，因此单独编为 17.13，不把整份案例塞入已有课。
- 已检查最大现有编号为 17.12；地图使用字符串 `"17.13"`，新课 191 行，无新增 OVERSIZE。
- 公开文章没有发布可安装 Skill 或 Playground 开源项目；原文提到可能日后做工具，课程未将其写成现有下载能力。
- 原文模型评价、设计师般观感和迭代取舍属于个人经验，不当作模型基准测试、业务效果或所有项目必须遵循的规则。
- 原文的多版本与后期组件工作并行是作者案例，不授权本次使用子代理；本次未委派 Agent。
- 植物交换活动页、参数 HTML 片段、变量导出要求、实验目录、停止条件及无障碍验收均为课程原创练习或补充建议，正文明确区分。
- 不复制原文长段落、图片、游戏资产、视频或站点源码；以简述和来源链接支持教学。
- 同步地图、教学 Skill、相邻页脚及首页，并修正 L17.12 的交互式下一课选项。

## 验证

完整 `npm run site:check` 通过（Node 24.19.0、Go 1.27.3、Hugo Extended 0.165.0）：

- 课程计数、教学入口、导航、首页同步，补充课总数为 59。
- 项目测试 736 项、网站回归 11 项、桌面与手机 Chromium 测试 14 项全部通过。
- 本地与生产地址构建均通过，校验 95 节课程、160 个 HTML 页面、19,404 处站内链接与资源引用。
- `git diff --check` 通过，无新增超限课程。

检查验证 cc4pm 课程与网站，不代表已复现 Railcode 官网、作者所有弃案或新练习的完整产品。
