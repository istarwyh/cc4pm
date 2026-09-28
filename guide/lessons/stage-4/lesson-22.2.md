# Lesson 22.2: 视觉校验——让 AI 拥有"眼睛"

## 本课目标

- 掌握使用 `fork_verifier_agent` 进行自动化视觉检查
- 理解 `<mentioned-element>` 块在精确反馈中的作用
- 学习如何通过 `dom:` 和 `react:` 链定位渲染源码
- 建立"反馈-修正-验证"的设计闭环

> **前置知识**：你已经在 Lesson 22 学习了 TDD 和代码审查，在 Lesson 17.2 学习了如何构建 HTML 原型。现在，我们要解决最后一个难题：如何让 AI 知道它画出来的东西对不对？

## 核心内容

### 视觉校验代理 (Verifier Agent)

在传统的代码开发中，我们可以运行单元测试。但在 UI 开发中，"样式是否崩坏"、"按钮是否对齐"很难通过纯代码逻辑判断。

`fork_verifier_agent` 是你的视觉监工：
1. **自动扫描**：它会在后台打开你的 HTML，检查浏览器控制台错误和网络请求失败。
2. **截图对比**：它能拍摄页面截图并进行像素级或语义级分析。
3. **定向检查**：你可以指派具体任务，如 `"检查页面在移动端断点下的间距是否合理"`。

**操作流**：
当你完成原型修改后，代理会报告 `done`。此时你可以主动要求：
`"Fork 一个校验代理，检查这个滑动条是否能正常工作，并给一张截图。"`

### 精确反馈：`<mentioned-element>`

当你在预览界面点击、拖拽或标注某个元素时，cc4pm 会自动生成一个 `<mentioned-element>` 块随你的消息发送。

这个块包含：
- `dom:`：元素的 DOM 祖先链（例如 `div > section > button`）。
- `react:`：React 组件名链（例如 `App > LandingPage > Hero > CTAButton`）。
- `id:`：运行时的唯一标识（注意：这不在源码中，是实时渲染的句柄）。
- `[data-screen-label]`：通过你在元素上标记的标签（如 "01 Title"），代理能立刻知道你在说哪张幻灯片。

**为什么这很重要？**
AI 不需要全文检索"那个红色的按钮"，它通过这些元数据可以直接定位到 `Hero.jsx` 的第 42 行。

### 给幻灯片打标签

为了让反馈更精准，建议在代表"屏幕"或"幻灯片"的高层级元素上添加 `data-screen-label` 属性：

```html
<section data-screen-label="01 欢迎页">
  <!-- 内容 -->
</section>
```

**避坑指南**：
- **1-indexed**：人类习惯从 1 开始计数。标记 "01", "02" 而不是 "0", "1"。
- **描述性名称**：比起 "Screen 1"，"01 登录弹窗" 更有助于 AI 理解上下文。

### 修复循环 (Fix Loop)

1. **发现问题**：你在预览中看到间距太窄。
2. **下达指令**：点击该区域并输入 `"这里的 padding 增加到 24px"`。
3. **AI 修正**：AI 利用 `mentioned-element` 瞬间定位源码并修改。
4. **验证**：AI 调用 `done` 后，`fork_verifier_agent` 自动确认控制台无错。

### Chrome DevTools MCP：把浏览器调试台交给 AI

如果你做的是网页或交互式课件，截图只是第一层“眼睛”。更完整的做法，是让 AI 直接接入 Chrome DevTools：它能看页面、点按钮，也能读 Console、Network、Performance trace。

Chrome DevTools MCP 通过 **CDP（Chrome DevTools Protocol，Chrome 调试协议）** 把一整套 DevTools 能力暴露给 Claude：

| 能力 | 你可以这样要求 AI | 验收价值 |
|------|------------------|----------|
| 截图与点击 | “打开本地预览，截图并点击登录按钮” | 确认页面真实可见、交互可触发 |
| 表单填写 | “填一遍注册表单，检查错误提示” | 验证关键用户路径 |
| Console | “读控制台报错，带 source map 找到源码位置” | 不只看到报错，还能定位修复点 |
| Network | “检查接口请求、状态码和返回体” | 发现资源 404、接口失败、鉴权问题 |
| Performance | “录一段 trace，指出首屏慢在哪里” | 让性能优化有证据，不靠感觉 |
| Memory | “抓一次堆快照，看是否有明显泄漏” | 排查长页面或复杂交互的内存问题 |

这类工具特别适合放在“最后验收”环节：代码通过测试后，再让 AI 进浏览器看真实效果。

**安装方式 1：直接添加 MCP**

```bash
claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest
```

> 如果你的 Claude Code 版本要求 `--scope` 放在前面，也可以写成：`claude mcp add --scope user chrome-devtools -- npx chrome-devtools-mcp@latest`。关键是：名字叫 `chrome-devtools`，命令是 `npx chrome-devtools-mcp@latest`，scope 选 `user` 代表所有项目可用。

**安装方式 2：通过插件市场**

```bash
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp@chrome-devtools-plugins
```

插件方式会额外带一套配套 Skill，更适合不想记工具细节、希望 Claude 自动选择“性能/网络/调试/内存”能力的人。

**独立 Chrome Profile**

默认情况下，Chrome DevTools MCP 会拉起一份独立配置的 Chrome，profile 放在：

```text
~/.cache/chrome-devtools-mcp
```

这意味着它不会污染你日常使用的 Chrome。登录态会保留在这份 profile 里，所以你可以先在它打开的浏览器中登录测试账号，之后让 AI 复用。若某次任务需要完全干净的浏览器环境，就在启动参数里加 `--isolated`，用完即清理。

**典型验收提示词**

```text
请用 Chrome DevTools MCP 打开 http://localhost:3000，完成一次视觉验收：
1. 截图首页，检查是否有明显布局错位
2. 读取 Console，定位所有 error/warn
3. 查看 Network 中失败请求
4. 录一段 Performance trace，总结首屏瓶颈和可执行优化建议
```

注意：同一项目不要同时启用太多浏览器 MCP。你可以把 Playwright MCP 用于脚本化 E2E，把 Chrome DevTools MCP 用于调试与性能诊断；如果 Claude 开始在工具之间反复切换，就明确指定“本轮只用 Chrome DevTools MCP”。

## 常见问题

**Q: 校验代理说 "Page loads cleanly" 是什么意思？**
A: 这意味着 HTML 没有语法错误，资源（JS/CSS）加载正常，且没有触发 JavaScript 崩溃。这是高保真原型的最低质量门禁。

**Q: 为什么 AI 有时找不到我提到的元素？**
A: 如果你的组件树极其复杂（例如超过 10 层嵌套），或者在源码中使用了大量的动态映射，定位可能会失效。尝试拆分组件（Lesson 17.2）并保持 DOM 结构清晰。

**Q: 已经有 Playwright MCP，还需要 Chrome DevTools MCP 吗？**
A: 两者侧重点不同。Playwright 更像“自动化测试员”，适合稳定复现流程；Chrome DevTools MCP 更像“调试工程师”，适合看 Console、Network、Performance trace 和内存。网页开发验收时二选一即可，除非你明确分工。

## 相关概念

- **Design Agent Workflow**（Lesson 17.2）— fork_verifier_agent 是设计代理流水线的校验环节
- **Eval-Driven Development (EDD)**（Lesson 22.1）— 视觉校验实现 EDD 的"评估器"角色

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 23 - 自动化工作流
- 回顾原型构建：Lesson 17.2 - AI 原型实验室
- 返回主菜单

---
*阶段 4 | Lesson 22.2/26 | 上一课: Lesson 22.1 - EDD 实战 | 下一课: Lesson 22.3 - 编码原则*
