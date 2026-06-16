---
number: 24.8
title: "OpenAI 生图 Skill——从提示词到本地 PNG"
short_title: "OpenAI 生图 Skill"
stage: stage-5
parent_number: 24
supplementary: true
---

# Lesson 24.8: OpenAI 生图 Skill——从提示词到本地 PNG

> **前置课程**：Lesson 6（命令与技能系统）、Lesson 23.6（CLIProxyAPI 实战）、Lesson 24.2（插件架构与 SDK）
>
> **预计用时**：18 分钟
>
> **适合人群**：需要快速生成产品配图、封面图、原型素材，并希望把生图过程沉淀成可复用工作流的产品主理人

## 为什么生图也要做成 Skill

直接在网页里生图可以解决一次性需求，但产品主理人真正需要的是**可复现的素材生产线**：提示词、模型、尺寸、输出路径、文件校验都能稳定复用。

更重要的是，Claude Code 本身是智能体。它不是把你的原话机械转交给生图模型，而是先理解产品目标、受众、场景和视觉约束，再把一句粗糙需求扩写成可执行的图片描述；还可以批量调用生图工具，为 PPT、发布物料、产品演示生成一组有顺序、有分工的图片。

### 从“图片终点”到“视觉中间件”

`codex-image` 的想象力不在于 Codex 能单独画图，因为 Codex 原本就可以通过 prompt 画图；真正的变化是：当它被包装成可触发、可配置、可归档的 Skill 之后，图片就不再是一次生成的终点，而变成了 Agent 工作流里的中间件。

过去的链路是：

```text
prompt → image
```

现在的链路是：

```text
content / code / data / idea
  → visual plan
    → image variants
      → evaluation
        → selection
          → remix
            → document / deck / UI / test dataset / brand assets
```

这会带来六类新能力，每一类都可以由 `codex-image` 生成对应的视觉资产：

| 能力 | 变化 | Codex 示意图 |
|------|------|-------------|
| 批量视觉生产 | 一篇文章、一份报告、一个活动方案，可以自动变成封面、长图、PPT、社媒图、宣传图 | ![批量视觉生产](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-batch-production.png) |
| 视觉探索自动化 | 同一个产品概念可以同时展开科技感、编辑感、手绘感、企业感、游戏感等多个方向，再比较和延展 | ![视觉探索自动化](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-exploration.png) |
| 视觉一致性工程化 | 品牌色、构图、字体气质、禁止元素可以被固定下来，每次生成都记录 prompt、model、size、file | ![视觉一致性工程化](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-consistency-engineering.png) |
| 视觉测试和反馈循环 | Agent 不只生成图，还能判断网页截图是否接近目标、PPT 是否统一、文字是否遮挡、页面是否跑题 | ![视觉测试和反馈循环](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-feedback-loop.png) |
| 合成数据和模拟场景 | 批量生成 UI 状态、表单、票据、病历样例、异常截图、多语言排版测试图，用于 OCR、CV、审核和自动化测试 | ![合成数据和模拟场景](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-synthetic-data.png) |
| 视觉成为思考方式 | Codex 可以把问题画出来，把方案展开成图，把复杂系统压缩成视觉结构 | ![视觉成为思考方式](https://xiaohui-zhangjiakou.oss-cn-zhangjiakou.aliyuncs.com/cc4pm/guide/lessons/assets/lesson-24.8/codex-visual-middleware-visual-thinking.png) |

所以，这一课不是把 Codex 当成“画图工具”，而是把它变成**可编排的视觉输出器**：它能把文本、数据、代码、网页和业务目标，转译成可传播、可比较、可测试、可复用的视觉资产。

OpenAI 生图插件把这件事拆成两条路，但默认优先推荐 **Codex OAuth 路线**：它复用 Codex 自己的登录体系，不需要额外管理图片 API Key。只有当你已经有可用的 API provider，或像 CLIProxyAPI 这样的 OpenAI-compatible 工具时，再优先考虑 `image-skill`。

```
Codex OAuth 路线（默认优先）
  用户提示词 → /openai-plugin:codex-image
    → codex exec → 内置 image_gen
      → ~/.codex/generated_images/ → 项目目录 PNG

OpenAI-compatible 路线（已有 provider / CLIProxyAPI 时使用）
  用户提示词 → /openai-plugin:image-skill
    → openai CLI → /v1/images/generations
      → b64_json → 本地 PNG
```

这不是“多一个命令”，而是把生图从一次性网页操作，变成 Claude Code 可以编排、校验、归档的本地工作流。路线选择也很简单：默认先走 `codex-image`；如果你已经有 API provider 或 CLIProxyAPI，再走 `image-skill`。

## 学习目标

- 安装 `openai-plugin`，理解插件市场与命名空间触发方式
- 优先用 `codex-image` 路线生成图片，复用 Codex 自己的登录体系
- 在已有 API provider 或 CLIProxyAPI 时，用 `image-skill` 路线生成图片，并把 `b64_json` 安全解码为本地 PNG
- 理解 Provider Memory：`image-skill` 第一次成功后记住 provider，避免每次重复配置
- 让 Claude Code 编排批量生图，为 PPT、发布素材和原型演示生成有组织的图片组
- 掌握生图输出的三条安全纪律：不泄露 key、不粘贴 base64、不覆盖文件

## Step 1：安装插件

这个生图能力不是单独安装 `image-skill`，而是安装 `openai-plugin`，它包含两个 Skill：`image-skill` 和 `codex-image`。

```bash
# 添加插件市场
claude plugin marketplace add istarwyh/agent-plugins

# 安装 OpenAI 生图插件
claude plugin install openai-plugin@agent-plugins --scope user

# 确认已启用
claude plugin list
```

在 Claude Code 中触发时，优先用自然语言；命名空间只用于消歧，参数不是必填：

```text
帮我用 codex-image 生成一张暖色系的产品发布封面，保存到 generated/openai-images
/openai-plugin:image-skill 生成一张极简产品插画
```

尺寸、质量、数量、输出目录都可以直接说出来。

如果刚安装完没有出现命令，执行：

```text
/reload-plugins
```

## Step 2：Codex OAuth 路线（默认优先）

`codex-image` 是默认推荐路线。它复用 `codex login` 的 OAuth 登录态，让 `codex exec` 调用 Codex 内置的 `image_gen` 工具，不需要你额外管理 OpenAI API Key。

关键区别：**Codex OAuth token 不能当作 OpenAI REST API Key 使用**。不要拿它去请求 `/v1/images/generations`，应该让 Codex CLI 自己处理认证。

基础检查：

```bash
which codex 2>/dev/null && codex --version 2>/dev/null || echo "NOT_FOUND"
codex login status 2>&1
```

触发生成时直接说清楚目标；需要消歧时加命名空间即可：

```text
帮我用 codex-image 生成一张暖色系产品封面，保存到 generated/openai-images
/openai-plugin:codex-image 生成一张暖色系产品封面，保存到 generated/openai-images
```

默认尺寸和质量由 Skill 处理；要覆盖默认值，用自然语言补充“3 张、1536x1024、质量 high”。

它的内部链路是：

```text
codex exec
  → 内置 image_gen
  → ~/.codex/generated_images/<session>/
  → 复制到你指定的输出目录
```

输出文件使用时间戳命名，避免覆盖已有素材：

```text
codex-image-20260525-223010.png
codex-image-20260525-223010-1.png
codex-image-20260525-223010-2.png
```

### `codex-image` 的执行细节

从实现上看，`codex-image` 不是直接调用 OpenAI 图片 REST API，而是一个 **Claude Code Skill 包装的 Codex 子代理调用器**。

完整链路是：

```text
你的自然语言请求
  → Claude Code 触发 codex-image Skill
    → Skill 解析 prompt / size / quality / count / out
      → Bash 调用 codex exec
        → Codex CLI 使用自己的 OAuth 登录态
          → Codex 内置 image_gen 工具生成图片
            → 图片先落到 ~/.codex/generated_images/<session>/
              → 再复制到项目指定目录
```

也就是说，Claude Code 负责理解需求、抽取参数和组织命令；Codex CLI 负责认证和调用内置 `image_gen`；Skill 负责路径、命名、防覆盖、校验和结果汇报。

一次典型执行会被组织成类似这样的命令：

```bash
codex exec "Perform these tasks:
1. Use the built-in image_gen tool to generate image files.
2. Prompt: '<最终图片提示词>'
3. Size: 1536x1024
4. Quality: high
5. Count: 3
6. Copy each generated image to '<输出目录>'.
7. Use 'codex-image-<timestamp>.png' for one image. For multiple images, use suffixed filenames.
8. Do not overwrite an existing file.
9. Print the saved file path and byte size for each image." \
  -C "<项目根目录>" \
  -s workspace-write \
  -c 'model_reasoning_effort="medium"' \
  --skip-git-repo-check
```

这里有两个容易误解的点：

1. **Codex OAuth 不是 OpenAI REST API Key**：不要把 Codex 登录 token 拿去请求 `/v1/images/generations`，它只应该通过 `codex exec` 间接使用。
2. **`codex-image` 不保存真实 API Key**：认证状态由 Codex CLI 管理，所以它不需要写入 Provider Memory。

工程化实现时还要注意：`prompt`、`out`、文件名等来自用户输入的值必须安全处理，不能把未经转义的字符串直接拼进 shell 命令。课程里展示的是链路心智模型，真实 Skill 执行时要优先保证命令构造安全。

## Step 3：OpenAI-compatible 路线（已有 provider / CLIProxyAPI 时使用）

`image-skill` 走本地 `openai` CLI。它不是默认起步路线，而是适合你已经有 OpenAI-compatible API provider，或者已经跑通 Lesson 23.6 里的 CLIProxyAPI 的场景。

先让 Claude 检查 CLI 和 provider：

```bash
which openai && openai --version
openai --api-key sk-local-gemini \
  --base-url http://127.0.0.1:8317/v1 \
  models list
```

使用 CLIProxyAPI 时，默认参数是：

```text
OPENAI_API_KEY=sk-local-gemini
OPENAI_BASE_URL=http://127.0.0.1:8317/v1
OPENAI_IMAGE_MODEL=gpt-image-2
```

真正生成图片时，不要把完整 JSON 打到屏幕上。图片响应里有很大的 `b64_json`，正确做法是直接抽取、解码、写入文件：

```bash
mkdir -p generated/openai-images
OUT="generated/openai-images/gpt-image-2-$(date +%Y%m%d-%H%M%S).png"
PROMPT="A warm editorial product cover for an AI product maker workflow, clean composition"

openai --api-key sk-local-gemini \
  --base-url http://127.0.0.1:8317/v1 \
  images generate \
  --model gpt-image-2 \
  --prompt "$PROMPT" \
  --size 1024x1024 \
  --format json \
  --transform 'data.0.b64_json' \
  --raw-output \
  | base64 -D > "$OUT"

file "$OUT"
```

Linux 上把 `base64 -D` 换成 `base64 -d`。

## Step 4：Provider Memory

Provider Memory 主要服务 `image-skill` 路线。第一次成功生成后，Skill 会把 provider 写入：

```text
~/.claude/openai-plugin/image-skill-provider.json
```

CLIProxyAPI 的记录形态是：

```json
{
  "provider": "cliproxyapi",
  "api_key": "sk-local-gemini",
  "base_url": "http://127.0.0.1:8317/v1",
  "model": "gpt-image-2",
  "size": "1024x1024"
}
```

这个设计的价值是减少重复决策：下一次用户只说“生成一张封面”，Claude 就知道继续用同一个 provider、同一个模型、同一个默认尺寸。

但有一条边界：真实第三方 API Key 不应该直接写入磁盘。其他 provider 更适合保存环境变量名：

```json
{
  "provider": "custom-openai-compatible",
  "api_key_env": "OPENAI_API_KEY",
  "base_url": "https://example.com/v1",
  "model": "image-model-name",
  "size": "1024x1024"
}
```

如果你走的是默认优先的 `codex-image` 路线，认证状态由 Codex CLI 管理，不需要把 OpenAI-compatible provider 写入这份 memory。

## Step 5：把生图纳入产品素材流

产品主理人不需要记住所有命令，只需要把生图当成一个可复用的素材节点：

| 场景 | 推荐路线 | 输出 |
|------|----------|------|
| 微信公众号封面 | `codex-image`（默认） | `generated/openai-images/*.png` |
| 产品原型占位图 | `codex-image`（默认） | 项目内 PNG |
| PPT 配图套件 | Claude Code 编排多次调用 `codex-image` | 按页码组织的图片组 |
| 已有 CLIProxyAPI 的封面 | `image-skill` + 固定 provider | `generated/openai-images/*.png` |
| 设计方向探索 | `codex-image` 连续生成 3 个变体；已有 provider 时可用 `image-skill` | 时间戳文件组 |
| 发布素材归档 | 任一路线 + `file` 校验 | 可追踪素材目录 |

建议每次生图都留下四个字段：

```text
Prompt: <最终提示词>
Model: <实际模型>
Size: <尺寸>
Saved file: <本地路径>
```

这四个字段让你之后可以复盘：哪种提示词稳定、哪个模型适合封面、哪些尺寸适合不同平台。

## Step 6：any2deck，把素材流升级成 Deck 流

沿着这个思路再往前一步，就是 `lovstudio-any2deck`：它不只是生图，而是把一份内容变成一组可以阅读、分享、导出 PPTX/PDF 的幻灯片图片。

安装方式有两种写法：

```bash
# 交互式安装
npx lovstudio skills add any2deck

# 课程/团队环境推荐：全局安装并自动确认
npx lovstudio skills add any2deck -g -y
```

安装后也优先自然语言触发；需要消歧时加命名空间：

```text
帮我把 path/to/content.md 做成 10 页中文 sketch-notes 风格 Deck，并导出 PPTX/PDF
/lovstudio:any2deck 先只生成大纲和逐页提示词，不要生成图片
```

它的工作流正好解释了“为什么要在 Claude Code 里生图”：

```text
原始内容
  → Claude Code 分析受众、语言、页数、风格
    → outline.md
      → prompts/01-slide-cover.md ...
        → 逐页生成 PNG
          → merge-to-pptx.ts / merge-to-pdf.ts
            → PPTX + PDF
```

输出目录会保持可追踪：

```text
slide-deck/{topic-slug}/
├── source-{slug}.md
├── outline.md
├── prompts/
│   └── 01-slide-cover.md, 02-slide-{slug}.md, ...
├── 01-slide-cover.png, 02-slide-{slug}.png, ...
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

这就是智能体编排的价值：Claude Code 先把“我要做个 PPT”拆成叙事结构、页数、受众、视觉风格，再让生图能力按页执行。底层可以默认使用 Codex 内置 `image_gen`，也可以在已有 provider 或 CLIProxyAPI 时切换到 OpenAI-compatible 图片 API；上层不变，都是“有组织地生成一套素材”。

你可以把 `any2deck` 看成三层叠加：

| 层级 | 负责什么 | 例子 |
|------|----------|------|
| 内容层 | 把文章/笔记拆成 Deck 结构 | `outline.md` |
| 视觉层 | 给每页生成一致风格的提示词 | `prompts/03-market-gap.md` |
| 交付层 | 合并为 PPTX/PDF，叠加 logo/二维码 | `merge-to-pptx.ts`、`apply-branding.py` |

典型场景：把一篇产品分析文章转成 10 页中文分享 Deck，说明使用 bold-editorial 风格并叠加品牌标识，再导出 PPTX 给团队继续编辑。

## 三条安全纪律

1. **不要粘贴 `b64_json`**：它会污染上下文窗口，也不方便审查。直接解码到文件。
2. **不要把真实 API Key 写入课程、仓库或截图**：用环境变量名，或只保存本地测试 key。
3. **不要覆盖旧图**：所有输出使用时间戳文件名，生成后用 `file` 验证格式。

## 实操练习

### 练习 1：跑通 Codex OAuth 生图

```text
1. 让 Claude 检查 codex CLI 与登录状态
2. 自然语言触发 codex-image，生成一张原型插画
3. 说明“保存到 generated/openai-images”
4. 检查输出文件没有覆盖已有图片
5. 记录 Prompt / Model / Size / Saved file
```

### 练习 2：已有 provider 时跑通 OpenAI CLI 生图

```text
1. 让 Claude 检查 openai CLI 是否可用
2. 让 Claude 检查 provider 的 models list
3. 自然语言触发 image-skill，生成一张 1024x1024 的产品封面
4. 用 file 验证输出是 PNG
5. 记录 Prompt / Model / Size / Saved file
```

### 练习 3：做三张变体

```text
用同一个主题生成 3 张不同风格：
- editorial cover
- minimalist product illustration
- warm photographic scene

比较哪一张最适合你的产品发布场景。
```

### 练习 4：把文章变成 10 页 Deck

```text
1. 安装 any2deck：npx lovstudio skills add any2deck -g -y
2. 准备一份产品分析 markdown
3. 自然语言触发 any2deck：把 product-analysis.md 做成 10 页中文 bold-editorial 风格 Deck
4. 检查 slide-deck/{topic-slug}/ 下的 outline、prompts、PNG、PPTX、PDF
```

观察：Claude Code 是否先组织叙事，再逐页调用生图能力，而不是把整篇文章一次性丢给图片模型。

## FAQ

**Q：我该用 `codex-image` 还是 `image-skill`？**

默认先用 `codex-image`，因为它复用 Codex 自己的登录体系，不需要额外管理 API Key。如果你已经有 OpenAI-compatible provider，或者已经跑通 CLIProxyAPI，再用 `image-skill`，它更适合复用固定 provider、模型和尺寸。

**Q：为什么不能直接把 base64 发给用户？**

base64 很长，会挤占上下文窗口，也让用户无法直观看图。生图结果应该作为文件交付，路径和元数据留在回答里。

**Q：Provider Memory 会不会泄露密钥？**

本地 `sk-local-gemini` 是 CLIProxyAPI 的本地测试 key；真实 provider 应保存 `api_key_env`，不要把真实 API Key 写进 JSON 文件。

**Q：这个 Skill 和 Lesson 17 的设计课有什么关系？**

Lesson 17 教你确定品牌、风格和视觉方向；本课教你把这些方向变成本地可复用的图片资产。前者决定“该长什么样”，后者负责“稳定产出并归档”。

**Q：`any2deck` 和单张生图有什么区别？**

单张生图解决“这一张图长什么样”。`any2deck` 解决“这组图如何构成一个叙事”。它先产出大纲和逐页提示词，再批量生图并合并 PPTX/PDF，更适合课程、路演、产品说明和社媒长图。

---

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 返回 Lesson 24.2：插件架构与 SDK
- 前往 Lesson 25：完整项目实战
- 返回主菜单

---
*阶段 5 | Lesson 24.8/26 | 上一课: Lesson 24.7 - 微信读书 Skill | 下一课: Lesson 25 - 完整项目实战*
