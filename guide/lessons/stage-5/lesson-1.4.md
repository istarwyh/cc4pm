# Lesson 24.4: Next AI Draw.io——AI 驱动的架构绘图专家

## 本课目标

- 掌握如何利用 AI 生成、修改和增强 draw.io 架构图
- 学习 Next AI Draw.io 的 MCP 集成，在终端直接绘图
- 掌握「图像转图表」与「动画连接符」等高级绘图技巧
- 理解如何用 AI 辅助可视化复杂的技术架构（如 RAG、云原生）

## 核心内容

### 为什么产品主理人需要 AI 绘图？

在产品定义和技术评审阶段，一张准确的架构图胜过千言万语。但传统绘图工具（如 Visio, Draw.io 手动操作）往往：
- **门槛高**：对齐、间距、配色耗时耗力。
- **维护难**：代码改了，图没改，文档与现实脱节。
- **沟通慢**：要把脑子里的 RAG 流程表达出来，需要反复拖拽组件。

**Next AI Draw.io** 将 LLM 的理解能力直接引入绘图流程，让你用「嘴」就能画出专业的架构图。

### 核心特性：绘图领域的「自动驾驶」

| 特性 | 说明 | 场景 |
|------|------|------|
| **自然语言生成** | 输入描述，直接生成 XML 格式的 draw.io 图表 | "生成一个包含 MFA 的用户认证流程图" |
| **图像/PDF 转换** | 上传图片或 PDF，AI 自动还原为可编辑的图表 | 把白板上的草图变成标准架构图 |
| **云架构支持** | 内置 AWS, Azure, GCP 的标准图标库 | 快速绘制标准的云端部署架构 |
| **动画连接符** | 创建动态流动的连接线，增强视觉表现力 | 演示数据在 Transformer 架构中的流动 |
| **MCP 集成** | 支持 Claude Code 命令行直接调用 | 在终端写代码的同时更新项目架构图 |

### MCP 集成：让 Claude 替你执笔

Next AI Draw.io 提供了强大的 MCP 服务器。配置好后，你不需要离开终端或 IDE 就能创建图表。

#### 快速配置（Claude Code）

```bash
# 一键安装 MCP 服务器
claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest
```

配置完成后，你可以直接对 Claude 下令：
> "帮我画一个基于 Next.js + FastAPI + PostgreSQL 的全栈架构图，标注出数据流向。"

**Claude 会自动生成 XML 并在你的默认浏览器中实时渲染出图表！**

### 提示词进阶：如何画得更好？

想要生成高质量的图表，建议使用以下提示词模板：

- **指定风格**： "使用 AWS 云架构图标，采用水平布局..."
- **定义交互**： "给数据库和后端之间的连接线添加动画效果，表示数据同步..."
- **复杂流程**： "生成一个 RAG 架构图，包含：文档分块、向量化、检索增强和 LLM 响应四部分..."
- **视觉增强**： "为这个流程图添加渐变配色，并使用带阴影的方框..."

### 三工具联合：draw.io MCP + fireworks-tech-graph + ljg-card

**三种工具，各司其职**：

| 工具 | 优势 | 适用场景 | 安装命令 |
|------|------|---------|---------|
| **draw.io MCP** | 实时预览、可视化编辑、交互式调整 | 快速原型、架构图、团队协作 | `claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest` |
| **fireworks-tech-graph** | 标准化输出、批量生成、版本控制 | 技术文档、CI/CD 集成、精确控制 | `npx skills add yizhiyanhua-ai/fireworks-tech-graph` |
| **ljg-card** | 视觉设计卡片、品味准则、多种模具 | 产品宣传、教学材料、社交媒体 | `npx skills add lijigang/ljg-skills -g --skill ljg-card` |

**推荐工作流**：

```
产品文档阶段：
  fireworks-tech-graph 生成标准架构图
  → 纳入 Git 版本控制
  → CI/CD 自动生成文档

演示汇报阶段：
  ljg-card 制作视觉冲击力强的信息图
  → 产品宣传、教学材料
  draw.io MCP 添加动画效果
  → 演示复杂流程

日常协作阶段：
  draw.io MCP 快速画图讨论
  → 实时调整、团队共识
```

### 与 cc4pm 工作流的结合

```
1. PRD 阶段 (Lesson 14):
   让 John 代理写完 PRD，用 draw.io MCP 快速生成用户流程图原型。

2. 架构设计 (Lesson 21):
   在 Plan 模式下用 fireworks-tech-graph 生成标准架构图，纳入文档版本控制。

3. 演示汇报 (Lesson 20):
   将 fireworks-tech-graph 生成的 SVG 导入 draw.io，添加动画连接符增强视觉冲击力。
```

---

## 实操练习

### 练习 1：draw.io MCP 实时绘图

1.  确保你已安装 `drawio` MCP：`claude mcp add drawio -- npx @next-ai-drawio/mcp-server@latest`
2.  对 Claude 说："请根据 `package.json` 的依赖项，为当前项目生成一个高层的技术栈架构图。"
3.  在打开的浏览器窗口中查看生成的图表，并尝试通过对话进行微调（例如："把图标换成浅蓝色"）。

### 练习 2：fireworks-tech-graph 标准化生成

1.  安装 skill：`npx skills add yizhiyanhua-ai/fireworks-tech-graph`
2.  对 Claude 说："/fireworks-tech-graph 生成一个 RAG 架构的数据流图"
3.  查看生成的 SVG 和 PNG 文件，尝试在 https://app.diagrams.net/ 导入 SVG 进行编辑。

### 练习 3：ljg-card 视觉卡片

1.  安装 skill：`npx skills add lijigang/ljg-skills -g --skill ljg-card`
2.  对 Claude 说："/ljg-card -i 为 cc4pm 创建一张产品介绍信息图"
3.  查看生成的 PNG，适合用于产品宣传、教学材料、社交媒体。

### 练习 4：三工具联合流程

1.  用 fireworks-tech-graph 生成项目架构图（技术文档用）
2.  用 ljg-card 制作产品核心价值信息图（对外宣传用）
3.  用 draw.io MCP 快速画流程图与团队讨论（协作用）

---

## 相关概念

- **Design Agent Workflow**（Lesson 17.2）— Draw.io 将设计代理的产出可视化为架构图
- **WDS（Web Design System）**（Lesson 17）— 架构绘图是 WDS 视觉交付的扩展

## 下一步

- [1] 返回 Lesson 24：高级特性
- [2] 前往 Lesson 25：完整项目实战
- [3] 返回主菜单

---
*阶段 5 | Lesson 24.4/26 | 上一课: Lesson 24.3 - LLM Wiki | 下一课: Lesson 24.5 - graphify 知识图谱*
