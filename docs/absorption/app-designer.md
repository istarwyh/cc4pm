# App Designer 公开方法吸收记录

- 日期：2026-10-30
- 规范：[知识吸收命令](../../.claude/commands/absorb.md)
- 作者：Tobia Donadon
- 来源：[App Designer 公开介绍](https://www.tobiadonadon.com/projects/construct/material/skills/app-designer)
- 本次读取的页面 HTML SHA-256：`3caa883ec4e49e15cf3f3a8416cb8311bbdf2b8c2df262fa9d0f78b34da7310b`。页面未提供版本号；哈希仅用于本次读取标识，不代表内容永久不变。
- 产物：[Lesson 17.12](../../guide/lessons/stage-3/lesson-1.12.md)

## 来源边界

公开页包含方法概述、案例图片、前后对比和邮件领取表单。可核对的内容是：以真实概念贯穿视觉选择；主屏探索三个方向后选定；以 iPhone 分辨率和 Apple 字体渲染各屏，检查 AI 设计痕迹并由独立 critic 评分；产品定位为 Mac 上的 Claude Code 免费 Skill。

本次没有提交邮箱或申请邮件，没有取得原版 Skill 包，也未找到公开的直接下载入口。因此不声称已安装或运行作者 Skill，不虚构触发命令、文件结构、内部评分标准和依赖。不将“免费”解释成有开源许可，不把静态宣传对比当成受控实验。

课程只简述公开方法并链接来源；工具箱案例、提示词、交付目录、审查维度与验收表均为 cc4pm 自行设计的练习，已在正文明确区分。未复制作者案例图片或完整 Skill 内容，也未宣称界面辨识度必然改善转化或营收。

## 差距矩阵

材料深度以公开页为准。页面只有说明和展示，没有公开完整实操协议，故不标为 hands-on。

| topic | 中文名称 | depth | relevance | 课程现状 | 动作 |
|-------|----------|-------|-----------|----------|------|
| anti-ai-slop | 识别 AI 界面惯性 | explain | high | L17.4 已详解，包含 kill-ai-slop | 跳过通用规则，仅引用 |
| style-to-ai-prompt | 向 AI 表达设计方向 | mention | high | L17.10 已覆盖 | 跳过通用提示词讲解 |
| playwright-design-verification | 原型渲染与检查 | mention | high | L17.2 已覆盖 | 跳过工具入门，仅引用 |
| app-designer-public-method | App Designer 公开方法与范围 | explain | high | 未覆盖 | 新增 L17.12 来源说明 |
| real-world-design-concept | 以真实事物建立设计概念 | explain | high | 风格课程未系统说明此入口 | 新增 L17.12 Step 1 |
| concept-to-visual-rules | 概念贯穿字、色、动效 | explain | high | 未覆盖此约束链 | 新增 L17.12 Step 1 |
| three-direction-main-screen-exploration | 主屏先探索三个方向 | explain | high | 有 variants，未覆盖该选择流程 | 新增 L17.12 Step 2 |
| device-font-rendering-evidence | 设备分辨率与字体渲染依据 | explain | high | 未覆盖作者此评审前提 | 新增 L17.12 Step 3 |
| independent-visual-design-critic | 独立视觉评审 | explain | high | 有自动校验，未覆盖此角色分离 | 新增 L17.12 Step 4 |
| selected-direction-screen-continuity | 选定方向后逐屏保持概念连贯 | mention | high | 未明确与三版主屏探索串联 | 新增 L17.12 Step 5，细化部分标为课程练习 |

提取 10 项：已覆盖跳过 3 项，无关跳过 0 项，7 项整合到一节补充课；未扩充已有课正文。

## 编排与预算

- 吸收前检查：L17.2 为 198 行，L17.4 为 381 行，L17.7 为 270 行，L17.11 为 311 行；默认上限为 400。
- L17.4 余量仅 19 行，且本材料具备 3 个以上独立主题，按规范另建补充课。
- 原最大补充编号为 17.11；新增 `stage-3/lesson-1.12.md`，地图编号为字符串 `"17.12"`，与 stage-5 的同文件名按阶段区分。
- 新课 194 行，不新增 OVERSIZE；旧课程超限问题不混入本次修改。
- 课程地图、教学 Skill、课末导航、首页由同步脚本生成；额外修正 L17.11 的交互式“下一课”选项，使其进入新课。

## 验证范围

本次 PR 同时包含 DigUp 吸收与本课。合并改动后的完整 `npm run site:check` 通过（Go 1.27.3、Hugo Extended 0.165.0、Node 24.19.0）：

- 课程数量、导航、教学 Skill 和首页同步，补充课总数为 58。
- 项目测试 736 项通过，网站回归 11 项通过。
- 桌面与手机 Chromium 浏览器测试共 14 项通过。
- 本地地址与生产地址构建均通过；校验 94 节课程、159 个 HTML 页面、19,160 处站内链接与资源引用。
- `git diff --check` 通过；两节新课均不超默认 400 行限制。

这些检查验证 cc4pm 课程与网站，不代表运行过作者邮件发放的 Skill，也不代表已经完成课程里自建 App 的实操评测。
