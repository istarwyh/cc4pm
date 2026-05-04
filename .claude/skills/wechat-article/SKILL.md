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

1.  **逻辑扫描 (Critical)** — 扫描全文。若发现包含"第一步、第二步"、"流程"、"架构"、"生命周期"、"对比"等内容，尝试调用 `drawio-mcp` 绘制对应逻辑图。若 drawio-mcp 导出超时（连续 3 次失败），**立即切换为手写内联 SVG**，不要继续重试。
2.  **主题一致性预判** — 文章主张的方法论与下文 how-to 部分的执行方式是否一致？如不一致（如主题"工具丢给 AI"但 how-to 全手动），先调整 how-to 框架。详见"主题一致性"章节。
3.  **视觉生成** — 将绘图结果导出为 SVG 代码（drawio-mcp 或手写均可）。
4.  **剥离外壳** — 去掉 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>`。
5.  **内容增强** — 将识别出的核心资产（Prompt、代码）放入 `资产框`；将结论放入 `金句块`；将生成的 SVG 放入 `图表区`。
6.  **注入活人感语气** — 重写过渡句，增加"人味"的絮叨和贴心嘱咐。
7.  **AI 味自检（强制）** — 跑"提交前自检"章节列出的 grep 命令，按"形式回声检查"表数频率。任一类超上限必须重写。**跳过此步 = 必有 AI 味。**
8.  **包裹根 section** + 追加 `<mp-style-type>` 标记。
9.  **保存为 `.wechat.html`** 至 `~/wechat-exports/`。

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

### 写作哲学：信息密度 > 形式工整

**AI 味的本质是"形似神无、形式多于内容、技巧超过逻辑、有套路的表达方式"。**

判断一句话有没有 AI 味，看它是先有想说的话还是先有形式：

- **先有内容 → 自然生成的形式**：句子结构服从想表达的意思，对仗只是巧合
- **先有形式 → 往里塞内容**：句子结构是模板（"X 不是 A 而是 B"、"两条路：A、B"、"为什么……——"），内容只是填空

读者读到后者会下意识察觉"这话说得太顺了"——人脑对模板有天然警觉。下面所有具体规则都是这个根本原则的 instances，违反原则的形式总会以新形态出现，记住根原则比记 N 条禁忌更可靠。

### 拒绝 AI 腔（基础风格）

- 禁止"总之"、"首先/其次"、"值得注意的是"、"综上所述"
- 絮叨但亲切：允许适度的感叹词和口语
- 复杂图表后必须跟一句"主理人碎碎念"，解释图表的核心价值
- 分享私心：加入个人偏好。"虽然大家都用方案 A，但我更推荐方案 B，它在处理 X 时更稳"

### 禁止的写作模式（句子级，必须逐条自检）

#### 1. 预告式结构 + 摘要+冒号

先宣布数量再列举，是 AI 最爱的结构。冒号是它的标志。

- ❌ "三条铁律：函数不超过 7 行，参数不超过 3 个……"
- ❌ "这种事以前两条路：要么 A，要么 B"
- ❌ "改三个字段就能跑：API key、work_dir、wxid"
- ❌ "cc-connect 提供三层防御，从主动到兜底：" + 紧跟图表
- ✅ 直接讲第一条；让句子靠信息密度站住，不要先报数

变体也要警惕："数完再列"未必带冒号——"三种方式任选——A、B、C"同样违规。

#### 2. "X 不是 A，而是 B" 反向对仗

最隐蔽的 AI 套路——它常常承载真实区分，所以单次出现可以接受。但**同一篇文章出现 ≥ 2 次就形成形式回声**，整体 AI 味直接爆。

- 单次（OK）：✅ "代码是债务，AI 写得越多，我们负责的越多"——提出反直觉视角
- 重复（NG）：❌ 开头"关键不是 X，而是 Y" + 几段后"解决的不是 A，它解决的是 B"

自检：`grep -E '不是.*而是|不是.*——.*它|解决的不是'` 全文几次？≥ 2 重写其中之一。

#### 3. 评价后置（先报数 → 再贴评价标签）

AI 喜欢先做枚举抽象，再对枚举做评价——这种结构暴露了"先组织框架、再填内容"的写作顺序。

- ❌ "cc-connect 有两个权限字段，名字相近，作用完全不一样"（先数 → 抽象评价）
- ✅ "allow_from 和 admin_from 长得太像，搞反的代价是要么所有人都成了管理员，要么自己连 bot 都用不了"（直接命名 + 具体失败模式）

写法：把抽象评价（"作用不一样"）替换成具体后果（"所有人都成了管理员"）。

#### 4. 关键词回声

同一个评价词在 2 句内重复出现以追求对仗。

- ❌ "最妙的不是 X——妙在 Y"（"妙"重复）
- ❌ "教程会过期，URL 不会"（对仗收口，靠"过期"形式回声）
- ✅ 第二句换成具体描述，不复用评价词

#### 5. 虚假权威姿态

AI 没有经验，别装有。"我"开头要克制。

- ❌ "我见过太多 AI 生成的代码……"
- ❌ "根据我的经验……"
- ✅ 直接描述现象

#### 6. 重复铺垫

先提一个概念再解释它，是冗余。

- ❌ "AI 的通病：它见过太多设计模式，喜欢炫技。你让它写个支付处理，它给你……"
- ✅ 砍掉铺垫直接进场景

#### 7. 先问再答

- ❌ "为什么是 7 行？人类工作记忆约 7±2 个信息块。"
- ❌ "为什么把 URL 给 Claude 比照着教程敲更靠谱——……"
- ✅ "人类工作记忆约 7±2 个信息块。"——直接给答案

#### 8. 独立 FAQ / Q&A 板块

禁止"你可能会问"、"站在你的角度想"这类独立问答区块。读者视角的问题应该融入各段正文。

- ❌ 开一个 `<section>` 标题叫"你可能会问"，里面列 5 条 Q&A
- ✅ 在对应原则的段落末尾加一句："不用读懂代码，数行数就够了。"

原因：独立 Q&A 块打断阅读节奏，暴露"预设读者身份"的 AI 味。

#### 9. 夸大词汇

禁止"终极"、"最强"、"万能"、"一文讲透"、"天花板"等营销腔。

- ❌ "终极 Prompt 资产 —— 直接复制粘贴"
- ✅ "写进 CLAUDE.md —— 让 AI 每次开工都自动遵守"

#### 10. 口号式金句

金句要**观点式**，不要**口号式**。口号追求形式工整（对仗、押韵）但读完就忘，观点提出反直觉视角让人停下来想。

- ❌ `"快"不是竞争力。"对"才是。` — 工整但空洞
- ✅ `代码是债务，AI 写得越多，我们负责的越多。` — 反转了"AI 帮我减负"的认知

自检：这句话是**总结**还是**提出新视角**？如果是总结，重写。

#### 11. 自吹 / 口水话 / 营销收口

"最推荐"、"最香"、"最省事"、"能省你半小时"、"最优解"、"最频繁"这类词是自我推销，不是信息。读者不需要你替他下判断——把事实摆出来，他自己会判断。

同样，"这个功能我用得最频繁"、"挺适合"、"比让它兜底优雅"这类个人评价如果没有新信息，就是口水话。

**营销收口**：文章结尾用口号式号召收束（"把它装上，让你的 Mac 跟着你坐地铁"）是营销腔。文章该结束就结束，不需要号召读者行动——读者看完自然知道要不要用。

**无据最高级**：没有数据支撑的"最"是张口就来。"最热的那一格"——有下载量对比吗？有用户数吗？没有就别写。要么给出数据来源，要么用客观描述替代。

- ❌ "最推荐的方式是让 Claude Code 自己装自己——这听起来像绕口令，但确实是最不踩坑的路"
- ✅ "让 Claude Code 自己装自己。把下面这句话发给 Claude Code，它会 fetch 官方 INSTALL.md，自己跟着步骤装"
- ❌ "最香的一点是不用记 cron 表达式"
- ✅ "不用记 cron 表达式"
- ❌ "这个功能我用得最频繁"
- ✅ 直接描述功能，不加个人使用频率
- ❌ "看完这张图再去读官方示例，能省你半小时摸索"
- ✅ "下面这张图把三层关系画清楚了"
- ❌ "把它装上，让你的 Mac 跟着你坐地铁。"
- ✅ 不需要收口号召，事实讲完自然结束

自检：`grep -nE '(最推荐|最香|最省事|最优解|最实用|最频繁|能省你|最不踩坑|最热|把它装上|跟着你坐)' file.html`，命中即改。

### 形式回声检查（文章级，必做）

句子级每条都过关，整篇还是可能 AI 味——因为同类形式套路反复出现本身就是 tell。

通读全文数频率，任一超上限即重写到达标：

| 套路 | 全文上限 |
|---|---|
| "X 不是 A 而是 B" | ≤ 1 |
| "为什么……——" | ≤ 1 |
| 摘要+冒号 引出列举 | ≤ 2 |
| 三件式/四件式 平行排比 | ≤ 2 |
| 同一评价词在 ≤ 5 句内重复 | ≤ 1 |

即使每处都 substantive，频率本身就是 AI tell。

### 主题一致性 (Meta-Coherence)

当文章主题涉及某种方法论或哲学（如"工具配置交给 AI"、"代码越短越好"、"先写测试再写代码"），文章的 how-to 部分必须**展示这个方法的实际应用**，而不是用相反方式呈现——否则文章自己打自己脸。

实例：
- 主题"工具配置交给 AI" → 把"手动改 TOML 第 N 行"重写为"告诉 Claude '把我的 wxid 加到管理员'，它自己改字段"
- 主题"AI 帮你做测试" → 不要用纯手写的测试用例做示例
- 主题"用脚本而不是手动 GUI" → 不要把示例做成截图点击流

转换前自检：**文章主张的方法 == 文章 how-to 部分采用的方法？** 如果不等，重写 how-to。

### 受众广度（跨岗位场景）

当主题适合跨岗位读者（效率工具、AI 应用、跨平台方法），Hook、示例、收尾都要展示跨岗位场景。

- ❌ 通篇程序员场景（CI、git、PR、代码 review）
- ✅ 程序员场景 + 运营 / 销售 / PM / 设计场景各 1-2 个

判断：文章主题是否只对程序员有效？如果"否"，至少 Hook 段和示例段要覆盖 ≥ 2 类岗位。常见非程序员场景库：Excel 汇总、PDF 摘要、邮件分类、飞书/钉钉文档整理、企业微信群聊汇总、Downloads 归档、日历汇总。

**本土化（中文读者必做）**：场景里出现的 SaaS 工具优先用中国大陆主流——飞书、钉钉、企业微信、腾讯文档、石墨文档、语雀。**禁止使用 Notion / Asana / Trello / Linear** 作为非程序员示例，大陆企业基本不用，读者代入不进去。GitHub、Slack 在程序员场景里全球通用，可以保留；Slack 在非程序员场景里要本土化。

### 提交前自检（强制流程）

保存 `.wechat.html` 之前必须跑下面的 grep，命中条目逐一审视：

```bash
# 1. 句子级形式套路
grep -nE '(两条路|三种|两种|两个[^字句章节]|三层防御|几件事|几个我|为什么.*——|不是.*而是|解决的不是)' file.html

# 2. 关键词回声
grep -nE '(最妙|妙在|关键|核心)' file.html | sort

# 3. 营销腔
grep -nE '(终极|最强|万能|一文|天花板)' file.html

# 4. 自吹/口水话/营销收口
grep -nE '(最推荐|最香|最省事|最优解|最实用|最频繁|能省你|最不踩坑|最热|把它装上|跟着你坐)' file.html
```

每条命中不是绝对禁止，而是要确认是 substantive 还是 形式。频率超出"形式回声检查"上限的必须重写。**不跑 grep 就保存 = 必有 AI 味。**

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
