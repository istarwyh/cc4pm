const path = require('path');
const fs = require('fs');

const htmlPath = path.join(__dirname, 'index.html');

module.exports = {
  /** HTML 文件的绝对路径，可用于 express.static 或 res.sendFile */
  filePath: htmlPath,
  /** 返回 HTML 字符串 */
  html: () => fs.readFileSync(htmlPath, 'utf-8'),
};
