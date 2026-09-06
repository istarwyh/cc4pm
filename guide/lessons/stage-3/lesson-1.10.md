# Lesson 17.10: UI 设计风格词典与选择方法

## 本课目标

- 分清产品类型、品牌气质、视觉风格和组件系统，不再用“高级一点”代替设计判断
- 用内容密度、信任要求、目标用户、品牌个性、无障碍和性能约束筛选视觉方向
- 掌握 50 个可检索的中英文 UI 风格工作词，并知道何时该用、何时该克制
- 能比较 2–3 套方向，产出可交给 Claude Code 或 Codex 的 `design-style-brief.md`

> **前置知识**：Lesson 17.5 教你识别风格，Lesson 17.7 教你把风格落到平台与 Prompt。本课不重复风格史，而是把知识整理成一套可检索、可取舍、可交付的决策工具。

## 核心内容

### 先纠正一个误区：风格名不是设计系统

“高级”“年轻”“有质感”不是可以执行的设计要求。模型只能拿训练数据里最常见的视觉组合来补空白，于是很容易生成千篇一律的渐变、玻璃卡片和大圆角。

开始选风格前，先把四个层次分开：

| 层次 | 它回答什么 | 示例 | 不能替代什么 |
|------|------------|------|--------------|
| 产品类型 | 用户来这里做什么 | 落地页、后台、实时监控、AI 助手 | 不能决定品牌个性 |
| 品牌气质 | 希望用户如何感受你 | 可信、克制、活泼、反叛 | 不能直接决定布局 |
| 视觉风格 | 页面用什么视觉语言表达 | Swiss、Neubrutalism、Aurora UI | 不能代替交互逻辑 |
| 组件系统 | 如何稳定实现和复用 | Token、按钮状态、表单、卡片 | 不能自动产生风格判断 |

**一句话关系**：产品场景给出约束，品牌气质给出方向，视觉风格给出词汇，组件系统负责把选择稳定地实现出来。

风格名称只是在缩小视觉搜索空间。信息结构、任务路径、组件状态和真实设备体验，仍然决定页面是否好用。

### 先做约束淘汰，再做审美选择

不要先问“我最喜欢哪种风格”，按下面六步筛选：

1. **用户与停留时间**：谁会看？是扫一眼、完成一次转化，还是每天工作数小时？
2. **核心动作**：阅读、注册、购买、操作工具，还是持续监控？一屏只能有一个最高优先级。
3. **内容密度**：几句话、几十项功能和几百条数据，需要完全不同的结构。
4. **信任与品牌**：金融、医疗、企业服务先建立可信度；娱乐、潮流和创意项目可以承担更强的视觉张力。
5. **设备与无障碍**：移动端如何重排？键盘焦点是否可见？状态是否只靠颜色？动效能否关闭？
6. **性能与实现预算**：模糊、3D、视频、视差和实时图表在真实设备上是否跑得动？有没有静态降级方案？

可以把选择写成一个交集：

```text
可用视觉方向
= 产品场景约束
∩ 品牌一致性
∩ 可读性与无障碍底线
∩ 响应式与性能预算
```

#### 快速筛选矩阵

| 约束最强的场景 | 优先查看 | 谨慎使用 |
|----------------|----------|----------|
| 高信息密度、长期使用 | Swiss、Bento、Flat、Data-Dense Dashboard | 夸张极简、重玻璃、持续动效 |
| 高信任要求 | Trust & Authority、Swiss Modernism 2.0、Accessible & Ethical | Cyberpunk、Vaporwave、过度 Neubrutalism |
| 单一转化目标 | Hero-Centric、Minimal & Direct、Conversion-Optimized | 功能平铺、多个同级 CTA |
| 年轻品牌、强记忆点 | Neubrutalism、Memphis、Y2K、Vibrant & Block-based | 没有品牌依据的“安全牌”混搭 |
| 沉浸展示、短时浏览 | Aurora、Motion-Driven、Parallax、3D & Hyperrealism | 在复杂表单和数据工作台全量使用 |
| 低性能设备或弱网 | Flat、Minimalism、Swiss、克制的 Bento | Liquid Glass、重 3D、全页视差与模糊 |

## 50 种 UI 风格工作词典

这份词典沿用原文的 50 个名称和英文提示词，但它不是严格的艺术史分类：其中同时包含视觉美学、布局方式、页面策略、数据产品类型、交互模式和设计原则。你应该把它当成**与 AI 对齐方向的工作词汇**，而不是必须套用的模板。

检索时直接搜索中文名或英文名。每条都包含：视觉特征、适用场景、明确的不适合场景或使用限制，以及 4 个可复用英文词。

### A. 日常产品与基础界面

1. **Bento Box Grid（便当盒网格）**｜特征：不等大的模块卡片与清晰主次｜适合：功能多、信息杂的产品首页｜不适合：卡片同权会变成整齐的杂物柜｜Prompt：`modular cards`, `asymmetric grid`, `varied sizes`, `clear hierarchy`
2. **Minimalism & Swiss Style（极简主义与瑞士风格）**｜特征：网格、字阶、留白和高对比建立秩序｜适合：企业工具、文档站、专业后台｜不适合：不能把操作反馈和可发现性一起删掉｜Prompt：`Swiss grid`, `clean typography`, `white space`, `high contrast`
3. **Glassmorphism（玻璃拟态）**｜特征：半透明卡片、背景模糊和细边框｜适合：重点浮层、品牌展示和轻量界面｜不适合：复杂背景会降低文字对比，模糊也增加性能成本｜Prompt：`frosted glass`, `transparent cards`, `blurred background`, `thin border`
4. **Neubrutalism（新粗野主义）**｜特征：粗边框、硬阴影、高饱和色和扁平块｜适合：年轻品牌、创意工具、开发者产品｜不适合：金融、医疗等严肃场景容易失去信任｜Prompt：`bold borders`, `hard shadows`, `primary colors`, `flat blocks`
5. **Exaggerated Minimalism（夸张极简主义）**｜特征：超大字体、极端留白和单一强调色｜适合：时尚、建筑、作品集首屏｜不适合：复杂表单和高密度任务会浪费空间｜Prompt：`oversized typography`, `extreme whitespace`, `high contrast`, `one accent color`
6. **Flat Design（扁平化设计）**｜特征：纯色、简单形状、干净图标、少装饰阴影｜适合：移动端和快速上线的产品｜不适合：层级不足时按钮与正文难以区分｜Prompt：`flat colors`, `simple shapes`, `clean icons`, `no decorative shadows`
7. **Dimensional Layering（维度分层）**｜特征：重叠、柔和阴影和前后景焦点｜适合：卡片系统、弹窗和重点内容｜不适合：层数过多会让页面发灰并削弱层级｜Prompt：`overlapping layers`, `z axis`, `soft shadow`, `foreground focus`
8. **Soft UI Evolution（柔和 UI 进化版）**｜特征：柔和深度、克制阴影和更明确的焦点态｜适合：健康、生活方式和轻量 SaaS｜不适合：关键按钮仍不能只靠阴影表达状态｜Prompt：`soft depth`, `better contrast`, `clear focus state`, `subtle shadow`
9. **Dark Mode OLED（OLED 深色模式）**｜特征：深黑背景、柔和白字和少量高对比强调色｜适合：开发者工具、影音和夜间应用｜不适合：大面积高亮文字会刺眼，状态对比要单独检查｜Prompt：`deep black`, `muted white`, `high contrast accents`, `night viewing`

### B. 官网与落地页

10. **Hero-Centric Design（Hero 核心型）**｜特征：强标题、产品画面和单一主按钮｜适合：价值主张明确的首屏｜不适合：信息过多会稀释唯一行动｜Prompt：`large hero`, `clear value proposition`, `single CTA`, `product visual`
11. **Minimal & Direct（极简直给型）**｜特征：单栏、短文案和最短行动路径｜适合：独立产品、个人服务和简单发布页｜不适合：复杂产品不能只剩一句口号｜Prompt：`single column`, `minimal copy`, `direct message`, `one clear action`
12. **Conversion-Optimized（转化优化型）**｜特征：表单、背书和高对比 CTA 围绕单一目标｜适合：注册、留资和活动页｜不适合：多个转化目标会互相争抢注意力｜Prompt：`form focused`, `single conversion goal`, `trust signal`, `high contrast CTA`
13. **Social Proof-Focused（社会证明型）**｜特征：评价、客户标识、案例指标和真实结果｜适合：需要降低购买风险的服务｜不适合：无法核验的评价与数据会反噬信任｜Prompt：`testimonials`, `client logos`, `case metrics`, `verified reviews`
14. **Interactive Product Demo（交互演示型）**｜特征：嵌入式演示、热点和逐步引导｜适合：需要解释操作的软件｜不适合：流程过长会消耗耐心，移动端要有简化版本｜Prompt：`embedded demo`, `interactive walkthrough`, `hover reveal`, `try live`
15. **Feature-Rich Showcase（功能展示型）**｜特征：功能网格、收益卡片和产品演示｜适合：能力多、需要分类讲解的产品｜不适合：同尺寸卡片会抹平功能主次｜Prompt：`feature grid`, `benefit cards`, `product demonstration`, `comparison`
16. **Trust & Authority（信任权威型）**｜特征：资质、安全标识、专家身份和案例数据｜适合：医疗、金融、企业服务｜不适合：所有权威材料都必须可核验｜Prompt：`certification`, `security indicator`, `expert credential`, `case metric`
17. **Storytelling-Driven（故事叙事型）**｜特征：章节结构、视觉推进和品牌旅程｜适合：品牌故事、案例和发布叙事｜不适合：技术细节不能被情绪路径藏起来｜Prompt：`narrative sections`, `visual progression`, `brand journey`, `chapter structure`

### C. 后台与数据产品

18. **Executive Dashboard（高管驾驶舱）**｜特征：大指标、趋势信号和一眼可读的摘要｜适合：管理层快速判断｜不适合：图表越多不等于信息越完整｜Prompt：`high level KPI`, `summary view`, `trend indicator`, `at a glance`
19. **Data-Dense Dashboard（高密度数据看板）**｜特征：紧凑网格、表格、筛选器和微型趋势｜适合：长期盯盘的专业用户｜不适合：不能靠缩小字号换密度，移动端要重组任务｜Prompt：`dense grid`, `data table`, `KPI cards`, `compact spacing`
20. **Real-Time Monitoring（实时监控）**｜特征：实时数据、状态灯、告警和流式图表｜适合：运维、生产和风险监控｜不适合：红色只用于真实告警，状态不能只靠颜色｜Prompt：`live data`, `status indicator`, `alert notification`, `streaming chart`
21. **Comparative Analysis Dashboard（对比分析看板）**｜特征：并列对象、周期变化、基准和差异｜适合：环比、区域与 A/B 测试｜不适合：对象多时并排卡片会失效，应换合适图表｜Prompt：`side by side comparison`, `period over period`, `benchmark`, `variance`
22. **Predictive Analytics（预测分析）**｜特征：预测线、置信区间、情景模型和异常点｜适合：趋势预判和风险分析｜不适合：不能把概率结果伪装成确定答案｜Prompt：`forecast line`, `confidence interval`, `scenario model`, `anomaly detection`
23. **Drill-Down Analytics（下钻分析）**｜特征：层级数据、可展开细节和面包屑｜适合：从全局定位到具体对象｜不适合：缺少返回路径会让用户迷失层级｜Prompt：`hierarchical data`, `expandable detail`, `breadcrumb`, `summary to detail`
24. **User Behavior Analytics（用户行为分析）**｜特征：漏斗、用户流、队列和旅程｜适合：理解浏览、考虑、转化与流失｜不适合：只展示最终转化率会丢失过程原因｜Prompt：`funnel`, `user flow`, `cohort`, `journey map`
25. **Financial Dashboard（财务看板）**｜特征：收入、损益、预算和现金流的账簿式结构｜适合：经营与财务分析｜不适合：单位、周期和正负语义必须统一｜Prompt：`revenue metrics`, `profit and loss`, `budget tracking`, `cash flow`
26. **Sales Intelligence Dashboard（销售智能看板）**｜特征：商机漏斗、配额、区域表现和输赢分析｜适合：销售管理与预测｜不适合：排行榜会改变行为，口径和更新时间必须公开｜Prompt：`deal pipeline`, `quota tracking`, `territory performance`, `win loss`
27. **Heat Map & Heatmap Style（热力图风格）**｜特征：颜色矩阵、强度分布和渐变标尺｜适合：相关矩阵、地理密度和强弱分布｜不适合：数据少时普通柱状图更诚实，也要提供非颜色线索｜Prompt：`color matrix`, `intensity map`, `correlation`, `gradient scale`

### D. 强记忆点与材质空间

28. **Organic Biophilic（有机亲自然）**｜特征：自然材质、柔和曲线、绿色和呼吸感｜适合：健康、环保、冥想产品｜不适合：只换成绿色不等于亲自然，硬核工业品牌可能显弱｜Prompt：`organic shapes`, `natural texture`, `soft green`, `flowing layout`
29. **Memphis Design（孟菲斯设计）**｜特征：几何图形、跳跃色彩和后现代玩心｜适合：活动、创意与年轻品牌｜不适合：装饰不能覆盖内容和按钮｜Prompt：`geometric shapes`, `playful pattern`, `bright palette`, `postmodern`
30. **Y2K Aesthetic（Y2K 美学）**｜特征：镀铬、虹彩、果冻色和光泽表面｜适合：时尚、音乐和复古互联网主题｜不适合：严肃企业页面容易出戏｜Prompt：`chrome`, `iridescent`, `bubblegum color`, `glossy surface`
31. **Vaporwave（蒸汽波）**｜特征：霓虹渐变、复古网格、故障感和怀旧未来｜适合：音乐、游戏和文化项目｜不适合：长文本与业务工具难以承受高情绪密度｜Prompt：`neon gradient`, `retro grid`, `glitch`, `nostalgic future`
32. **Aurora UI（极光 UI）**｜特征：网格渐变、发光色彩和柔和融合｜适合：品牌首屏与音乐平台｜不适合：正文区持续发光会造成疲劳｜Prompt：`mesh gradient`, `luminous color`, `soft blend`, `atmospheric`
33. **Retro-Futurism（复古未来主义）**｜特征：旧科幻设备、CRT 线条、霓虹和几何｜适合：游戏与科技品牌｜不适合：信息密集页要降低特效｜Prompt：`vintage sci fi`, `CRT line`, `neon geometry`, `retro interface`
34. **Cyberpunk UI（赛博朋克 UI）**｜特征：黑底、荧光、终端和 HUD 面板｜适合：游戏、娱乐和主题体验｜不适合：扫描线、闪烁和低对比会妨碍阅读｜Prompt：`neon terminal`, `dark HUD`, `glitch accent`, `system panel`
35. **Vibrant & Block-based（高饱和色块）**｜特征：高饱和大色块、几何布局和强对比｜适合：年轻、有能量的品牌｜不适合：颜色过多会制造视觉噪音｜Prompt：`bold blocks`, `high saturation`, `geometric layout`, `strong contrast`
36. **Brutalism（粗野主义）**｜特征：原始布局、默认字体、强对比和不精致边缘｜适合：独立媒体与实验项目｜不适合：企业服务照搬容易显得失控｜Prompt：`raw layout`, `default type`, `stark contrast`, `unpolished edge`
37. **Skeuomorphism（拟物化）**｜特征：真实材质、物理隐喻、深度和触觉控件｜适合：需要借现实物品降低学习成本的重点场景｜不适合：制作成本高，不宜铺满复杂后台｜Prompt：`real texture`, `physical metaphor`, `depth`, `tactile control`
38. **Claymorphism（黏土拟态）**｜特征：柔软 3D、厚实体块、玩具感和圆润体积｜适合：儿童教育与趣味引导｜不适合：金融和法律产品通常不够严肃｜Prompt：`soft 3D`, `chunky form`, `toy like`, `rounded volume`
39. **Neumorphism（新拟态）**｜特征：同色底上的凸起、凹陷和单一光源｜适合：小范围、低频的柔和控件｜不适合：低对比与弱可供性使关键操作难以辨认｜Prompt：`embossed`, `debossed`, `soft UI`, `single light source`
40. **Liquid Glass（液态玻璃）**｜特征：流动玻璃、折射、半透明层和流体动效｜适合：高端展示和少量焦点元素｜不适合：复杂数据页、低性能设备和全页应用｜Prompt：`flowing glass`, `refraction`, `translucent layer`, `fluid motion`

### E. AI 产品与沉浸交互

41. **AI-Native UI（AI 原生 UI）**｜特征：对话、建议、语音和 Agent 状态并存｜适合：AI 助手与协作型产品｜不适合：传统表单和高密度数据不必强塞进聊天框｜Prompt：`conversational UI`, `assistant`, `voice input`, `agent state`
42. **Zero Interface（零界面）**｜特征：语音优先、环境感知、预测动作和隐形控制｜适合：低摩擦、环境式任务｜不适合：精确控制和高风险动作必须保留可见控件｜Prompt：`voice first`, `ambient UI`, `predictive action`, `invisible control`
43. **Micro-interactions（微交互）**｜特征：短促动画、触觉反馈和及时状态回应｜适合：确认操作与增强可供性｜不适合：任何拖慢任务的动画都应删除｜Prompt：`subtle animation`, `tactile feedback`, `responsive state`, `gesture cue`
44. **Motion-Driven（动效驱动）**｜特征：转场、滚动动效和入场动画承担叙事｜适合：发布、品牌与连续体验｜不适合：内容仍是主角，并必须提供减少动效版本｜Prompt：`smooth transition`, `scroll motion`, `entrance animation`, `reduced motion`
45. **Kinetic Typography（动态字体）**｜特征：变形字、打字动效和标题节奏｜适合：首屏和发布页｜不适合：正文与关键操作必须保持稳定｜Prompt：`animated type`, `morphing letters`, `typing motion`, `headline rhythm`
46. **Parallax Storytelling（视差叙事）**｜特征：分层滚动、镜头序列和渐进揭示｜适合：发布会、案例与年度报告｜不适合：移动端、晕动敏感用户和低性能设备需要静态退路｜Prompt：`layered scroll`, `cinematic sequence`, `progressive reveal`, `depth cue`
47. **3D & Hyperrealism（3D 与超写实）**｜特征：真实纹理、3D 模型、空间深度和触觉表面｜适合：游戏、建筑和高端电商展示｜不适合：加载成本高，普通表单页面通常不值得使用｜Prompt：`realistic texture`, `3D model`, `spatial depth`, `tactile surface`

### F. 决定页面能否长久使用

48. **Accessible & Ethical（无障碍与伦理设计）**｜特征：键盘操作、可见焦点、屏幕阅读和清晰语义｜适合：所有产品，从设计第一天开始｜不适合：无合理排除场景；若上线前才补，会形成系统性返工｜Prompt：`keyboard navigation`, `visible focus`, `screen reader`, `WCAG`
49. **Inclusive Design（包容性设计）**｜特征：颜色安全信号、多通道反馈和易读大字｜适合：所有面向人的产品，尤其教育、医疗与公共服务｜不适合：无合理排除场景；同一状态仍不能只靠颜色表达｜Prompt：`color safe signal`, `semantic clarity`, `multiple feedback channels`, `large type`
50. **Swiss Modernism 2.0（瑞士现代主义 2.0）**｜特征：经典网格、清晰字体、模块化与数字交互｜适合：追求专业但不老派的产品｜不适合：不能为了形式秩序牺牲真实操作状态｜Prompt：`grid system`, `Helvetica`, `modular layout`, `digital clarity`

## 五道风险闸门

候选方向可以评分，但以下五项是**否决项**，不能用“品牌更酷”来抵消：

| 闸门 | 必须回答的问题 | 失败时怎么退 |
|------|----------------|--------------|
| 可读性 | 最复杂背景上，正文、按钮和状态仍清楚吗？ | 降低材质和背景噪音，增加实体表面与对比 |
| 无障碍 | 键盘焦点可见吗？状态不只靠颜色吗？动效可减少吗？ | 补焦点、文字/图形双通道和静态版本 |
| 响应式 | 卡片顺序、表格、Hero 和交互在窄屏仍成立吗？ | 重新排序任务，不是简单等比缩小 |
| 性能 | 模糊、3D、视频、视差在目标设备和弱网可用吗？ | 限定到焦点区域，提供图片或静态降级 |
| 品牌一致性 | 风格服务品牌，还是只因为它流行？ | 保留一种基础风格，效果型风格只做强调 |

## 完整案例：从产品场景到最终 Prompt

### 1. 写清场景

产品：面向产品和运营团队的 B2B AI 用户反馈分析 SaaS 官网。

- 核心动作：预约产品演示
- 内容密度：中高，需要展示流程、能力、案例和安全说明
- 信任要求：高，用户会上传业务数据
- 目标用户：专业团队，桌面端为主，也会在手机上初次浏览
- 品牌气质：冷静、可信、现代，不追逐炫技
- 约束：首屏加载轻、正文易读、动效可关闭，不使用默认蓝紫渐变

### 2. 生成并比较 3 个方向

评分 1–5，分数越高越合适；“闸门”出现不通过时直接淘汰。

| 候选方向 | 信息层级 | 品牌匹配 | 可读性 | 实现可控 | 性能 | 结论 |
|----------|----------|----------|--------|----------|------|------|
| Swiss Modernism 2.0 + Bento | 5 | 5 | 5 | 4 | 5 | 保留，作为基础方向 |
| Aurora UI + Glassmorphism | 4 | 4 | 3 | 2 | 2 | 淘汰：正文对比和低端设备风险高 |
| Neubrutalism | 4 | 2 | 4 | 4 | 5 | 淘汰：记忆点强，但不匹配高信任场景 |

### 3. 说明取舍

最终不是“选最漂亮的”，而是选 **Swiss Modernism 2.0 作为基础风格，Bento 只负责组织功能模块**。产品截图可以用轻微 Dimensional Layering 抬起，但不把玻璃、渐变和动效铺满全页。

### 4. 形成可执行 Prompt

```text
Build a responsive landing page for a B2B AI customer-feedback analytics SaaS.

Product goal:
- Primary action: book a product demo.
- Audience: product and operations teams with high trust requirements.
- Content: workflow, capabilities, customer evidence, and security explanation.

Visual direction:
- Base style: Swiss Modernism 2.0.
- Layout support: Bento Box Grid for grouped product capabilities only.
- Keywords: grid system, clean typography, modular cards, clear hierarchy.
- Palette: warm off-white surfaces, charcoal text, one restrained warm accent.
- Do not use default blue-purple gradients, decorative glass cards, or gratuitous glow.

Interaction and quality constraints:
- Keep one dominant CTA per viewport.
- Preserve visible keyboard focus and never encode status by color alone.
- Reorder content for mobile instead of shrinking the desktop grid.
- Use motion only for state feedback; provide a reduced-motion/static path.
- Avoid full-page blur, heavy 3D, and autoplay media.

Output:
- A complete implementation plus a short explanation of hierarchy,
  responsive behavior, accessibility safeguards, and performance trade-offs.
```

## 可复制的 `design-style-brief.md`

把下面模板复制到项目中。它不是“审美愿望单”，每个选择都要写理由、使用边界和验收方式。

```markdown
# Design Style Brief

## 1. 产品场景
- 产品 / 页面：
- 目标用户与停留时长：
- 核心任务 / 唯一主行动：
- 内容密度：低 / 中 / 高
- 信任要求：低 / 中 / 高
- 主要设备与网络条件：

## 2. 品牌方向
- 希望用户感受到：
- 必须保留的品牌资产：
- 明确禁用的视觉套路：

## 3. 风格选择
- 基础风格：
- 辅助风格或布局方式：
- 选择理由：
- 使用页面 / 区域：
- 必须克制的区域：
- 关键词（4–6 个）：

## 4. 视觉语言
- 布局与信息层级：
- 色彩与语义：
- 字体与字阶：
- 材质、深度与图像：
- 动效与反馈：

## 5. 质量闸门
- 可读性与对比：
- 键盘、焦点、屏幕阅读与非颜色信号：
- 桌面 / 平板 / 手机重排规则：
- 性能预算与降级方案：

## 6. 验收
- 信息层级：
- 品牌匹配：
- 关键任务可完成：
- 无障碍与响应式：
- 加载和运行性能：
```

## 实战练习

1. 从你的产品中选一个具体页面，不要选择“整个 App”。
2. 用六步筛选法写出场景约束，从词典中选 3 个候选方向。
3. 按信息层级、品牌匹配、可读性、实现成本和性能逐项评分，并执行五道风险闸门。
4. 只保留一个基础风格；如果需要第二种，只允许它承担明确的布局或强调职责。
5. 完成 `design-style-brief.md`，写清为什么选、在哪里用、哪里必须克制。
6. **新开一个 Claude Code session**，把 Brief 交给 Claude Code 或 Codex 生成方案，避免在当前教学对话中混入实现上下文。
7. 至少检查桌面与窄屏、键盘焦点、非颜色状态、减少动效版本和低性能降级，再决定是否进入设计系统。

最终产物不是一张“看起来不错”的截图，而是一份可复用、可解释、可验证的视觉方向协议。

## 常见问题

**Q: 50 个词是不是都属于严格意义上的视觉风格？**

A: 不是。列表有意混合了布局、落地页策略、看板类型、材质风格、交互模式和设计原则，因为它们在 Vibe Design 中都能帮助你缩小生成范围。使用前先判断它属于哪一层。

**Q: 一个页面可以混几种风格？**

A: 建议“一种基础风格 + 一种有明确职责的辅助方式”。例如 Swiss 负责整体秩序，Bento 只负责功能分组。不要让三种风格平均争夺注意力。

**Q: 只给 AI 英文关键词够吗？**

A: 不够。关键词负责定方向，产品场景、内容层级、禁用项、响应式、无障碍和性能约束负责防止它跑偏。

**Q: 候选方向总分最高，就一定该选吗？**

A: 不一定。可读性、无障碍、响应式、性能和品牌一致性是闸门，不是可以被平均掉的加分项。任何一项不通过，都要修改或淘汰方向。

**Q: AI 生成第一版后可以直接进入开发吗？**

A: 不建议。先用同一份 Brief 比较 2–3 个方向，再在真实内容和目标设备上验证。风格名只负责找到方向，真实任务能否完成才是验收标准。

## 资料来源与课程化说明

- 原始文章：萤柳，《[AI 时代 Vibe Design 必备的 50 种 UI 风格名词！](https://mp.weixin.qq.com/s/FnZdLUdHyrtOySZWvHwERA)》
- 可访问版本：[人人都是产品经理转载页](https://www.woshipm.com/share/6446559.html)

本课保留了原文的 50 个名称、使用判断和英文关键词，并重新组织为选择流程、风险闸门、完整案例与 Brief 模板；未复制原文配图，也不以风格清单替代课程已有的设计系统与跨平台方法。

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1–5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入下一课：Lesson 18 - Trigger Map：用户心理→功能映射
- 回顾风格识别：Lesson 17.5 - 13 种网页设计风格速查
- 回顾风格落地：Lesson 17.7 - 跨平台选择与 Prompt
- 返回主菜单

---
*阶段 3 | Lesson 17.10/26 | 上一课: Lesson 17.9 - AI 品牌视觉趋势 | 下一课: Lesson 18 - Trigger Map*
