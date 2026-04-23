---
name: wechat-article
description: "Convert HTML/Markdown content to WeChat Official Account (微信公众号) compatible format with magazine-style editorial design, all inline styles, no JavaScript. Use when: (1) user wants to publish content to WeChat / 微信公众号, (2) user mentions 壹伴/YiBan source code editor, (3) user wants to convert existing HTML for WeChat. Outputs ready-to-paste HTML for 壹伴's '编辑源代码' feature."
---

# 微信公众号文章转换

## 转换流程

1. **读取源内容** — HTML、Markdown 或纯文本
2. **剥离外壳** — 去掉 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>`
3. **应用转换规则**（见下）
4. **应用编辑排版规则**（见下）
5. **包裹根 section** + 追加 `<mp-style-type>` 标记
6. **保存为 `.wechat.html`** 统一存放在用户主目录下的 `wechat-exports` 文件夹中（路径：`~/wechat-exports/文件名.wechat.html`），不覆盖源文件，确保项目目录整洁。

## 强制转换规则

### 完全删除
`<style>`、`<script>`、`<link>`、事件处理器、`<form>`、`<input>`、`<select>`

### 替换
- `<div>` → `<section>`（微信对 section 渲染更稳定）
- CSS 变量 `var(--xxx)` → 硬编码色值
- `<ul>`/`<ol>` → `<p>` + `•` / `1.` 前缀（列表渲染不一致）
- 外部 `<img src>` → `<!-- 请在微信后台上传图片 -->`
- **超链接 `<a href>`** → 删除链接，URL 移至文末「参考文献」区以 `[1]` `[2]` 脚注形式列出；正文对应处加 `<sup>[1]</sup>` 上标

### 全部内联
每个元素必须带 `style=""`。不允许 class 选择器、外部 CSS。

### CSS 兼容性
详见 [references/css-compat.md](references/css-compat.md)。

**安全：** `font-size`, `font-weight`, `color`, `background`, `background-color`, `border`, `border-radius`, `border-left`, `padding`, `margin`, `text-align`, `line-height`, `letter-spacing`, `box-shadow`, `text-shadow`, `opacity`, `display: block/inline/inline-block/none`, `max-width`, `width`（仅 px）

**禁止：** `display: flex/grid`, `position`, `float`, `transform`, `animation`, `transition`, CSS 变量, `calc()`, `@media`, `@font-face`, 百分比宽度

## 编辑排版规则（杂志风）

参考 New York Magazine / Monocle 的编辑排版语言：

### 色彩 — 低饱和与主理人蓝
- 禁止使用高饱和 UI 色（如 `#059669`、`#d97706`、`#e11d48`）
- 使用低饱和杂志色：`#8fbc8f`（绿）、`#c4a45a`（黄）、`#b05050`（红）、`#8b7355`（棕）
- **亮点强调色**：使用 `#0052ff` (rgb(0, 82, 255)) 作为主理人金句、核心结论的强调色。
- 文字只用灰阶：`#111` `#333` `#555` `#888` `#999` `#aaa`

### 排版 — 亮点扫描法
- 根 section `padding: 0`，内容区 `padding: 0 24px`，最大化移动端利用率
- **核心结论加粗并上色**：对“强制重启”、“生成器-评估器分离”等核心逻辑，使用 `font-weight:bold; color:#0052ff;`。
- `line-height: 1.8`（不要 2.0，太松）
- `letter-spacing: 0.5px`（中文黄金间距）
- 无圆角或极小圆角（`border-radius: 0` 或 `4px`）
- 大分隔用 `3px solid #222` 粗黑线，小分隔用 `1px solid #ddd`

### 字体层级
- 大标题：`28px / font-weight:800`
- section 标题：`20px / font-weight:800`
- section 小标签：`11px / color:#999 / letter-spacing:2px`（中文加空格，如「三 条 红 线」）
- 正文：`15px / color:#333`
- 辅助：`13-14px / color:#555-#888`
- 引用出处：`12px / color:#aaa / text-align:right`

### 语言规范
- 除 logo（CC4PM）和专有名词（Claude、Anthropic 等）外，全部使用中文
- section 小标签用中文加空格（`情 绪 光 谱`），不用英文大写
- 微信不允许超链接，所有 URL 放到文末「参考文献」区

## 文案风格

### 首段吸引力
不要用「Anthropic 发表了一篇论文……」式的学术导入。用读者自己的场景开头：

```
你有没有发现，不管 AI 干了什么，你就说一句「再想想」
——AI 几乎总是能找出自己的错误。
这是为什么？
```

### 结构节奏
**场景钩子 → 连续提问 → 科学回答 → 实操工具 → 首尾呼应**

- 开头抛出 3-4 个读者关心的问题
- 正文逐步回答
- 结尾用「回到开头的问题」逐一收束，形成闭环

### 语气
- 像一个资深开发者在茶歇时跟同事聊天，不像在写论文
- 避免 AI 味表达：「揭示了」「值得注意的是」「说人话」「让我们」
- 每个 section 之间用一句人话过渡，不要突然跳到下一个话题
- 引用原文后加一句自己的解读（「也就是说……」「简单说……」）

### 根模板（移动端极致优化版）
```html
<section style="max-width:590px; margin:0 auto; padding:0; font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue','Microsoft YaHei',sans-serif; font-size:15px; line-height:1.8; color:#333; letter-spacing:0.5px; text-align:justify; margin-top:0;">
  <!-- content -->
</section>
<p style="display:none;"><mp-style-type data-value="3"></mp-style-type></p>
```
*注：代码开头不得有任何换行或空格。*

## 组件模式（新增 & 优化）

**封面区（留白优化）：**
```html
<section style="padding:20px 24px 36px; text-align:center; border-bottom:3px solid #222;">
  <p style="font-size:11px; color:#999; letter-spacing:3px; margin:0 0 16px;">CC4PM · 第 X 课</p>
  <h1 style="font-size:28px; font-weight:800; color:#111; line-height:1.3; margin:0 0 12px;">标题</h1>
  <p style="font-size:14px; color:#888; margin:0; font-style:italic;">副标题</p>
</section>
```

**原生 SVG 矢量图表：**
优先使用 SVG 代码替代 PNG 图片，确保矢量无损且无需上传。
```html
<section style="margin: 20px 24px; overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eee;">
  <svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 100%; height: auto;">
    <!-- 坐标轴与渐变定义 -->
    <defs>
      <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#b05050;" />
        <stop offset="100%" style="stop-color:#0052ff;" />
      </linearGradient>
    </defs>
    <!-- 内容绘制 -->
  </svg>
</section>
```

## 编辑排版高级准则（2026 版）

### 视觉节奏：逻辑前置，模型收束
- **禁止模型置顶**：不要在第一屏就放复杂的图表。
- **情绪钩子**：先用 2-3 个 Section 描述现状、痛点和数据（脱水），引发读者共鸣。
- **视觉收束**：在文章中段或结论前，用原生 SVG 图表进行科学总结。

### 移动端兼容性暗雷
- **零换行规范**：根 section 标签必须紧贴代码编辑器第一行，否则微信会强制插入空白占位符。
- **Padding 呼吸感**：封面顶部 Padding 设为 `20px` 最具高级感，超过 `40px` 会产生加载失败的错觉。
- **行高限制**：正文使用 `line-height: 1.8`，SVG 内部 text 使用 `tspan` 包裹以增强渲染稳定性。

**section 标题：**
```html
<p style="font-size:11px; color:#999; letter-spacing:2px; margin:0 0 8px;">小 标 签</p>
<p style="font-size:20px; font-weight:800; color:#111; margin:0 0 12px;">大标题</p>
```

**引言块：**
```html
<section style="padding:0 24px 32px;">
  <p style="font-size:17px; font-style:italic; color:#444; line-height:1.9; margin:0 0 8px; text-indent:2em;">"引言内容"</p>
  <p style="font-size:12px; color:#aaa; margin:0; text-align:right;">— 出处</p>
</section>
```

**警告框：**
```html
<section style="background:#f9f4f4; padding:20px 24px; border-left:3px solid #c0392b;">
  <p style="font-size:14px; color:#555; margin:0;">内容</p>
</section>
```

**左色条条目（用于列表/档位）：**
```html
<section style="border-left:3px solid #8fbc8f; padding:12px 0 12px 16px; margin:0 0 4px;">
  <p style="font-size:12px; font-weight:700; color:#8fbc8f; margin:0 0 2px;">编号 · 名称</p>
  <p style="font-size:14px; color:#333; margin:0 0 2px;">引用话术</p>
  <p style="font-size:12px; color:#999; margin:0;">说明</p>
</section>
```

**参考文献区：**
```html
<section style="border-top:1px solid #ddd; padding:24px 24px 0;">
  <p style="font-size:11px; color:#999; letter-spacing:2px; margin:0 0 16px;">参 考 文 献</p>
  <p style="font-size:14px; color:#444; margin:0 0 4px;">[1] 作者. <em>标题</em>. 日期.</p>
  <p style="font-size:12px; color:#888; margin:0 0 16px; word-break:break-all;">https://example.com</p>
</section>
```

**页脚：**
```html
<section style="border-top:1px solid #ddd; padding:20px 24px 24px; text-align:center;">
  <p style="font-size:11px; color:#bbb; letter-spacing:1px; margin:0 0 6px;">CC4PM · Claude Code for Product Maker</p>
  <p style="font-size:11px; color:#bbb; margin:0;">Powered by AI Speeds: aispeeds.me</p>
</section>
```

## 交互元素降级

| 原始 | 微信替代 |
|------|---------|
| 滑块/range | 全部选项列为左色条条目 |
| Tab 导航 | 垂直展开所有 tab |
| 折叠面板 | 展开显示所有内容 |
| 动画 | 删除，用静态 |
| 点击展开 | 直接显示 |

## 粘贴流程（壹伴）

1. 打开 `mp.weixin.qq.com` 编辑器
2. 壹伴工具栏 → 「编辑源代码」
3. 全选 → 粘贴 `.wechat.html` 内容
4. 保存 → 返回可视编辑器 → 上传图片 → 手机预览
�元素降级

| 原始 | 微信替代 |
|------|---------|
| 滑块/range | 全部选项列为左色条条目 |
| Tab 导航 | 垂直展开所有 tab |
| 折叠面板 | 展开显示所有内容 |
| 动画 | 删除，用静态 |
| 点击展开 | 直接显示 |

## 粘贴流程（壹伴）

1. 打开 `mp.weixin.qq.com` 编辑器
2. 壹伴工具栏 → 「编辑源代码」
3. 全选 → 粘贴 `.wechat.html` 内容
4. 保存 → 返回可视编辑器 → 上传图片 → 手机预览
