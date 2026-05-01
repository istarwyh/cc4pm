---
name: wechat-article
description: "Convert HTML/Markdown content to WeChat Official Account (微信公众号) compatible format. Features: (1) Pro-Altruistic & Living Person design, (2) Auto-Logic Visualization (detects logic/flows and auto-generates SVG diagrams using drawio-mcp), (3) High-density asset embedding (Prompts, Code). Outputs ready-to-paste HTML for 壹伴."
---

# 微信公众号文章转换 (Smart Visualization & Altruism Edition)

## 核心哲学：利他、脱水、自动可视化

本技能是内容的**全自动视觉实验室**。在转换过程中，必须注入以下灵魂：

1.  **利他性 (Altruism)**：每屏内容必须有“获得感”。强制嵌入可复用的资产（Prompt、代码、方法论模型）。
2.  **自动逻辑可视化 (Auto-Logic Visualization)**：**核心进化**。不再等待用户要求，而是主动识别文中的“流程、架构、对比、循环”，并调用 `drawio-mcp` 生成专业 SVG 图表。
3.  **高脱水率 (Dehydrated)**：剔除 AI 腔。用最简练的语言交付最硬的逻辑。
4.  **活人感 (Living Person)**：絮叨但亲切。像老朋友在茶歇时跟你分享心得。

## 转换流程 (Enhanced)

1.  **逻辑扫描 (Critical)** — 扫描全文。若发现包含”第一步、第二步”、”流程”、”架构”、”生命周期”、”对比”等内容，尝试调用 `drawio-mcp` 绘制对应逻辑图。若 drawio-mcp 导出超时（连续 3 次失败），**立即切换为手写内联 SVG**，不要继续重试。
2.  **视觉生成** — 将绘图结果导出为 SVG 代码（drawio-mcp 或手写均可）。
3.  **剥离外壳** — 去掉 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>`。
4.  **内容增强** — 将识别出的核心资产（Prompt、代码）放入 `资产框`；将结论放入 `金句块`；将生成的 SVG 放入 `图表区`。
5.  **注入活人感语气** — 重写过渡句，增加”人味”的絮叨和贴心嘱咐。
6.  **包裹根 section** + 追加 `<mp-style-type>` 标记。
7.  **保存为 `.wechat.html`** 至 `~/wechat-exports/`。

## 自动可视化策略 (Auto-Visualization Strategy)

当识别到以下模式时，必须出图：

- **线性流程**：关键词”首先...然后...最后”、”流程”、”步骤”。绘图风格：水平/垂直流程图。
- **循环模型**：关键词”闭环”、”循环”、”迭代”、”自举”。绘图风格：圆形循环图。
- **系统架构**：关键词”架构”、”组成”、”模块”、”层级”。绘图风格：层级结构图。
- **对比分析**：关键词”对比”、”优劣”、”区别”、” vs “。绘图风格：左右对比表或雷达图。

**绘图规范（SVG 色彩）**：
- 背景：`#1a1a1a` 深色 或 `#f5f0e8` 奶油白
- 节点填充：`#2a2a2a`（深色主题）/ `#ffffff`（浅色主题）
- 节点描边：`#c4a45a`（金色强调）或 `#444`（中性）
- 文字：`#f5f0e8`（深色主题）/ `#111`（浅色主题）
- 箭头/连线：`#888`（中性）或 `#c4a45a`（关键路径）
- **禁止在图表中使用蓝色（`#0052ff` 或任何 blue 系）**
- 字体：`font-family: 'Helvetica Neue', 'PingFang SC', sans-serif`

**drawio-mcp 超时降级**：若连续 3 次 export 超时，切换为手写内联 SVG，使用上述色彩规范，不要继续重试 drawio-mcp。

## 排版风格：NYT 编辑风（强制）

**所有样式必须内联（inline style）**，不得使用 `<style>` 块或 CSS 类。微信公众号会剥离 `<style>` 标签。

**参考文件**：`~/wechat-exports/post-visual-truth.wechat.html`（NYT 编辑风模板，可用 Read 工具提取 inline style 规范）

**调色板**：
- 正文：`color:#111; font-family:'Georgia', 'Songti SC', serif; line-height:1.9;`
- 标题：`color:#111; font-weight:700;`
- 标签/Tag：`color:#888; font-size:11px; letter-spacing:2px; text-transform:uppercase;`
- 分隔线：`border-top:1px solid #e0d8cc;`
- 金句背景：`background:#fdf9f4; border-left:3px solid #c4a45a; padding:16px 20px;`
- 主理人叮嘱：`background:#fdf9f4; border:1px solid #e8e0d0; border-radius:4px; padding:20px;`

**强调规范（重要）**：
- **禁止使用 `<strong>` 加粗**：微信公众号加粗效果差，视觉噪音大
- **改用主理人蓝**：`<span style=”color:#0052ff;”>短语</span>`，仅用于 3–5 处最关键的短语
- **不要大片蓝色**：每处蓝色不超过 10 个字，整篇不超过 5 处

## 文案风格指南：絮叨、亲切、有深度

- **拒绝 AI 腔**：禁止”总之”、”首先/其次”、”值得注意的是”。
- **絮叨但亲切**：允许适度的感叹词和口语。在复杂图表后必须跟一句”主理人碎碎念”来解释图表的核心价值。
- **分享私心**：加入个人偏好。”虽然大家都用方案 A，但我更推荐你看看图里的方案 B，它在处理 X 时更稳”。

### 禁止的写作模式（重要）

以下模式会让读者一眼看出是 AI 写的，必须避免：

1. **预告式结构**：先宣布”有三件事”/”五项纪律”/”核心观点：”，再列举。直接说就行，别预告。
   - ❌ “三条铁律：函数不超过 7 行，参数不超过 3 个……”
   - ✅ “函数不超过 7 行，参数不超过 3 个……”

2. **虚假权威姿态**：AI 没有经验，别装有。
   - ❌ “我见过太多 AI 生成的代码……”
   - ❌ “根据我的经验……”
   - ✅ 直接描述现象，不要用”我”开头

3. **重复铺垫**：先提一个概念再解释它，是冗余的。
   - ❌ “AI 的通病：它见过太多设计模式，喜欢炫技。你让它写个支付处理，它给你……”
   - ✅ “让它写个支付处理，它给你……” — 砍掉铺垫直接进场景

4. **先问再答的套路**：
   - ❌ “为什么是 7 行？人类的工作记忆容量约 7±2 个信息块。”
   - ✅ “人类工作记忆约 7±2 个信息块。” — 直接给答案

5. **独立 FAQ / Q&A 板块**：禁止”你可能会问””站在你的角度想”这类独立问答区块。读者视角的问题应该融入各段正文，用一两句话自然带出，不单独成节。
   - ❌ 开一个 `<section>` 标题叫”你可能会问”，里面列 5 条 Q&A
   - ✅ 在对应原则的段落末尾加一句：”不用读懂代码，数行数就够了。”
   - 原因：独立 Q&A 块打断阅读节奏，暴露”预设读者身份”的 AI 味。融入正文后读者自然接收到信息，不需要切换阅读模式。

6. **夸大词汇**：禁止”终极””最强””万能””一文讲透””天花板”等营销腔。读者对这类词天然反感，会连带怀疑内容质量。用具体数据或实际效果替代。
   - ❌ “终极 Prompt 资产 —— 直接复制粘贴”
   - ✅ “写进 CLAUDE.md —— 让 AI 每次开工都自动遵守”

7. **口号式金句**：金句（开场 hook、结尾 callout）要**观点式**，不要**口号式**。口号追求形式工整（对仗、押韵），但读完就忘。观点提出反直觉视角，读者会停下来想。
   - ❌ `”快”不是竞争力。”对”才是。` — 工整但空洞
   - ✅ `代码是债务，AI 写得越多，我们负责的越多。` — 反转了”AI 帮我减负”的认知
   - 自检：这句话是在**总结**还是在**提出新视角**？如果是总结，重写。

## 编辑排版组件库 (与 SKILL.md 保持一致)
- [金句/核心结论]
- [资产框 (Asset Box)]
- [主理人叮嘱 (Mentor's Note)]
- [SVG 逻辑图表区]

## 微信排版细节（代码块 & 表格）

### 代码块格式

微信公众号对 `<pre>` 内的换行和缩进处理不稳定。必须**每行一个 `<pre>`**，用 `<span leaf="">` 包裹内容，缩进用 `&nbsp;` 而非空格。

```html
<!-- ✅ 正确：逐行 <pre> + <span leaf=""> + &nbsp; 缩进 -->
<section style="background:#1a1a1a;border-radius:6px;padding:20px;">
  <pre style="font-size:12px;line-height:1.6;color:#f5f0e8;margin:0;font-family:'SF Mono','Fira Code',monospace;white-space:pre-wrap;">
<span leaf="">function processPayment(method, amount) {</span>
</pre>
  <pre style="font-size:12px;line-height:1.6;color:#f5f0e8;margin:0;font-family:'SF Mono','Fira Code',monospace;white-space:pre-wrap;">
<span leaf="">&nbsp;&nbsp;if (method === 'card') return payByCard(amount)</span>
</pre>
  <pre style="font-size:12px;line-height:1.6;color:#f5f0e8;margin:0;font-family:'SF Mono','Fira Code',monospace;white-space:pre-wrap;">
<span leaf="">}</span>
</pre>
</section>

<!-- ❌ 错误：单个 <pre> 包多行，微信会吞掉换行 -->
<pre>function foo() {
  return 1
}</pre>
```

**注意**：代码注释前缀 `//` 在微信里可能显示异常，必要时去掉或用文字说明替代。

### 表格格式

表格需要 `<tbody>` 包裹行，每个 `<td>` 内用 `<section>` 包裹内容，否则微信会破坏对齐。

```html
<!-- ✅ 正确：<tbody> + <td> 内 <section> -->
<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <tbody>
    <tr style="background:#f5f0e8;">
      <td style="padding:10px 12px;border:1px solid #e0d8cc;font-weight:700;">
        <section><span leaf="">AI 的问题</span></section>
      </td>
      <td style="padding:10px 12px;border:1px solid #e0d8cc;font-weight:700;">
        <section><span leaf="">对应原则</span></section>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid #e0d8cc;">
        <section><span leaf="">函数太长</span></section>
      </td>
      <td style="padding:10px 12px;border:1px solid #e0d8cc;color:#c4a45a;font-weight:700;">
        <section><span leaf="">BRIEF</span></section>
      </td>
    </tr>
  </tbody>
</table>
```

## 语言规范
- 只有 logo (CC4PM) 和专有名词 (Claude, Anthropic) 用英文。
- 标点符号使用全角（中文）或半角（数字后），专有名词前后加空格。

## 粘贴流程（壹伴）
1. 复制 `.wechat.html` 全部内容。
2. 微信后台 -> 壹伴工具栏 -> 「编辑源代码」。
3. 全选粘贴 -> 保存 -> 预览。
