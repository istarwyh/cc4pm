# cc4pm -- Showcase 页面完整设计规格

> 本文档为 Builder 的唯一实现依据。所有数值、颜色、间距、动画参数均为最终值，无需猜测。

---

## 0. 全局约束

| 项目 | 值 |
|---|---|
| 文件 | 单个 `showcase/index.html`，纯静态，零外部依赖 |
| 语言 | 中文（所有可见文本） |
| 主题 | 仅暗色，无切换 |
| 总大小 | < 200KB（含内联 CSS/JS） |
| 路由 | 无，锚点定位各 section（`#hero`, `#architecture`, `#capabilities`, `#platforms`, `#install`, `#community`, `#cta-footer`） |
| 浏览器 | 现代浏览器（Chrome 90+, Firefox 90+, Safari 15+, Edge 90+） |
| 数据 | 全部硬编码，不请求外部 API |

---

## 1. 色彩方案

### 1.1 背景层级

| 用途 | Hex | CSS 变量 |
|---|---|---|
| 页面底色 | `#0A0E17` | `--bg-base` |
| Section 交替背景 | `#0F1420` | `--bg-elevated` |
| 卡片/面板背景 | `#151B2B` | `--bg-card` |
| 卡片悬浮态背景 | `#1A2236` | `--bg-card-hover` |
| 弹出层/模态背景 | `#1E2640` | `--bg-overlay` |

### 1.2 文字色

| 用途 | Hex | CSS 变量 |
|---|---|---|
| 主标题/强调文字 | `#F0F4FC` | `--text-primary` |
| 正文 | `#B4BCD0` | `--text-secondary` |
| 辅助说明/标签 | `#6B7A99` | `--text-muted` |
| 禁用/占位 | `#3D4A66` | `--text-disabled` |

### 1.3 六大组件色 (用于架构图、徽章、渐变高亮)

| 组件 | 主色 Hex | 浅色(20%透明) | CSS 变量 |
|---|---|---|---|
| Agents | `#3B82F6` | `#3B82F633` | `--color-agents` |
| Skills | `#10B981` | `#10B98133` | `--color-skills` |
| Commands | `#F59E0B` | `#F59E0B33` | `--color-commands` |
| Hooks | `#8B5CF6` | `#8B5CF633` | `--color-hooks` |
| Rules | `#EF4444` | `#EF444433` | `--color-rules` |
| MCP Configs | `#06B6D4` | `#06B6D433` | `--color-mcp` |

### 1.4 功能色

| 用途 | Hex | CSS 变量 |
|---|---|---|
| 主 CTA 按钮渐变起 | `#6366F1` | `--cta-from` |
| 主 CTA 按钮渐变止 | `#8B5CF6` | `--cta-to` |
| 主 CTA 悬浮渐变起 | `#818CF8` | `--cta-hover-from` |
| 主 CTA 悬浮渐变止 | `#A78BFA` | `--cta-hover-to` |
| GitHub Star 按钮背景 | `#21262D` | `--btn-github-bg` |
| GitHub Star 按钮边框 | `#30363D` | `--btn-github-border` |
| 终端绿色(提示符/成功) | `#4ADE80` | `--terminal-green` |
| 终端黄色(警告) | `#FBBF24` | `--terminal-yellow` |
| 终端蓝色(信息) | `#60A5FA` | `--terminal-blue` |
| 终端红色(光标) | `#F87171` | `--terminal-cursor` |
| 链接色 | `#818CF8` | `--link-color` |
| 链接悬浮 | `#A5B4FC` | `--link-hover` |
| 边框默认 | `#1E293B` | `--border-default` |
| 边框高亮 | `#334155` | `--border-highlight` |

---

## 2. 字体方案

```css
:root {
  --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
```

### 2.1 字号体系

| 标记 | 桌面 | 平板 | 手机 | 行高 | 字重 | 用途 |
|---|---|---|---|---|---|---|
| `--text-hero` | 72px | 56px | 40px | 1.1 | 800 | Hero 主标题 |
| `--text-h1` | 48px | 40px | 32px | 1.2 | 700 | Section 标题 |
| `--text-h2` | 32px | 28px | 24px | 1.3 | 600 | 子标题 |
| `--text-h3` | 24px | 22px | 20px | 1.4 | 600 | 卡片标题 |
| `--text-body` | 18px | 17px | 16px | 1.7 | 400 | 正文 |
| `--text-small` | 14px | 14px | 13px | 1.6 | 400 | 标签/辅助文字 |
| `--text-mono` | 15px | 14px | 13px | 1.6 | 400 | 代码/终端 |
| `--text-stat` | 56px | 44px | 36px | 1.0 | 800 | 数字统计 |

---

## 3. 间距与布局系统

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
  --border-radius-sm: 6px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
}
```

**页面内容区**: `max-width: var(--container-max); margin: 0 auto; padding: 0 24px;`
**Section 间距**: 每个 section `padding: var(--space-5xl) 0;`（128px 上下）
**卡片间距**: 网格 gap `var(--space-lg)`（24px）

---

## 4. 响应式断点

| 名称 | 断点 | 列数 | 容器 padding |
|---|---|---|---|
| Desktop | >= 1024px | 按 section 定义 | 24px |
| Tablet | 768px -- 1023px | 2 列 | 20px |
| Mobile | < 768px | 1 列 | 16px |

---

## 5. 通用动画参数

### 5.1 滚动驱动入场动画 (Intersection Observer)

```
触发阈值: 0.15 (元素 15% 可见时触发)
rootMargin: "0px 0px -60px 0px"
```

| 动画类型 | 初始状态 | 结束状态 | duration | easing |
|---|---|---|---|---|
| fade-up | `opacity:0; translateY(30px)` | `opacity:1; translateY(0)` | 600ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| fade-in | `opacity:0` | `opacity:1` | 500ms | `ease-out` |
| scale-in | `opacity:0; scale(0.92)` | `opacity:1; scale(1)` | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| slide-left | `opacity:0; translateX(-40px)` | `opacity:1; translateX(0)` | 600ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| slide-right | `opacity:0; translateX(40px)` | `opacity:1; translateX(0)` | 600ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |

**子元素交错**: 同一组中的子元素依次延迟 80ms（第1个 0ms, 第2个 80ms, 第3个 160ms...）

### 5.2 数字计数动画

```
duration: 2000ms
easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)  // ease-out-quad
起始值: 0
格式: 整数，到达目标值后追加后缀（如 "K+", "个" 等）
触发: 元素进入视口时开始，仅触发一次
帧率: requestAnimationFrame
```

### 5.3 交互微动画

| 对象 | 触发 | 效果 | duration | easing |
|---|---|---|---|---|
| 卡片 | hover | `translateY(-4px)`, `box-shadow` 增强, 边框色变为组件色 | 250ms | `ease-out` |
| 按钮(CTA) | hover | 渐变色亮度+10%, `translateY(-2px)`, `box-shadow: 0 8px 24px rgba(99,102,241,0.3)` | 200ms | `ease-out` |
| 按钮(CTA) | active | `translateY(0)`, shadow 收缩 | 100ms | `ease-in` |
| 链接 | hover | 颜色变为 `--link-hover`，下划线从左滑入(width 0->100%) | 200ms | `ease-out` |
| Tab | 切换 | 下划线滑动到新位置，内容 fade 切换 | 300ms | `ease-in-out` |
| 架构图节点 | hover | `scale(1.08)`, 发光效果(`box-shadow: 0 0 20px` 组件色半透明) | 200ms | `ease-out` |
| 架构图节点 | click | 展开详情面板(高度从0展开) | 350ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 复制按钮 | click | 图标从 "copy" 变 "check"，2s 后恢复 | 200ms | `ease-out` |

---

## 6. 导航栏 (固定顶部)

### 布局
- 固定定位 `position: fixed; top: 0; z-index: 100;`
- 高度: 64px
- 背景: `rgba(10, 14, 23, 0.85)` + `backdrop-filter: blur(12px) saturate(180%)`
- 下边框: `1px solid var(--border-default)`
- 滚动超过 80px 后加 `box-shadow: 0 1px 12px rgba(0,0,0,0.3)`

### 内容 (左 -- 中 -- 右)
- **左**: 项目名 `ECC` 用 `--font-mono`，20px，700 weight，`--text-primary` 色。旁边 version badge `v1.8.0`，12px，`--text-muted`，带 `--border-default` 边框圆角pill
- **中**: 锚点链接 -- `架构` | `能力` | `平台` | `安装` | `社区`，14px，`--text-secondary`，hover 变 `--text-primary`，当前 section 高亮为 `--cta-from` 色
- **右**: GitHub Star 按钮 (小尺寸, 内联 SVG star 图标 + "Star" 文字 + "50K+" 数字)

### 移动端 (< 768px)
- 中间导航隐藏，改为汉堡菜单图标（3条线，20px 宽）
- 点击展开全屏菜单，背景 `var(--bg-base)` + `opacity: 0.98`
- 菜单项垂直排列，24px 字号，间距 `--space-2xl`
- 关闭按钮右上角 X 图标

---

## 7. Section 1 -- Hero (`#hero`)

### 背景
- `var(--bg-base)` 底色
- 装饰: 顶部居中一个径向渐变光晕 `radial-gradient(ellipse 600px 400px at 50% 20%, rgba(99,102,241,0.12) 0%, transparent 70%)`
- 底部装饰: 细微网格线 `background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px); background-size: 60px 60px;`
- 网格线仅覆盖 Hero 区域，高度 100vh

### 布局
- `min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center;`
- 内容从导航高度(64px)下方开始

### 内容 (从上到下)

1. **顶部徽章** (入场: fade-in, delay 0ms)
   - pill 形状，`background: var(--bg-card); border: 1px solid var(--border-highlight); border-radius: 99px; padding: 6px 16px;`
   - 内容: `Anthropic 黑客松获奖项目` + 闪烁的小星 emoji 用 CSS 动画模拟(一个 4px 的 `var(--terminal-yellow)` 圆点，`animation: pulse 2s infinite`)
   - 字号 13px，`--text-muted`

2. **主标题** (入场: fade-up, delay 100ms)
   - 第一行: `Everything` 用 `--text-primary`
   - 第二行: `Claude Code` 用渐变文字 `linear-gradient(135deg, var(--cta-from), var(--cta-to), #06B6D4)`，`-webkit-background-clip: text;`
   - 字号 `--text-hero`，字重 800，字间距 `-0.03em`

3. **副标题** (入场: fade-up, delay 200ms)
   - `经过 10 个月高强度日常使用锤炼的 Claude Code 插件全集`
   - 字号 `--text-body`（桌面 20px 例外），`--text-secondary`，`max-width: 640px; margin: 0 auto;`

4. **统计数字栏** (入场: fade-up, delay 300ms)
   - 横向排列，6 个统计项，用竖线分隔(1px `--border-default`)
   - 布局: `display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;`
   - 每个统计项:
     - 数字: `--text-stat` 字号，`--text-primary`，**计数动画**
     - 标签: `--text-small`，组件对应色
   - 数据:

   | 数字 | 标签 | 颜色 |
   |---|---|---|
   | 50K+ | GitHub Stars | `--text-muted` |
   | 94 | Skills | `--color-skills` |
   | 48 | Commands | `--color-commands` |
   | 18 | Agents | `--color-agents` |
   | 59 | Rules | `--color-rules` |
   | 997 | Tests | `--text-muted` |

5. **CTA 按钮组** (入场: fade-up, delay 400ms)
   - 横向排列，`gap: 16px;`，居中
   - **主 CTA**: `background: linear-gradient(135deg, var(--cta-from), var(--cta-to)); color: white; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;`
     - 文字: `立即安装`
     - 左侧终端图标(内联 SVG `>_` 符号, 20px)
   - **GitHub Star CTA**: `background: var(--btn-github-bg); border: 1px solid var(--btn-github-border); color: var(--text-primary); padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 500;`
     - GitHub SVG 图标(20px) + `Star on GitHub`
   - 移动端按钮堆叠(`flex-direction: column; width: 100%;`)

6. **安装命令预览** (入场: fade-up, delay 500ms)
   - 终端风格容器，`background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 12px; padding: 16px 20px; max-width: 520px; margin: 24px auto 0;`
   - 顶部: 三个小圆点(12px, `#EF4444` `#F59E0B` `#10B981`)，右侧复制按钮
   - 内容: `$ npx ecc typescript` 用 `--font-mono`，`$` 符号用 `--terminal-green`，命令用 `--text-primary`
   - 复制按钮: 点击后复制 `npx ecc typescript` 到剪贴板，图标变为 check mark 2s

### 动画
- 背景网格线有轻微视差: `transform: translateY(calc(var(--scroll-y) * 0.05))` (通过 JS scroll listener 设置 CSS 变量)

---

## 8. Section 2 -- 架构总览 (`#architecture`)

### 背景
- `var(--bg-elevated)`

### 标题区
- Section 标签: `架构` 大写标签，12px，字间距 `0.1em`，`--cta-from` 色，`--font-mono`
- 主标题: `六大核心组件`，`--text-h1`
- 副标题: `模块化架构，即插即用，按需组合`，`--text-body`，`--text-secondary`

### 架构交互图

**桌面布局**: 中心放射状布局，中间一个大圆(项目核心)，周围 6 个组件节点环绕

- **中心节点**:
  - 圆形，120px 直径，`background: var(--bg-card); border: 2px solid var(--border-highlight);`
  - 内容: `ECC` 文字 + `v1.8.0` 小字
  - 6 条连接线从中心射出到各节点(SVG line，`stroke: var(--border-default); stroke-width: 1; stroke-dasharray: 4 4;`)
  - 连接线有流动动画: `stroke-dashoffset` 从 0 到 -8，duration 1.5s，infinite

- **6 个组件节点** (均匀分布在半径 220px 的圆上):

  | 位置角度 | 组件 | 图标(内联SVG) | 数量 | 描述 |
  |---|---|---|---|---|
  | 270deg (上) | Agents | 机器人头轮廓 | 18 | 专精子代理 |
  | 330deg (右上) | Skills | 闪电 | 94 | 工作流技能 |
  | 30deg (右下) | Commands | 终端提示符 | 48 | 斜杠命令 |
  | 90deg (下) | Hooks | 钩子/回调箭头 | 2 | 触发器钩子 |
  | 150deg (左下) | Rules | 盾牌 | 59 | 编码规则 |
  | 210deg (左上) | MCP Configs | 插头/连接器 | 1 | 外部集成 |

- **节点样式**:
  - 圆角方块 `width: 140px; height: 140px; border-radius: 16px; background: var(--bg-card); border: 1px solid` 对应组件色 20% 透明
  - 内容垂直排列: 图标(32px, 组件色) -> 名称(16px, `--text-primary`, 600) -> 数量(24px, 组件色, 700) -> 一句话(12px, `--text-muted`)
  - Hover: `scale(1.08)`, 边框变组件色实色, `box-shadow: 0 0 24px` 组件色 25% 透明

- **点击展开**: 点击任一节点，下方滑出详情面板
  - 面板: `background: var(--bg-card); border: 1px solid var(--border-highlight); border-radius: 16px; padding: 24px; margin-top: 24px;`
  - 内容: 组件详细列表(分两栏网格)，每项一行，图标+名称+一句话描述
  - 展开动画: `max-height: 0 -> auto`(实际用固定高度), `opacity: 0 -> 1`, duration 350ms
  - 同时只能展开一个节点，切换时先收起旧的(200ms)再展开新的(350ms)

**各组件展开详情数据**:

Agents (18个): architect, build-error-resolver, chief-of-staff, code-reviewer, database-reviewer, doc-updater, e2e-runner, go-build-resolver, go-reviewer, harness-optimizer, kotlin-build-resolver, kotlin-reviewer, loop-operator, planner, python-reviewer, refactor-cleaner, security-reviewer, tdd-guide

Commands (48个, 列举代表性的): /tdd, /plan, /e2e, /code-review, /build-fix, /learn, /skill-create, /evolve, /verify, /claw, /orchestrate, /checkpoint, /eval, /quality-gate, /loop-start, /sessions, /resume-session, /prompt-optimize, /multi-plan, /multi-execute 等

Skills (94个, 列举代表性分类):
- 开发模式: coding-standards, backend-patterns, frontend-patterns, api-design, tdd-workflow
- 语言专精: golang-patterns, kotlin-patterns, python-patterns, swift-concurrency, django-patterns
- AI工程: agentic-engineering, autonomous-loops, continuous-learning, eval-harness, prompt-optimizer
- 安全: security-review, security-scan
- 内容: article-writing, content-engine, investor-materials, market-research

**平板/移动端**: 改为 2x3 网格(平板) 或竖向卡片列表(手机)，去掉中心节点和连线，直接展示 6 张组件卡片

---

## 9. Section 3 -- 核心能力 (`#capabilities`)

### 背景
- `var(--bg-base)`

### 标题区
- 标签: `能力`，同上标签样式
- 主标题: `开箱即用的开发超能力`
- 副标题: `从测试驱动开发到安全审计，覆盖软件工程全链路`

### Tab 切换器
- 三个 Tab: `Skills 技能` | `Commands 命令` | `Agents 代理`
- 样式: 横向排列居中，每个 tab `padding: 10px 24px; font-size: 15px; color: var(--text-muted); cursor: pointer;`
- 激活态: `color: var(--text-primary); border-bottom: 2px solid` 对应组件色
- 下划线滑动动画: `transition: left 300ms ease-in-out, width 300ms ease-in-out;`
- 移动端: tab 文字缩短为 `技能` | `命令` | `代理`

### Tab 内容

**Tab 1: Skills (默认展示)**

6 张亮点卡片，3x2 网格(桌面) / 2x3(平板) / 1x6(手机)

| 卡片 | 图标色 | 标题 | 描述 | 标签 |
|---|---|---|---|---|
| 1 | `--color-skills` | TDD 工作流 | 测试驱动开发全流程引导，红-绿-重构循环自动化 | tdd-workflow |
| 2 | `--color-skills` | 自主循环 | AI 代理自主运行的持续改进循环 | autonomous-loops |
| 3 | `--color-skills` | 安全审计 | 自动扫描代码安全漏洞和最佳实践违规 | security-scan |
| 4 | `--color-skills` | 前端模式 | 现代前端架构模式与组件设计最佳实践 | frontend-patterns |
| 5 | `--color-skills` | 评估体系 | AI 输出质量评估与基准测试框架 | eval-harness |
| 6 | `--color-skills` | 持续学习 | 从会话中提取模式，持续积累项目知识 | continuous-learning |

**Tab 2: Commands**

6 张亮点卡片:

| 卡片 | 图标色 | 标题 | 描述 | 命令 |
|---|---|---|---|---|
| 1 | `--color-commands` | /tdd | 一键启动测试驱动开发流程 | tdd |
| 2 | `--color-commands` | /plan | 生成详尽的实现计划 | plan |
| 3 | `--color-commands` | /code-review | 全方位代码质量审查 | code-review |
| 4 | `--color-commands` | /e2e | 生成和执行端到端测试 | e2e |
| 5 | `--color-commands` | /orchestrate | 多代理协作编排 | orchestrate |
| 6 | `--color-commands` | /evolve | 自我改进的技能进化循环 | evolve |

**Tab 3: Agents**

6 张亮点卡片:

| 卡片 | 图标色 | 标题 | 描述 | Agent |
|---|---|---|---|---|
| 1 | `--color-agents` | 架构师 | 系统设计与架构决策 | architect |
| 2 | `--color-agents` | 代码审查员 | 多维度代码质量审查 | code-reviewer |
| 3 | `--color-agents` | TDD 教练 | 测试驱动开发流程引导 | tdd-guide |
| 4 | `--color-agents` | 安全审查员 | 安全漏洞检测与修复建议 | security-reviewer |
| 5 | `--color-agents` | 规划师 | 任务分解与实现路径规划 | planner |
| 6 | `--color-agents` | 参谋长 | 全局协调与资源调度 | chief-of-staff |

### 卡片样式 (通用)
```
background: var(--bg-card);
border: 1px solid var(--border-default);
border-radius: var(--border-radius-lg);  /* 16px */
padding: 28px;
transition: all 250ms ease-out;
```
- 卡片内部: 顶部图标圆(48px, 组件色背景20%, 图标色实色) -> 标题(--text-h3, --text-primary, margin-top 16px) -> 描述(--text-body, --text-secondary, margin-top 8px) -> 底部标签pill(--text-small, --font-mono, 组件色文字, 组件色10%背景, border-radius 99px, padding 4px 12px, margin-top 16px)
- Hover: `translateY(-4px); border-color:` 组件色 40%透明; `box-shadow: 0 12px 40px rgba(0,0,0,0.3);`

### Tab 切换动画
- 退出: 当前内容 `opacity: 1 -> 0`, duration 150ms
- 进入: 新内容 `opacity: 0 -> 1`, duration 200ms, delay 100ms
- 内容区高度固定（取最高 tab 内容高度），避免跳动

---

## 10. Section 4 -- 跨平台支持 (`#platforms`)

### 背景
- `var(--bg-elevated)`

### 标题区
- 标签: `平台`
- 主标题: `一套配置，四大平台`
- 副标题: `Claude Code / Cursor / Codex / OpenCode，无缝切换`

### 布局
4 张平台卡片横向排列(桌面1x4, 平板2x2, 手机1x4竖排)

| 平台 | 图标描述 | 安装命令 | 描述 |
|---|---|---|---|
| Claude Code | 终端 `>_` 图标，`--cta-from`色 | `npx ecc typescript` | 原生支持，完整功能集。agents/skills/hooks/commands/rules 全覆盖 |
| Cursor | 光标箭头图标，`#00D1FF`色 | `npx ecc --target cursor` | 适配 Cursor IDE，rules/hooks/skills 迁移 |
| Codex | 代码块`</>` 图标，`#10B981`色 | `npx ecc --target codex` | OpenAI Codex CLI 兼容，agents/config 适配 |
| OpenCode | 齿轮图标，`#F59E0B`色 | `npx ecc --target opencode` | OpenCode 适配，commands/tools/plugins 迁移 |

### 卡片样式
- `background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 16px; padding: 32px; text-align: center; flex: 1;`
- 内部: 图标(40px, 居中) -> 平台名(--text-h3, 600) -> 描述(--text-body, --text-secondary, margin-top 8px) -> 安装命令行(`--font-mono`, 14px, `background: var(--bg-base)`, padding 8px 16px, border-radius 8px, margin-top 16px, 带复制按钮)
- **第一张卡片(Claude Code)** 有特殊高亮: `border-color: var(--cta-from); box-shadow: 0 0 30px rgba(99,102,241,0.1);`，顶部加 `推荐` 标签 pill

---

## 11. Section 5 -- 安装与使用 (`#install`)

### 背景
- `var(--bg-base)`

### 标题区
- 标签: `安装`
- 主标题: `三秒启动`
- 副标题: `一行命令，即刻解锁全部能力`

### 终端模拟器

- 容器: `max-width: 700px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border-default); border-radius: 16px; overflow: hidden;`
- **标题栏**: 高度 44px，`background: var(--bg-overlay); padding: 0 16px; display: flex; align-items: center;`
  - 左: 三个圆点(12px, `#EF4444` `#F59E0B` `#10B981`, gap 8px)
  - 中: 文件名 `terminal`，13px，`--text-muted`，`--font-mono`
  - 右: 空

- **终端内容区**: `padding: 20px 24px; font-family: var(--font-mono); font-size: 15px; line-height: 1.8;`

- **打字机动画** (自动播放一次，滚动到视口时触发):

```
场景 1 (延迟 500ms 开始):
  显示提示符: "~ $" (--terminal-green)
  逐字打出: "npx ecc typescript" (--text-primary)
  打字速度: 每字符 60ms

场景 2 (场景1完成后延迟 400ms):
  整行输出(非打字机，直接 fade-in 200ms):
  "✓ 已安装 18 个 agents" (--terminal-green 的 ✓，其余 --text-secondary)

场景 3 (场景2后延迟 200ms):
  "✓ 已安装 94 个 skills" (同上样式)

场景 4 (场景3后延迟 200ms):
  "✓ 已安装 48 个 commands"

场景 5 (场景4后延迟 200ms):
  "✓ 已安装 59 条 rules"

场景 6 (场景5后延迟 200ms):
  "✓ 已配置 hooks 和 MCP"

场景 7 (场景6后延迟 600ms):
  整行: "🎉 cc4pm v1.8.0 安装完成！" (--terminal-yellow 色)

场景 8 (场景7后延迟 800ms):
  提示符: "~ $"
  逐字打出: "/tdd" (--color-commands 色)

场景 9 (场景8后延迟 400ms):
  输出: "启动 TDD 工作流..." (--terminal-blue)
  输出: "正在分析项目结构..." (--text-muted)
  输出: "✓ 测试驱动开发就绪" (--terminal-green)

光标: 在最后一行末尾闪烁的方块光标
  大小: 8px x 18px
  颜色: var(--terminal-cursor)
  动画: opacity 0/1 切换, 530ms interval
```

### 终端下方 -- 快速安装按钮

- 两个按钮并列(同 Hero CTA 样式但稍小):
  - `Plugin Marketplace 安装` (主 CTA 样式, 点击复制 marketplace 安装命令)
  - `npm 安装` (次要样式, 点击复制 `npm install -g cc4pm`)
- 下方小字: `支持 npm / pnpm / yarn / bun`，`--text-muted`，13px

---

## 12. Section 6 -- 社区与生态 (`#community`)

### 背景
- `var(--bg-elevated)`

### 标题区
- 标签: `社区`
- 主标题: `开源社区驱动`
- 副标题: `超过 50,000 开发者的共同选择`

### 内容: 三栏布局 (桌面3列, 平板1列, 手机1列)

**栏 1: 里程碑时间线**

- 垂直时间线，左侧竖线(2px, `--border-highlight`)，右侧内容
- 时间线节点: 8px 圆点，`--cta-from` 色

| 时间 | 事件 |
|---|---|
| 2025.05 | v0.1 -- 项目启动，首个 Claude Code 配置集 |
| 2025.08 | Anthropic 黑客松获奖 |
| 2025.10 | v1.0 -- 跨平台支持 (Cursor/Codex/OpenCode) |
| 2026.01 | 50,000 GitHub Stars |
| 2026.03 | v1.8 -- 自我改进循环、编排引擎 |

- 字号: 时间 13px `--text-muted` `--font-mono`; 事件 16px `--text-primary`; 描述 14px `--text-secondary`

**栏 2: 项目数据**

竖向排列的数据卡片:

| 指标 | 值 | 说明 |
|---|---|---|
| GitHub Stars | 50,000+ | 开源社区认可 |
| 测试覆盖 | 997 tests | 生产级可靠性 |
| 支持语言 | 8 | TypeScript/Go/Python/Kotlin/Swift/PHP/Perl/Common |
| MIT 许可 | 完全开源 | 商用友好 |

- 每项: 数字用 `--text-stat`(但小号44px)，标签用 `--text-small`
- 数字带计数动画

**栏 3: 贡献者与链接**

- 贡献引导:
  - `加入我们` 标题，`--text-h3`
  - `欢迎提交 PR、报告 Issue、分享使用经验` 描述
  - 按钮: `查看贡献指南` -> 链接到 GitHub CONTRIBUTING.md
  - 按钮: `提交 Issue` -> 链接到 GitHub Issues

- 项目作者:
  - `作者: Affaan Mustafa`
  - Twitter/X 链接: `@affaanmustafa`

---

## 13. Section 7 -- CTA 尾部 (`#cta-footer`)

### 背景
- `var(--bg-base)`
- 大面积径向渐变: `radial-gradient(ellipse 800px 500px at 50% 60%, rgba(99,102,241,0.08) 0%, transparent 70%)`

### 布局
- `text-align: center; padding: var(--space-5xl) 0 var(--space-4xl);`

### 内容

1. **标题**: `准备好提升你的 Claude Code 了吗？`，`--text-h1`
2. **副标题**: `一行命令，解锁 94 个技能、48 个命令、18 个代理`，`--text-body`，`--text-secondary`
3. **CTA 按钮组** (同 Hero 的双 CTA，完全相同样式)
4. **安装命令** (同 Hero 的终端命令预览)

### Footer 底部
- 分隔线: `1px solid var(--border-default)`，`margin-top: var(--space-4xl);`
- 内容: `padding: var(--space-xl) 0;`
  - 左: `cc4pm v1.8.0`，`--text-muted`，`--font-mono`，13px
  - 中: `MIT License`，`--text-muted`
  - 右: GitHub 图标链接 + Twitter/X 图标链接，`--text-muted`，hover `--text-primary`
- 移动端: 三部分堆叠居中

---

## 14. 所有内联 SVG 图标规格

所有图标均为内联 SVG，`viewBox="0 0 24 24"`，`stroke="currentColor"`，`stroke-width="2"`，`fill="none"`，`stroke-linecap="round"`，`stroke-linejoin="round"`。具体路径由 Builder 实现，风格统一为 Lucide/Feather 线条风格。

需要的图标清单:
- 终端 (`>_`)
- GitHub logo
- 机器人/代理
- 闪电/技能
- 命令行提示符
- 钩子/回调
- 盾牌/规则
- 插头/连接
- 复制
- 对勾 (check)
- 星星 (star)
- 外部链接
- 汉堡菜单 (三条线)
- 关闭 (X)
- 箭头 (chevron)
- 光标箭头 (Cursor平台)
- 代码块 (`</>`)
- 齿轮

---

## 15. 性能要求

| 指标 | 目标 |
|---|---|
| HTML 文件总大小 | < 200KB |
| 首次内容绘制 (FCP) | < 500ms (本地文件) |
| JS 执行时间 | < 100ms (初始化) |
| 动画帧率 | 60fps (所有动画使用 transform/opacity) |
| 图片 | 0 张（纯 CSS + SVG） |
| 外部请求 | 0 个 |
| CSS 动画 | 优先 `will-change: transform, opacity` |
| Intersection Observer | 单个实例，监听所有需要动画的元素 |

---

## 16. 无障碍要求

- 所有交互元素有 `tabindex` 和键盘操作支持
- SVG 图标有 `aria-hidden="true"`，功能性图标有 `aria-label`
- 颜色对比度: 正文文字与背景 >= 4.5:1 (B4BCD0 on 0A0E17 = 8.2:1, 通过)
- `prefers-reduced-motion` 媒体查询: 检测到时禁用所有动画，直接显示最终状态
- 语义化 HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- 每个 section 有 `<h2>` 标题

---

## 17. 实现注意事项 (给 Builder)

1. **单文件**: 所有 CSS 用 `<style>` 标签, 所有 JS 用 `<script>` 标签, 在同一个 HTML 文件中
2. **CSS 变量**: 所有颜色、间距、字号通过 `:root` CSS 变量定义，方便维护
3. **JS 最小化**: 仅用于 Intersection Observer 动画触发、数字计数、Tab 切换、终端打字机、复制到剪贴板、导航高亮、移动端菜单。不引入任何框架
4. **终端打字机**: 用 `setTimeout` 链式调用实现，不用 CSS animation
5. **架构图连线**: 桌面端用 SVG 绝对定位叠加在节点容器上方，通过 JS 计算节点位置画线
6. **滚动监听**: 用 `requestAnimationFrame` 节流，仅更新导航高亮和视差偏移 CSS 变量
7. **输出路径**: `showcase/index.html`

---

*规格文档结束。Builder 按此文档逐 section 实现即可，所有视觉和交互细节已完全定义。*
