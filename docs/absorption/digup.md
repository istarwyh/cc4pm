# DigUp 资源与产品设计吸收记录

- 日期：2026-10-30
- 执行规范：[知识吸收命令](../../.claude/commands/absorb.md)
- 来源：[ARahim3/DigUp](https://github.com/ARahim3/DigUp)
- 核对提交：`dc2651ad8299160bbe91e972f857e1a1599a8419`
- 模型依据：[Google 官方 EmbeddingGemma 2 模型卡](https://huggingface.co/google/embeddinggemma-2)，核对当日 main；模型卡未固定 revision，后续更新需重新核对。
- 产物：[Lesson 24.12](../../guide/lessons/stage-5/lesson-1.12.md)。本次吸收课程知识和产品方法，不安装应用、不下载模型、不扫描个人资料。

## 差距矩阵

材料深度表示上游文档与源码的覆盖程度，不表示本次执行了上游桌面实测。

| topic | 中文名称 | 材料深度 | relevance | 课程现状 | 动作 |
|-------|----------|----------|-----------|----------|------|
| qmd-local-rag | 本地知识检索的用途 | explain | high | L24.3 已解释文本知识库 | 跳过重复讲解，链接分工 |
| cli-skill-vs-mcp-skill | CLI 与 Skill 的分层 | explain | high | L24.11 已详解 | 跳过通用选型，引用应用案例 |
| digup-local-search | DigUp 本地内容搜索 | hands-on | high | 未覆盖 | 新增 L24.12 实操 A |
| embeddinggemma-2-multimodal-embeddings | 模型能力与应用边界 | explain | high | 未覆盖 | 新增 L24.12 Step 1 |
| shared-multimodal-vector-space | 统一多模态向量空间 | explain | high | L24.5 涉及多模态入库，未解释此机制 | 新增 L24.12 Step 1 |
| location-aware-media-segments | 带位置的媒体切片 | hands-on | high | 未覆盖时间窗、抽帧与定位契约 | 新增 L24.12 Step 2 |
| hybrid-semantic-exact-search | 语义与精确匹配的混合排序 | explain | high | 未覆盖此实现与跨模态校准 | 新增 L24.12 Step 3 |
| local-first-search-onboarding | 本地检索首次使用设计 | explain | high | 未覆盖本机估时、部分可用索引 | 新增 L24.12 Step 4 |
| search-to-action-ux | 搜索到原片段的操作闭环 | hands-on | high | L24.7 有读书深链，未覆盖本地多媒体降级 | 新增 L24.12 Step 2、4 |
| offline-model-network-boundaries | 离线能力与数据流边界 | explain | high | 未覆盖 DigUp 网络与索引副本 | 新增 L24.12 Step 5 |
| local-search-cli-integration | 本地检索 CLI 接入 | hands-on | high | 未覆盖 DigUp helper 与 JSON | 新增 L24.12 实操 B |
| multimodal-retrieval-evaluation | 多模态检索与定位评估 | hands-on | high | 未覆盖该类查询与位置区间评测 | 新增 L24.12 实操 C |

提取 12 个知识点：已覆盖跳过 2 个，无关跳过 0 个，新增 10 个主题到 1 节补充课。没有扩充已有正文。

## 编排与预算

- 现有 L24.3 / L24.5 / L24.11 分别为 282 / 211 / 331 行，默认上限 400。
- 内容具有独立的模型、索引、产品、验证与接入主题，按规范的“3+ 个知识点”规则独立成课。
- 已检查 L24 补充编号，原最大为 24.11；新增文件 `lesson-1.12.md`，地图编号用字符串 `"24.12"`。
- 不将 DigUp 冒充上游 Skill，也不凭空添加 MCP 服务。已有教学 Skill 经同步生成新课入口。

## 事实核对与产品设计提炼

固定提交下的主要依据：

- `README.md`、`website/content/docs/{first-launch,how-it-works,privacy,command-line}.md`：安装、引导、网络、切片、命令与平台差异。
- `Sources/DigUpKit/Model.swift`：768 维相关类型、30 秒音频窗 / 25 秒步长、3 秒抽帧、1,800 字符代码片段、索引配置指纹。
- `Sources/DigUpKit/IndexStore.swift`：`files` / `segments` / 全文索引与位置字段。
- `Sources/DigUpKit/Searcher.swift`：向量、关键词与文件结果检索。
- `Sources/digup/main.swift`：`search` / `status` / `estimate` / `eval` 及 `--json`。
- `evals/{synthetic,multilingual,code}.json`：期望文件、位置区间与语言范围。

修正宣传表达：

- “全程离线”改为模型准备后本地索引与检索；首次下载、默认更新检查仍会联网。
- “斑马出现那一秒”改为相关帧或窗口定位；抽帧与窗口有粒度、漏检和打开器兼容边界。
- “开源免费”区分应用 MIT 与模型 Apache 2.0；未将模型能力当作每个平台的完整支持。
- “中文大白话可搜”列为需本机评估的查询，不引用英语、孟加拉语、阿拉伯语结果来保证中文效果。
- 不把本地索引写成加密存储，不把云端 Agent 消费检索结果写成全链路离线。

产品设计提炼明确标为迁移建议：成本前置、下载与设置并行、索引部分可用、片段预览、键盘闭环、弱结果可见、目录范围控制。教学 JSON 契约与测试表明确标为示例，不伪称真实 CLI 输出或实测成绩。

## 验证

- `node scripts/sync-courseware.js --check`：通过；新课 210 行，未新增 OVERSIZE。原有其他课程的超限警告保留。
- `npm run site:sync`：课程数量、教学 Skill、导航与首页同步；补充课从 56 增为 57。
- `npm test`：736 项通过。
- `npm run test:site`：11 项通过。
- `npm run test:site:browser`：桌面与手机共 14 项通过。
- 本地地址构建：通过，校验 93 节课程、158 个 HTML 页面、18,918 处站内链接与资源引用。
- `git diff --check`：通过。

完整 `site:check` 首次在构建阶段因预装同名 `go` 程序不是 Go 编译器而停止；补齐 Go 1.27.3 和 Hugo Extended 0.165.0 后，继续完成构建、浏览器检查与生产构建，不将工具环境失败描述为课程代码错误。

实际 DigUp 桌面练习需相应平台、模型与测试素材。本次不以源码阅读替代其桌面端到端实测。
