# Lesson 17.2: AI 原型实验室——从场景到交互式 HTML

## 本课目标

- 掌握设计代理（Design Agent）的自动化协作流
- 学习使用 HTML + React + Babel 构建无需编译的即时原型
- 了解原型状态持久化与样式隔离的最佳实践
- 实现从 UX 场景（Phase 3）到视觉交付（Phase 8）的快速跃迁

> **前置知识**：你已经掌握了 UI 设计模式（Lesson 17.1）和 UX 场景设计（Lesson 19）。现在，我们要把这些文字描述变成用户可以点击、滑动的真实原型。

## 核心内容

### 设计代理的工作流水线

当你请求 AI 生成 UI 时，它不仅仅是在"画图"，而是在执行一套标准的设计工程流：

1. **理解与澄清**：通过 `/questions_v2` 确认输出格式、保真度、品牌规范。
2. **资源探索**：读取项目现有的设计系统定义。
3. **规划 (Todo List)**：拆解页面组件和交互逻辑。
4. **构建 (Build)**：生成目录结构并编写代码。
5. **校验与完成 (Done)**：调用 `done` 渲染预览，并通过校验代理检查。

### 无编译 React 原型架构

为了实现"即插即用"且易于 AI 修改，cc4pm 推荐使用**内联脚本式 React 架构**。这不需要复杂的 Webpack 或 Vite 环境，只需几个 CDN 脚本即可启动：

```html
<!-- 在 HTML 中直接运行 React -->
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin></script>

<div id="root"></div>

<script type="text/babel">
  const App = () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello cc4pm!</h1>
    </div>
  );
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

**关键约束（避坑指南）**：
- **样式隔离**：不要使用通用的 `const styles = { ... }`。如果导入多个组件，会发生命名冲突。**必须**使用 `const componentNameStyles = { ... }` 或直接使用内联样式。
- **作用域共享**：在多个 `<script type="text/babel">` 之间共享组件时，需要手动挂载到 `window`：`Object.assign(window, { MyComponent });`。

### 高级交互特性

#### 1. 状态持久化 (Persistence)
对于幻灯片或视频类原型，刷新页面丢失进度非常痛苦。
**技巧**：将当前页码或播放时间存储在 `localStorage` 中，并在初始化时读取。
```javascript
const [currentSlide, setCurrentSlide] = useState(
  parseInt(localStorage.getItem('slide_pos') || '1')
);
useEffect(() => {
  localStorage.setItem('slide_pos', currentSlide);
}, [currentSlide]);
```

#### 2. 反馈表单 (`questions_v2`)
设计是一个迭代过程。你可以指示代理生成一个反馈问卷，通过 `slider`（滑块）、`svg-options`（视觉选项）收集用户对间距、色调或布局的偏好。

### 拆分大文件

当原型文件超过 1000 行时，AI 的修改效率会急剧下降。
**最佳实践**：
- 将大型组件拆分为独立的 `.jsx` 文件。
- 在主 HTML 中依次引入这些脚本。
- 确保子组件已通过 `window` 导出。

### Junior Designer 工作流

专业设计师不会闷头做三天再给老板看——他们会在第一稿就展示方向，然后快速迭代。AI 生成原型也应该如此。

**核心原则：理解错了早改比晚改便宜 100 倍。**

标准流程：

```
1. 开工前：列出 assumptions + placeholders + reasoning
   → 一次性发给用户，等批量答完再动手

2. 骨架阶段：先输出灰色方块 + 占位文字
   → 尽早 show 给用户确认方向

3. 填充阶段：替换为实际内容
   → show 给用户确认内容

4. 变体阶段：生成 2-3 个风格/布局变体
   → 让用户选择

5. 精调阶段：Tweaks 面板实时调参
   → 用户自己微调

6. 交付前：用 Playwright 跑一遍浏览器验证
   → 确保交互正常
```

**在 HTML 中嵌入 reasoning**：

```html
<!--
  ASSUMPTIONS:
  - 用户是 iOS 用户，期望底部 Tab Bar 导航
  - 主色调使用品牌橙色 (#E85D3A)
  - 需要展示 3 个核心功能卡片

  PLACEHOLDERS:
  - 用户头像：使用 initials avatar 替代
  - 产品截图：使用纯色占位块

  REASONING:
  - 首屏聚焦价值主张，不放注册表单
  - CTA 按钮使用高对比色，引导用户行动
-->
```

### Playwright 自动化视觉验证

原型做好后，不能只靠肉眼检查——用 Playwright 自动点击关键路径：

```bash
# 验证原型的交互流程
npx playwright test prototype.spec.js
```

Playwright 能做的事：
- 自动点击按钮，验证页面切换是否正常
- 截图对比，检测视觉回归
- 模拟不同设备尺寸（iPhone、iPad、Desktop）
- 验证动画是否正常播放

**与 fork_verifier_agent 的关系**（Lesson 22.2）：Playwright 验证"能不能点"，fork_verifier 验证"好不好看"。两者互补。

### HTML Slides → 可编辑 PPTX

HTML 原型不只是 App 交互——它还能生成演示文稿：

**流程**：
1. 用 HTML 写幻灯片（浏览器全屏演讲）
2. `html2pptx.js` 读取 DOM 的 `computedStyle`
3. 逐元素翻译成 PowerPoint 对象
4. 导出的是**真文本框**——PPT 里双击即可编辑

**为什么不用 Figma 导出 PPT？**

| 方式 | 优点 | 缺点 |
|------|------|------|
| Figma 导出 | 视觉保真度高 | 导出的是图片，不可编辑 |
| HTML → PPTX | 文本可编辑，数据可驱动 | 复杂动画会丢失 |
| 手动做 PPT | 完全可控 | 耗时，难以版本管理 |

产品主理人的最佳实践：先用 HTML 快速迭代设计，确认后导出 PPTX 给非技术团队成员编辑。

## 常见问题

**Q: 为什么不用 Tailwind CSS？**
A: 虽然 Tailwind 很流行，但在纯 HTML 原型中引入它可能导致样式冲突或加载缓慢。cc4pm 优先推荐**原生 CSS 或 CSS-in-JS (Style objects)**，这能让 AI 更精确地控制视觉细节。

**Q: 我应该如何给 AI 下达设计指令？**
A: 引用你在 Lesson 17.1 学到的 UI 模式名。
`"帮我做一个 Landing Page，Hero Section 使用 Full Bleed 背景，下方跟随一个 Bento Grid 布局的功能展示区。"`

## 相关概念

- **WDS（Web Design System）**（Lesson 17）— 设计代理工作流是 WDS 的自动化执行层
- **Saga + Freya Agent**（Lesson 17）— 本课的 Design Agent 即 Saga 和 Freya 的协作流
- **UI Patterns**（Lesson 17.1）— 原型组件使用 UI 设计词典中的标准模式
- **fork_verifier_agent**（Lesson 22.2）— 原型构建后的视觉校验工具
- **品牌资产协议与设计交付**（Lesson 17.8）— 品牌色提取、设计评审、动画导出

## 下一步

- [1] 进入下一课：Lesson 17.3 - 设计系统搭建：从 Tokens 到组件封装
- [2] 跳到核心课：Lesson 18 - Trigger Map：用户心理→功能映射
- [3] 返回主菜单

---
*阶段 3 | Lesson 17.2/26 | 上一课: Lesson 17.1 - UI 设计词典 | 下一课: Lesson 17.3 - 设计系统搭建*
