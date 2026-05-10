# cc4pm 首页设计规范

> 本规范定义 cc4pm 官网首页及其延展页面的视觉语言。它以当前 `packages/homepage/index.html` / `docs/index.html` 的实现为基准，用于后续页面、海报、课程落地页、功能 Showcase 与 AI 生成界面的统一设计依据。

## 1. 设计定位

cc4pm 是“AI 产品私教”，不是单纯的开发者工具官网，也不是炫技型 AI 海报。首页应表达：

- **专业但不冷冰冰**：有工程系统的秩序感，但语气与视觉都保持亲近。
- **温暖但不松散**：使用米白、陶土橙、橄榄绿等低饱和色，避免廉价活泼。
- **系统但不压迫**：四大模块、Skills、课程地图等信息清晰分层，不能堆砌。
- **AI-native 但不 AI Slop**：可以有网格、终端、微光和自动化动效，但不要紫蓝霓虹泛滥、玻璃卡片堆叠、无意义渐变。

### 风格归类

当前首页主风格为：

```text
Editorial Minimalism 60% + Swiss Typography 25% + Warm AI SaaS 15%
```

解释：

- **Editorial Minimalism**：负责品牌感、留白、阅读节奏、内容气质。
- **Swiss Typography**：负责网格、模块秩序、工程可信度。
- **Warm AI SaaS**：负责 AI 工具感、终端感、轻量科技感。

## 2. 核心视觉原则

### 2.1 内容先于装饰

页面的视觉重点永远服务于内容理解：

- 大标题负责建立定位与情绪。
- 卡片负责承载结构化信息。
- 图标只用于辅助识别，不作为主要装饰。
- 动效只表达状态变化，不制造视觉噪音。

### 2.2 留白是呼吸，不是空缺

首页使用较大的 section 间距和稳定容器宽度，营造课程品牌与产品系统的“从容感”。

- Section 垂直间距默认使用 `128px`。
- 模块标题与内容之间保持明显分隔。
- 卡片内部留白要足够，让信息自然成组。

### 2.3 色彩有使命

颜色用于表达模块、状态和行动，不用于随意装饰。

- 陶土橙：主行动、BMM、品牌温度。
- 金色：CIS、创意与洞察。
- 橄榄绿：WDS、设计与生长感。
- 暖棕：工程工具链、落地与执行。
- 深墨黑：终端、GitHub、技术可信度。

### 2.4 克制的 AI 感

允许出现：

- 低透明度网格背景。
- 微弱径向光。
- 终端窗口。
- mono 字体标签。
- 模块连接线与系统结构图。

避免出现：

- 大面积紫蓝霓虹。
- 过度玻璃拟态。
- 高饱和赛博渐变。
- 无意义粒子、光束、3D 球体。
- 与内容无关的 AI 脑、机器人、芯片堆砌。

## 3. 设计 Token

以下 Token 来自当前首页实现，应作为默认视觉基准。

### 3.1 颜色

```css
:root {
  --bg-base: #faf9f5;
  --bg-elevated: #f0efe8;
  --bg-card: #ffffff;
  --bg-card-hover: #f5f4ee;
  --bg-overlay: #e8e6dc;

  --text-primary: #141413;
  --text-secondary: #4a4a45;
  --text-muted: #8a8a82;
  --text-disabled: #b0aea5;

  --color-bmm: #d97757;
  --color-cis: #d4a853;
  --color-wds: #788c5d;
  --color-eng: #b07d62;

  --cta-from: #d97757;
  --cta-to: #c4623f;
  --cta-hover-from: #e08868;
  --cta-hover-to: #d97757;

  --btn-github-bg: #141413;
  --btn-github-border: #2a2a28;

  --terminal-green: #788c5d;
  --terminal-yellow: #d97757;
  --terminal-blue: #d4a853;
  --terminal-cursor: #d97757;

  --link-color: #d97757;
  --link-hover: #c4623f;
  --border-default: #e8e6dc;
  --border-highlight: #d4d2c8;
}
```

### 3.2 字体

```css
:root {
  --font-sans: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue',
    Arial, sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono',
    'Menlo', 'Consolas', monospace;
}
```

使用规则：

- `Poppins` / 系统 sans 用于正文、标题、按钮、导航。
- `font-mono` 用于版本号、命令、标签、课程编号、技术指标。
- 不要在首页中混入装饰字体或手写字体。

### 3.3 间距

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
  --space-5xl: 128px;

  --container-max: 1200px;
  --container-narrow: 800px;
}
```

使用规则：

- 页面 section 默认 `128px` 上下间距。
- 内容模块之间优先使用 `48px` / `64px`。
- 卡片内部 padding 使用 `24px` / `28px`。
- 移动端保持结构，不要把所有间距压到拥挤。

### 3.4 圆角

```css
:root {
  --border-radius-sm: 6px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
}
```

使用规则：

- 小标签：`6px` 或 pill。
- 按钮、终端、普通卡片：`12px`。
- 信息卡片、课程卡片、架构节点：`16px`。
- 大型品牌容器可使用 `24px`。

## 4. 页面结构规范

### 4.1 Hero

Hero 是“AI 产品私教”定位的第一表达。

必须包含：

- 产品名或主张。
- 一句清楚的价值定位。
- 1-2 个主要行动按钮。
- 轻量技术信号，例如安装命令、终端或版本标识。

视觉要求：

- 背景使用 `--bg-base`。
- 可使用低透明径向光：`rgba(217,119,87,0.08)`。
- 可使用低透明网格：`rgba(217,119,87,0.04)`。
- 主标题大、稳、紧凑，避免花哨装饰。

参考实现：

```css
.hero-title {
  font-size: 72px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
}
```

### 4.2 导航栏

导航栏应轻、透明、有秩序。

要求：

- 高度：`64px`。
- 背景：`rgba(250,249,245,0.92)`。
- 模糊：`blur(12px) saturate(180%)`。
- 底部分隔线使用 `--border-default`。
- 激活态使用 `--cta-from`。

### 4.3 卡片

卡片是 cc4pm 首页的信息单元。

默认卡片：

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 28px;
}
```

悬浮态：

```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.06);
  border-color: var(--border-highlight);
}
```

原则：

- 阴影必须轻，不做厚重拟物。
- 卡片之间用间距分组，不靠强边框制造分隔。
- 一张卡只表达一个概念。

### 4.4 终端模块

终端是工程可信度与 Claude Code 场景的视觉锚点。

要求：

- 背景使用 `#141413`。
- 顶栏使用 `#1e1e1c`。
- 正文使用 mono 字体。
- 成功/提示/警告颜色复用模块色，不引入新的荧光色。

```css
.terminal {
  background: #141413;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  color: #f0f0ec;
  font-family: var(--font-mono);
}
```

### 4.5 架构图与模块关系

cc4pm 的四大模块是品牌结构核心：

- BMM：业务建模。
- CIS：创意智能。
- WDS：网页设计系统。
- Engineering：工程工具链。

视觉表达：

- 中心节点为 cc4pm。
- 四大模块围绕中心布局。
- 连接线使用低对比虚线或细线。
- 模块色只作为强调，不铺满大面积背景。

## 5. 文案语气

cc4pm 的文案是“私人教练 + 产品主理人搭档”，不是传统 SaaS 销售话术。

### 应该这样写

- “手把手带你做产品”
- “从灵感到上线，全程陪伴”
- “工具我来帮你装，方法我带你练”
- “产品主理人的 AI 私教”
- “不是工具集合，而是一套产品生命周期系统”

### 避免这样写

- “革命性颠覆行业”
- “一键生成商业帝国”
- “最强 AI 工具”
- “全网第一”
- “无需思考，自动成功”

语气关键词：

```text
清楚、温暖、可信、陪伴、实战、系统化、不过度承诺
```

## 6. 图像与海报规范

当前项目中的深色蓝紫科技海报可以作为传播物料，但不能直接作为首页主视觉规范。

### 官网主视觉

应保持：

- 暖白背景。
- 低饱和模块色。
- 克制微光。
- 结构化卡片。
- 清晰文字层级。

### 宣传海报 / 社交图

可以适度增强：

- 深色背景。
- 发光轨道。
- 系统节点。
- AI-native 科技感。

但仍需保留：

- cc4pm 四大模块。
- 主品牌橙或暖色锚点。
- 清晰层级。
- 不使用廉价赛博朋克视觉。

## 7. 响应式规范

### 桌面端

- 容器最大宽度：`1200px`。
- Hero 居中，主标题大尺寸。
- 三列或四列卡片网格。
- 架构图可使用中心辐射布局。

### 平板端

- 卡片网格降为两列。
- 架构图可切换为模块卡片网格。
- 保持 section 间距，但可略微压缩。

### 移动端

- 卡片单列。
- 导航折叠菜单。
- Hero 标题按比例缩小，不要强行保留桌面布局。
- 所有交互区域至少 `44px` 高。

## 8. 动效规范

动效应像“系统响应”，不是“视觉表演”。

允许：

- `fade-up` 内容进入。
- 卡片 `translateY(-4px)` 悬浮。
- 轻量脉冲点。
- 连接线虚线流动。
- Tab 淡入切换。

限制：

- 动效时长通常在 `200ms-600ms`。
- 必须支持 `prefers-reduced-motion: reduce`。
- 不做无限大面积背景动画。
- 不做抢夺注意力的弹跳或旋转。

## 9. AI 生成页面 Prompt 模板

当要求 AI 为 cc4pm 生成新页面或区块时，使用下面模板：

```text
你是 cc4pm 的产品设计师。请为 cc4pm 生成一个页面/区块，严格遵循以下视觉规范：

品牌定位：cc4pm 是产品主理人的 AI 产品私教，气质是专业、温暖、系统化、陪伴式。

视觉风格：Editorial Minimalism 60% + Swiss Typography 25% + Warm AI SaaS 15%。

颜色：
- 背景 #faf9f5 / #f0efe8
- 卡片 #ffffff
- 主文字 #141413
- 正文 #4a4a45
- 弱文字 #8a8a82
- 主行动色 #d97757 → #c4623f
- 模块色：BMM #d97757，CIS #d4a853，WDS #788c5d，Engineering #b07d62

排版：
- 使用现代 sans 字体，技术标签和命令使用 mono 字体。
- 标题大而稳，正文留足行高。
- 保持清晰层级，不堆叠装饰。

布局：
- 1200px 最大容器。
- section 上下留白充足。
- 卡片 16px 圆角、1px 暖灰边框、轻阴影。
- 使用低透明网格或微光时必须克制。

禁止：
- 紫蓝霓虹大渐变。
- 过度玻璃拟态。
- 无意义 3D 球体、机器人、芯片背景。
- 高饱和赛博朋克风。
- 夸张营销话术。

输出：完整 HTML/CSS，保持响应式与 prefers-reduced-motion 支持。
```

## 10. 设计审查清单

每次新增首页区块、活动页或 Showcase 页面前，检查：

- [ ] 是否仍然表达“AI 产品私教”，而不是泛 AI 工具？
- [ ] 背景是否保持暖白/米白体系？
- [ ] 主色是否使用陶土橙，而不是默认蓝紫？
- [ ] 卡片是否轻、清晰、克制？
- [ ] 是否有足够留白和阅读节奏？
- [ ] 模块色是否有语义，而不是装饰？
- [ ] 技术感是否通过终端、mono、网格、系统结构表达？
- [ ] 是否避免 AI Slop：紫色渐变、玻璃卡片、无意义 3D、泛科技图标？
- [ ] 移动端是否保持内容清晰？
- [ ] 动效是否支持 reduced motion？

## 11. 与现有文件的关系

- `docs/index.html`：当前官网首页实现。
- `packages/homepage/index.html`：发布为 `@cc4pm/homepage` 的首页副本。
- `package.json` 的 `build:homepage`：将 `docs/index.html` 同步到 `packages/homepage/index.html`。
- 本文件：后续首页、Showcase、营销页和 AI 生成页面的设计依据。

如果修改首页视觉，应同步更新本规范；如果只新增页面，应优先遵循本规范，不要重新发明一套视觉系统。
