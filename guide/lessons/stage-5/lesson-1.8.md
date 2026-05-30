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

OpenAI 生图插件把这件事拆成两条路：

```
OpenAI-compatible 路线
  用户提示词 → /openai-plugin:image-skill
    → openai CLI → /v1/images/generations
      → b64_json → 本地 PNG

Codex OAuth 路线
  用户提示词 → /openai-plugin:codex-image
    → codex exec → 内置 image_gen
      → ~/.codex/generated_images/ → 项目目录 PNG
```

这不是“多一个命令”，而是把生图从一次性网页操作，变成 Claude Code 可以编排、校验、归档的本地工作流。

## 学习目标

- 安装 `openai-plugin`，理解插件市场与命名空间触发方式
- 用 OpenAI CLI 路线生成图片，并把 `b64_json` 安全解码为本地 PNG
- 理解 Provider Memory：第一次成功后记住 provider，避免每次重复配置
- 区分 OpenAI-compatible API Key 路线与 Codex OAuth 路线
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

在 Claude Code 中触发时使用命名空间：

```text
/openai-plugin:image-skill 生成一张暖色系的产品发布封面
/openai-plugin:codex-image --size 1024x1024 --quality auto 生成一张极简产品插画
```

如果刚安装完没有出现命令，执行：

```text
/reload-plugins
```

## Step 2：OpenAI-compatible 路线

`image-skill` 走本地 `openai` CLI。它适合你已经有 OpenAI-compatible 接口的场景，比如 Lesson 23.6 里的 CLIProxyAPI。

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

## Step 3：Provider Memory

第一次成功生成后，Skill 会把 provider 写入：

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

## Step 4：Codex OAuth 路线

`codex-image` 适合“不想管理 OpenAI API Key”的场景。它通过 `codex login` 的 OAuth 登录态，让 `codex exec` 调用 Codex 内置的 `image_gen` 工具。

关键区别：**Codex OAuth token 不能当作 OpenAI REST API Key 使用**。不要拿它去请求 `/v1/images/generations`，应该让 Codex CLI 自己处理认证。

基础检查：

```bash
which codex 2>/dev/null && codex --version 2>/dev/null || echo "NOT_FOUND"
codex login status 2>&1
```

触发生成：

```text
/openai-plugin:codex-image --size 1024x1024 --quality auto --out generated/openai-images 生成一张暖色系产品封面
```

它的内部链路是：

```text
codex exec
  → 内置 image_gen
  → ~/.codex/generated_images/<session>/
  → 复制到你指定的 --out 目录
```

输出文件使用时间戳命名，避免覆盖已有素材：

```text
codex-image-20260525-223010.png
codex-image-20260525-223010-1.png
codex-image-20260525-223010-2.png
```

## Step 5：把生图纳入产品素材流

产品主理人不需要记住所有命令，只需要把生图当成一个可复用的素材节点：

| 场景 | 推荐路线 | 输出 |
|------|----------|------|
| 微信公众号封面 | `image-skill` + 固定 provider | `generated/openai-images/*.png` |
| 产品原型占位图 | `codex-image` | 项目内 PNG |
| PPT 配图套件 | Claude Code 编排多次调用 | 按页码组织的图片组 |
| 设计方向探索 | `image-skill` 连续生成 3 个变体 | 时间戳文件组 |
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

安装后常用触发方式是：

```text
/lovstudio:any2deck path/to/content.md --style sketch-notes --lang zh --slides 10
/lovstudio:any2deck path/to/content.md --audience executives
/lovstudio:any2deck path/to/content.md --outline-only
/lovstudio:any2deck path/to/content.md --prompts-only
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

这就是智能体编排的价值：Claude Code 先把“我要做个 PPT”拆成叙事结构、页数、受众、视觉风格，再让生图能力按页执行。底层可以是 OpenAI-compatible 图片 API，也可以是 Codex 内置 `image_gen`；上层不变，都是“有组织地生成一套素材”。

你可以把 `any2deck` 看成三层叠加：

| 层级 | 负责什么 | 例子 |
|------|----------|------|
| 内容层 | 把文章/笔记拆成 Deck 结构 | `outline.md` |
| 视觉层 | 给每页生成一致风格的提示词 | `prompts/03-market-gap.md` |
| 交付层 | 合并为 PPTX/PDF，叠加 logo/二维码 | `merge-to-pptx.ts`、`apply-branding.py` |

典型场景：把一篇产品分析文章转成 10 页中文分享 Deck，用 `bold-editorial` 做发布感，用 `--logo` 叠品牌标识，再导出 PPTX 给团队继续编辑。

## 三条安全纪律

1. **不要粘贴 `b64_json`**：它会污染上下文窗口，也不方便审查。直接解码到文件。
2. **不要把真实 API Key 写入课程、仓库或截图**：用环境变量名，或只保存本地测试 key。
3. **不要覆盖旧图**：所有输出使用时间戳文件名，生成后用 `file` 验证格式。

## 实操练习

### 练习 1：跑通 OpenAI CLI 生图

```text
1. 让 Claude 检查 openai CLI 是否可用
2. 让 Claude 检查 provider 的 models list
3. 生成一张 1024x1024 的产品封面
4. 用 file 验证输出是 PNG
5. 记录 Prompt / Model / Size / Saved file
```

### 练习 2：跑通 Codex OAuth 生图

```text
1. 让 Claude 检查 codex CLI 与登录状态
2. 用 /openai-plugin:codex-image 生成一张原型插画
3. 指定 --out generated/openai-images
4. 检查输出文件没有覆盖已有图片
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
3. 运行 /lovstudio:any2deck product-analysis.md --style bold-editorial --lang zh --slides 10
4. 检查 slide-deck/{topic-slug}/ 下的 outline、prompts、PNG、PPTX、PDF
```

观察：Claude Code 是否先组织叙事，再逐页调用生图能力，而不是把整篇文章一次性丢给图片模型。

## FAQ

**Q：我该用 `image-skill` 还是 `codex-image`？**

如果你已经有 OpenAI-compatible provider，用 `image-skill`，它更直接，也能复用 Provider Memory。如果你只想用 Codex 登录态，不想处理 API Key，用 `codex-image`。

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
