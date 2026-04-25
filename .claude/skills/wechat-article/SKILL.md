---
name: wechat-article
description: "Convert HTML/Markdown content to WeChat Official Account (微信公众号) compatible format with 'Pro-Altruistic' & 'Living Person' editorial design. High-density output for product makers, including copyable Prompt templates and dry-goods logic. Outputs ready-to-paste HTML for 壹伴's '编辑源代码' feature."
---

# 微信公众号文章转换 (Pro-Altruism & Living Person Edition)

## 核心哲学：利他、脱水、活人感

本技能不仅是排版工具，更是**内容的价值放大器**。在转换过程中，必须注入以下灵魂：

1.  **利他性 (Altruism)**：每屏内容必须有“获得感”。强制嵌入可复用的资产（Prompt、代码、方法论模型）。
2.  **高脱水率 (Dehydrated)**：剔除 AI 腔的废话。用最简练的语言交付最硬的逻辑。
3.  **活人感 (Living Person)**：絮叨但亲切。像老朋友在茶歇时跟你分享心得，有情绪、有洞察、有叮嘱。

## 转换流程

1.  **读取源内容** — 识别核心价值点、Prompt 模板和结论。
2.  **剥离外壳** — 去掉 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>`。
3.  **应用利他性增强** — 寻找正文中的逻辑点，将其转化为高亮的“金句”或“资产框”。
4.  **注入活人感语气** — 重写过渡句，增加“人味”的絮叨和叮嘱。
5.  **应用强制转换与 CSS 规则**。
6.  **包裹根 section** + 追加 `<mp-style-type>` 标记。
7.  **保存为 `.wechat.html`** 至 `~/wechat-exports/`。

## 强制转换规则（技术底层）

- `<div>` → `<section>`
- 超链接 `<a href>` → 脚注 `<sup>[1]</sup>`，文末附参考文献。
- 所有样式必须内联 `style=""`。
- **禁止使用**：`display: flex/grid`, `position`, `float`, `animation`, CSS 变量。

## 文案风格指南：絮叨、亲切、有深度

### 1. 拒绝 AI 腔 (The "Anti-AI" Rule)
- **禁止**：使用“总之”、“首先/其次”、“我们可以看到”、“值得注意的是”、“致力于”、“揭示了”。
- **禁止**：平铺直叙的教学。
- **提倡**：用读者场景开头。“你肯定也遇到过这种事...”、“说真的，我试了十几次才发现...”。

### 2. 絮叨但亲切 (Talkative but Caring)
- **像人在说话**：允许适度的感叹词和口语。
- **关心感**：在复杂逻辑后加一句“如果你这里卡住了，记得检查一下 X”。
- **分享私心**：加入一点个人偏好。“比起方案 A，我更推荐你试试 B，虽然麻烦点但真的稳”。

### 3. 高脱水率 (High-Density Logic)
- **金句先行**：每个 Section 的核心结论必须用**主理人蓝 (#0052ff)** 加粗。
- **资产植入**：如果文章讲一个方法，必须给出一个可以直接 Copy 的 Prompt 模板。

## 编辑排版组件库

### 1. 根模板（零换行规范）
```html
<section style="max-width:590px; margin:0 auto; padding:0; font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue','Microsoft YaHei',sans-serif; font-size:15px; line-height:1.8; color:#333; letter-spacing:0.5px; text-align:justify; margin-top:0;">
  <!-- 内容紧贴 -->
</section>
<p style="display:none;"><mp-style-type data-value="3"></mp-style-type></p>
```

### 2. 金句/核心结论（利他高亮）
用于强调读完必须带走的结论。
```html
<section style="margin: 24px 24px; padding: 16px; background: #f0f5ff; border-left: 4px solid #0052ff; border-radius: 4px;">
  <p style="font-size: 16px; font-weight: 800; color: #0052ff; line-height: 1.6; margin: 0;">
    💡 核心洞察：这里写一句让读者拍大腿的结论。
  </p>
</section>
```

### 3. 资产框 (Asset Box - Prompt/Code)
用于放置 Prompt 模板、代码段或具体的执行清单。
```html
<section style="margin: 20px 24px; background: #222; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <section style="background: #333; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between;">
    <span style="font-size: 11px; color: #aaa; letter-spacing: 1px;">可直接复制的 PROMPT 模板</span>
  </section>
  <section style="padding: 16px; overflow-x: auto;">
    <pre style="margin: 0; font-family: 'Operator Mono', Consolas, Monaco, monospace; font-size: 13px; color: #00ff9d; line-height: 1.5; white-space: pre-wrap; word-break: break-all;">
      在这里粘贴 Prompt 或代码...
    </pre>
  </section>
</section>
```

### 4. 主理人叮嘱 (Mentor's Note)
用于体现“活人感”的絮叨和贴心提醒。
```html
<section style="margin: 20px 24px; padding: 12px 16px; border: 1px dashed #c4a45a; background: #fffcf5; border-radius: 4px;">
  <p style="font-size: 13px; color: #8b7355; margin: 0; line-height: 1.6;">
    💬 <strong>主理人碎碎念：</strong> 这里写一些亲切的嘱咐，比如“千万别在这里省时间，不然之后调试会哭的”。
  </p>
</section>
```

### 5. SVG 逻辑图表
优先使用 SVG 表达逻辑。
```html
<section style="margin: 20px 24px; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
  <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 100%; height: auto; background: #fff;">
    <!-- SVG 逻辑绘制 -->
  </svg>
</section>
```

## 语言规范（2026版）
- 只有 logo (CC4PM) 和专有名词 (Claude, Anthropic) 用英文。
- 数字和单位使用半角，前后加空格（如 `10 px`）。
- 专有名词前后加空格（如 `使用 Claude 处理`）。

## 文案重塑对照表

| AI 腔（禁止） | 活人感（推荐） |
| :--- | :--- |
| 首先，我们需要考虑用户需求... | 说真的，你得先摸清楚用户到底想要啥，别瞎忙活。 |
| 值得注意的是，该模型表现出色。 | 这个模型真的惊艳到我了，尤其是它处理复杂逻辑时那种“聪明感”。 |
| 总而言之，这是一次重大的更新。 | 别的不说，这次更新绝对是能让你效率翻倍的“核武器”。 |
| 我们可以看到，这个参数的影响很大。 | 这里的参数很有意思，调大一点点，效果立马就不一样了。 |

## 粘贴流程（壹伴）
1. 复制 `.wechat.html` 全部内容。
2. 微信后台 -> 壹伴工具栏 -> 「编辑源代码」。
3. 全选粘贴 -> 保存 -> 预览。
