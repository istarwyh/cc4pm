# @cc4pm/homepage

cc4pm 官网首页，可嵌入其他网站使用。发布的是包含样式和脚本的完整 HTML 页面，课程目录由仓库课表生成，阅读链接指向官方文档站。

## 安装

```bash
npm install @cc4pm/homepage
```

## 使用

### Express

```js
const { filePath } = require('@cc4pm/homepage');
app.get('/cc4pm', (req, res) => res.sendFile(filePath));
```

### Next.js

先将 HTML 复制到 `public/cc4pm.html`（见下），通过独立页面或 iframe 展示，保留菜单和课程展开交互：

```jsx
export default function CC4PM() {
  return <iframe src="/cc4pm.html" title="cc4pm" style={{ width: '100%', height: '100vh', border: 0 }} />;
}
```

### 复制到 public 目录

```bash
cp node_modules/@cc4pm/homepage/index.html public/cc4pm.html
```

## API

- `filePath` — HTML 文件的绝对路径
- `html()` — 返回 HTML 字符串

## 在源码仓库中维护

修改 `docs/index.html` 模板或 `guide/course-map.yaml` 后，在仓库根目录运行：

```bash
npm run build:homepage
npm run check:homepage
```

不要直接编辑本包的 `index.html`。内容发生变化时，提升本包版本后提交；发布工作流会拒绝用已经发布的版本号承载新内容。推送只执行校验，正式 npm 发布需手动运行 `Validate or publish @cc4pm/homepage` 工作流。主项目版本与本包版本独立维护。
