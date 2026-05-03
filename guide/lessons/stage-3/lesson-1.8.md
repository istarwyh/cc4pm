# Lesson 17.8: 品牌资产协议与设计交付——从品牌色到动画成片

## 本课目标

- 掌握品牌资产协议的 5 步硬流程，确保设计产出忠实于品牌气质
- 了解设计方向顾问（Fallback 模式）的决策框架：5 流派 × 20 种设计哲学
- 学会使用 5 维度专家评审法量化设计质量
- 理解 Motion Design 引擎的 Stage + Sprite 时间片段模型

> **前置知识**：你已经掌握了排版美学（Lesson 17.4）和风格识别（Lesson 17.5）。本课解决的是"拿到品牌后怎么做"和"做完后怎么评"两个问题。

## 核心内容

### 品牌资产协议：5 步硬流程

涉及具体品牌（Stripe、Linear、Anthropic、自家公司等）时，**绝不能凭记忆猜品牌色**。必须执行以下 5 步：

| 步骤 | 动作 | 目的 |
|------|------|------|
| 1. 问 | 问用户有没有 brand guidelines？ | 尊重已有资源 |
| 2. 搜 | 访问 `<brand>.com/brand`、`brand.<brand>.com`、`<brand>.com/press` | 抓权威色值 |
| 3. 下载 | SVG 文件 → 官网 HTML 全文 → 产品截图取色 | 三条兜底，前一条失败立刻走下一条 |
| 4. 提取 | 从资产里 `grep` 所有 `#xxxxxx`，按频率排序，过滤黑白灰 | 确保色值准确 |
| 5. 固化 | 写 `brand-spec.md` + CSS 变量，所有 HTML 引用 `var(--brand-*)` | 不固化就会忘 |

**为什么这个流程是"最硬的一段规则"？**

因为品牌色是用户对产品的第一印象。一个 SaaS 产品的主色是 `#635BFF`（Stripe 紫）还是 `#5865F2`（Discord 蓝），传递的是完全不同的品牌气质。AI 如果凭记忆猜色，很可能用错——比如把 Linear 的 `#5E6AD2` 记成 `#7C3AED`，差之毫厘，品牌调性全变。

**brand-spec.md 示例**：

```markdown
# Brand Spec: Acme Corp

## Colors
- Primary: #E85D3A (brand orange)
- Secondary: #2D3748 (dark slate)
- Accent: #F6AD55 (warm amber)

## Typography
- Display: Playfair Display, serif
- Body: Inter, sans-serif

## CSS Variables
```css
:root {
  --brand-primary: #E85D3A;
  --brand-secondary: #2D3748;
  --brand-accent: #F6AD55;
  --brand-font-display: 'Playfair Display', serif;
  --brand-font-body: 'Inter', sans-serif;
}
```

**A/B 测试验证**：品牌资产协议 v2 经过 12 次 agent 并行测试（v1 和 v2 各跑 6 次），v2 的输出稳定性方差比 v1 低 5 倍。这意味着 v2 不仅更准确，而且更稳定——每次跑出来的结果都差不多。

### 设计方向顾问：模糊需求的 Fallback

当用户的需求模糊到无法着手时——比如"帮我设计一个 App"——不要凭通用直觉硬做，进入 Fallback 模式。

**5 流派 × 20 种设计哲学**：

| 流派 | 代表哲学 | 代表设计师 | 气质关键词 |
|------|---------|-----------|-----------|
| 极简主义 | Less is More, Reduction to Essence | Dieter Rams, 原研哉 | 克制、留白、本质 |
| 包豪斯 | Form Follows Function | Marcel Breuer, Josef Müller-Brockmann | 几何、网格、理性 |
| 后现代 | Deconstruction, Collage | David Carson, Stefan Sagmeister | 解构、拼贴、反叛 |
| 有机自然 | Biomimicry, Flow | Frank Lloyd Wright, Ross Lovegrove | 曲线、自然、温度 |
| 科技未来 | Parametric, Generative | Zaha Hadid, Casey Reas | 算法、动态、未来感 |

**Fallback 流程**：

1. 分析用户需求的关键词和上下文
2. 从 5 流派中各选 1 个最匹配的哲学（共 5 个方向）
3. 推荐 3 个**必须来自不同流派**的差异化方向
4. 每个方向配代表作参考、气质关键词、代表设计师
5. 并行生成 3 个视觉 Demo 让用户选
6. 用户选定后进入主干设计流程

**为什么要跨流派？** 如果 3 个方向都来自极简主义，用户的选择空间其实很小。跨流派推荐能最大化发现用户真正想要的气质。

### 5 维度专家评审

设计做完后，怎么知道质量好不好？用 5 维度量化评审：

| 维度 | 评分 0-10 | 评审要点 |
|------|----------|---------|
| 哲学一致性 | 0-10 | 整体设计是否遵循一个统一的风格哲学？ |
| 视觉层级 | 0-10 | 用户能否在 3 秒内找到最重要的信息？ |
| 细节执行 | 0-10 | 间距、对齐、字重、颜色是否一致且精确？ |
| 功能性 | 0-10 | 交互是否直观？状态变化是否清晰？ |
| 创新性 | 0-10 | 是否有让人眼前一亮的设计决策？ |

**输出格式**：

```
总分: 42/50

维度评分:
  哲学一致性: 8/10  ████████░░
  视觉层级:   9/10  █████████░
  细节执行:   7/10  ███████░░░
  功能性:     9/10  █████████░
  创新性:     9/10  █████████░

Keep:
  - 标题层级清晰，3 秒内可抓住核心信息
  - 交互状态反馈及时

Fix:
  - 模块间距不一致：有的 24px，有的 32px
  - 按钮 hover 态与主色没有足够对比

Quick Wins:
  - 统一所有 section 间距为 32px
  - 按钮 hover 态加深 15%
```

**在 Claude Code 中触发评审**：

```bash
# 对当前目录的 HTML 设计进行 5 维度评审
/bmad-wds-view-components

# 或直接说：
"帮我对这个设计做一个 5 维度评审"
```

### Motion Design 引擎

当你需要把产品逻辑做成动画（产品发布视频、功能演示、社交媒体素材）时，使用 Stage + Sprite 时间片段模型。

**核心概念**：

- **Stage**：画布，定义尺寸和背景
- **Sprite**：舞台上的元素（文字、图形、图片）
- **时间片段**：每个 Sprite 的出场、持续、退场时间

**4 个 API**：

```javascript
// 1. useTime — 获取当前时间进度
const t = useTime(); // 0 → 1，从动画开始到结束

// 2. useSprite — 定义一个舞台元素
const title = useSprite({
  enter: 0,      // 出场时间（归一化 0-1）
  exit: 0.5,     // 退场时间
  from: { opacity: 0, y: 50 },  // 入场动画
  to: { opacity: 1, y: 0 },
});

// 3. interpolate — 线性插值
const x = interpolate(t, [0, 1], [0, 300]); // t 从 0→1 时，x 从 0→300

// 4. Easing — 缓动函数
const smoothT = Easing.inOut(t); // 先慢后快再慢
```

**导出命令**：

```bash
# 导出 MP4（25fps）
npx playwright-record animation.html --output demo.mp4

# 导出 GIF（palette 优化）
ffmpeg -i demo.mp4 -vf "fps=15,palettegen" palette.png
ffmpeg -i demo.mp4 -i palette.png -lavfi "fps=15[x];[x][1:v]paletteuse" demo.gif

# 60fps 插帧
ffmpeg -i demo.mp4 -vf "minterpolate=fps=60" demo-60fps.mp4
```

**典型耗时**：8-12 分钟可完成一段 25-60 秒的产品动画。

### Tweaks：实时变体切换

设计不是一次成型的——你需要在不同配色、字型、信息密度之间快速切换，找到最佳组合。

**Tweaks 面板的工作方式**：

1. 设计参数化：把颜色、字号、间距等定义为可调变量
2. 侧边面板：生成一个浮动控制面板，实时切换参数
3. localStorage 持久化：刷新页面不丢选择
4. 并排对比：可以同时打开多个变体窗口对比

```javascript
// 参数化设计示例
const TWEAKS = {
  colorScheme: ['warm', 'cool', 'monochrome'],
  density: ['compact', 'comfortable', 'spacious'],
  headingFont: ['serif', 'sans-serif', 'display'],
};

// 读取 localStorage 中的选择
const [tweaks, setTweaks] = useState(
  JSON.parse(localStorage.getItem('tweaks') || '{}')
);
```

**适用场景**：
- 给客户展示 3 个配色方案让其选择
- 测试不同信息密度对阅读体验的影响
- 快速探索"如果标题换成 serif 字体会怎样"

### 信息图与数据可视化

印刷级的信息图不是"图表 + 文字"的拼凑——它需要杂志级的排版精度。

**关键技术栈**：

- **CSS Grid 精准分栏**：精确控制每个数据卡片的位置和大小
- **text-wrap: pretty**：消除寡行和河流，让文字排印更专业
- **真数据驱动**：图表数据来自 JSON，不是硬编码
- **导出格式**：PDF 矢量（印刷）、PNG 300dpi（屏幕）、SVG（可编辑）

## 常见问题

**Q: 我没有品牌规范，能做设计吗？**

A: 可以，但质量会降到 60-65 分。品牌资产协议有三条兜底：搜官网 → 下载 SVG → 截图取色。如果品牌太新或太小，三条都失败，那就用设计方向顾问的 Fallback 模式——从 20 种设计哲学中选一个合适的气质作为起点。

**Q: 5 维度评审会不会太主观？**

A: 每个维度都有具体的评审标准（如"3 秒内找到核心信息"定义了视觉层级）。评分确实是主观的，但多个评审者的分数取平均，能有效消除个人偏好。更重要的是，评审输出的 Keep/Fix/Quick Wins 是可操作的——你不需要纠结分数是 7 还是 8，你需要知道"统一间距为 32px"这个 Fix。

**Q: Motion Design 引擎能做 3D 动画吗？**

A: 不能。Stage + Sprite 是 2D 时间片段模型，适合做产品演示动画、功能说明视频、社交媒体素材。3D、物理模拟、粒子系统超出边界。如果你需要这些，考虑用 Framer Motion 或 Rive。

**Q: 用 huashu-design 做的设计和 Figma 做的有什么区别？**

A: 核心区别在交付物和操作方式：

| 维度 | huashu-design | Figma |
|------|--------------|-------|
| 操作方式 | 对话驱动（说话 → 出结果） | GUI 驱动（点击 → 拖拽） |
| 交付物 | HTML / MP4 / GIF / PPTX / PDF | Figma 文件 + 可导出切图 |
| 动画能力 | Stage + Sprite 时间轴 | 有限的原型动画 |
| 修改方式 | 重新对话或 Tweaks 面板 | 手动编辑图层 |
| 适合谁 | 不想打开图形界面的产品主理人 | 专业设计师 |

两条路，不同受众。Figma 是更好的图形工具，huashu-design 是让图形工具这层消失。

## 相关概念

- **排版美学**（Lesson 17.4）— 本课的反 AI Slop 和品牌资产协议建立在排版美学的基础上
- **风格识别**（Lesson 17.5）— 设计方向顾问的 20 种哲学是对风格识别的进一步细化
- **AI 原型实验室**（Lesson 17.2）— Junior Designer 工作流贯穿所有设计任务
- **视觉校验**（Lesson 22.2）— Playwright 自动化验证是 5 维度评审的技术基础

## 下一步

- [1] 进入下一课：Lesson 18 - Trigger Map：用户心理→功能映射
- [2] 回顾排版美学：Lesson 17.4 - 排版美学：从网格极简到杂志之场
- [3] 返回主菜单

---
*阶段 3 | Lesson 17.8/26 | 上一课: Lesson 17.7 - 风格落地 | 下一课: Lesson 18 - Trigger Map*
