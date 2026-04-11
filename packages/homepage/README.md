# @cc4pm/homepage

cc4pm 官网首页，可嵌入其他网站使用。

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

```js
import homepage from '@cc4pm/homepage';

export async function getStaticProps() {
  return { props: { html: homepage.html() } };
}

export default function CC4PM({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### 复制到 public 目录

```bash
cp node_modules/@cc4pm/homepage/index.html public/cc4pm.html
```

## API

- `filePath` — HTML 文件的绝对路径
- `html()` — 返回 HTML 字符串
