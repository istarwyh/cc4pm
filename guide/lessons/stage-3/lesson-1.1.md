# Lesson 17.1: UI 设计词典——108 个界面模式速查

## 本课目标

- 建立 UI 模式的系统词汇：15 个类别、108 个常见界面模式
- 掌握每个模式的适用场景和典型案例，与设计师/开发者高效沟通
- 了解如何在 WDS 场景设计（Phase 3-4）中引用这些模式
- 形成"看到需求就能联想到模式"的设计直觉

> **前置知识**：本课是 Lesson 17（WDS 概览）的补充。你已经了解了 WDS 的 8 阶段流水线和两位核心代理。本课为你补上"界面元素叫什么、用在哪里"的基础词汇。

## 核心内容

### 为什么产品主理人需要 UI 模式词汇？

你可能会想："这不是设计师的事吗？"

答案是：**你不需要会画 UI，但你需要说得出 UI 的名字**。

```
❌ "那个......就是那种可以滑动的东西，上面有图片"
✅ "首页用 Carousel 展示推荐内容，支持左右滑动"

❌ "弹一个框出来让用户确认"
✅ "删除操作需要一个 Confirmation Dialog，防止误操作"
```

**三个场景你一定会用到**：

1. **写 PRD / Story 时**——精确描述交互需求，减少返工
2. **WDS 场景设计时**——在 `/bmad-wds-scenarios` 中引用模式名，Freya 能直接生成对应组件
3. **和团队沟通时**——用统一术语，避免每次都"你知道那个......"

### 速查表：15 类 108 个 UI 模式

以下按类别整理，每个模式标注中文名和最佳使用场景。

---

#### 1. Navigation（导航）— 14 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Hamburger Menu | 汉堡菜单 | 移动端空间有限，导航项多 |
| Tab Bar | 标签栏 | 3-5 个主板块切换（iOS/Android 底栏） |
| Breadcrumb | 面包屑 | 3 层以上的层级导航 |
| Sidebar Navigation | 侧边栏导航 | 桌面端管理后台（Slack、Notion） |
| Mega Menu | 超级菜单 | 大量类目的电商/企业站 |
| Pagination | 分页 | 搜索结果、商品列表 |
| Infinite Scroll | 无限滚动 | SNS 信息流、图片瀑布流 |
| Sticky Header | 固定头部 | 导航需要始终可见 |
| Drawer | 抽屉 | 移动端侧滑面板（筛选/菜单） |
| Command Palette | 命令面板 | 专业工具的快速操作（VS Code、Figma） |
| Segmented Control | 分段控件 | 2-5 个互斥视图切换 |
| Tabs | 选项卡 | 同一页面内多视图切换 |
| Stepper / Wizard | 步骤引导 | 多步流程（注册、结账） |
| Anchor Navigation | 锚点导航 | 长页面内快速跳转 |

---

#### 2. Layout（布局）— 9 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Grid Layout | 网格布局 | 商品列表、卡片墙、仪表盘 |
| Masonry Layout | 瀑布流 | 不同高度的图片/卡片（Pinterest） |
| Card Layout | 卡片布局 | 将信息分组展示（Trello、Medium） |
| Split Screen | 分屏 | 左右对照（邮件/聊天、比较页） |
| Hero Section | 英雄区域 | 首屏大视觉 + 标题 + CTA |
| Bento Grid | 便当格 | 不同尺寸功能卡拼贴（Apple 风格） |
| Holy Grail Layout | 圣杯布局 | 经典三栏（头+尾+左中右） |
| Full Bleed | 全出血 | 全屏图片/视频的沉浸感 |
| Sticky Sidebar | 固定侧边栏 | 博客目录、电商购买按钮跟随 |

---

#### 3. Forms & Input（表单与输入）— 17 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Text Field | 文本输入框 | 单行文本（登录、搜索） |
| Textarea | 文本域 | 多行文本（评论、描述） |
| Select / Dropdown | 下拉选择 | 从列表中选一个（国家、类目） |
| Checkbox | 复选框 | 多选（设置、筛选） |
| Radio Button | 单选按钮 | 互斥选择（支付方式） |
| Toggle Switch | 开关 | ON/OFF 即时生效（设置项） |
| Slider / Range | 滑块 | 连续数值选择（价格区间、音量） |
| Date Picker | 日期选择器 | 预约、日程、时间段筛选 |
| File Upload | 文件上传 | 图片/文档上传（拖拽或选择） |
| Search Bar | 搜索栏 | 站内搜索 |
| Autocomplete | 自动补全 | 搜索建议、地址输入 |
| Tag Input | 标签输入 | 多标签添加/删除 |
| OTP Input | 验证码输入 | 短信/邮箱验证码 |
| Password Strength | 密码强度计 | 注册/改密时的强度提示 |
| Color Picker | 颜色选择器 | 主题/设计工具配色 |
| Inline Edit | 行内编辑 | 点击即编辑（Notion、Jira） |
| Multi-step Form | 多步表单 | 长表单分步填写 |

---

#### 4. Data Display（数据展示）— 13 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Table | 表格 | 结构化数据（管理后台、报表） |
| List View | 列表视图 | 邮件列表、联系人、设置项 |
| Tree View | 树形视图 | 文件浏览器、组织架构 |
| Timeline | 时间线 | 活动日志、项目进度 |
| Kanban Board | 看板 | 任务管理（Trello、Jira） |
| Stat Card | 统计卡片 | 仪表盘核心指标 |
| Badge | 徽标 | 未读数、状态标记 |
| Tag / Chip | 标签/芯片 | 分类标签、状态标签 |
| Avatar | 头像 | 用户识别（圆形图片/首字母） |
| Progress Bar | 进度条 | 上传进度、完成度 |
| Skeleton Screen | 骨架屏 | 加载中的布局占位 |
| Empty State | 空状态 | 无数据时的引导页 |
| Chart / Graph | 图表 | 数据可视化（折线/柱状/饼图） |

---

#### 5. Feedback（反馈）— 8 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Toast / Snackbar | 轻提示 | 操作成功/轻微错误通知，自动消失 |
| Modal / Dialog | 模态框 | 需要用户关注的确认/表单 |
| Alert / Banner | 横幅通知 | 系统级通知、维护公告 |
| Tooltip | 工具提示 | 悬停时的补充说明 |
| Popover | 弹出卡片 | 点击触发的丰富信息展示 |
| Loading Spinner | 加载动画 | API 请求中/按钮处理中 |
| Confirmation Dialog | 确认对话框 | 危险操作前的二次确认 |
| Notification Panel | 通知面板 | 应用内通知列表（下拉面板） |

---

#### 6. Content（内容）— 9 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Accordion | 手风琴 | FAQ、可折叠的长内容 |
| Carousel / Slider | 轮播 | 商品图、Banner、推荐内容 |
| Lightbox | 灯箱 | 图片全屏预览 |
| Pricing Table | 定价表 | SaaS 套餐比较 |
| Testimonial | 用户证言 | 用户评价/推荐展示 |
| CTA Section | 行动号召区 | 引导用户注册/购买的大按钮区域 |
| FAQ Section | 常见问题区 | 帮助页/落地页 |
| Feature Section | 功能展示区 | 图标+文字的功能网格 |
| Comparison Table | 比较表 | 多方案功能对比 |

---

#### 7. Actions（操作）— 8 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Button | 按钮 | 所有操作触发（Primary/Ghost/Outline） |
| FAB | 浮动操作按钮 | 主操作入口（新建、发消息） |
| Context Menu | 右键菜单 | 桌面端的文件/文本操作 |
| Action Sheet | 操作面板 | iOS 底部弹出的操作选择 |
| Split Button | 分裂按钮 | 主操作+附加操作（保存+另存为） |
| Button Group | 按钮组 | 工具栏、视图切换 |
| Swipe Actions | 滑动操作 | 列表项左右滑动（删除/归档） |
| Pull to Refresh | 下拉刷新 | 移动端刷新内容 |

---

#### 8. Mobile（移动端专属）— 4 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Bottom Sheet | 底部面板 | 半模态详情/筛选（Google Maps） |
| Stories | 故事流 | 限时动态（Instagram、LINE） |
| App Bar | 应用栏 | 移动端顶部标题+操作栏 |
| Speed Dial | 快速拨号 | FAB 展开的子操作扇形菜单 |

---

#### 9. Social & Communication（社交通讯）— 5 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Chat UI | 聊天界面 | 即时通讯、AI 对话、客服 |
| Comment Thread | 评论串 | 嵌套回复（Reddit、GitHub PR） |
| Emoji Reactions | 表情回应 | 轻量互动反馈（Slack） |
| Feed Card | 信息流卡片 | SNS 帖子展示 |
| @Mention | @提及 | 输入时自动联想用户名 |

---

#### 10. Onboarding（引导）— 3 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Walkthrough | 步骤引导 | 首次使用的功能高亮教学 |
| Welcome Screen | 欢迎页 | 应用首次启动的滑动介绍 |
| Progress Checklist | 进度清单 | 初始设置/资料完善引导 |

---

#### 11. Media（媒体）— 3 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Video Player | 视频播放器 | 视频播放（进度条+全屏+音量） |
| Audio Player | 音频播放器 | 播客/音乐/语音消息 |
| Image Gallery | 图片画廊 | 多图网格+点击放大 |

---

#### 12. Commerce（电商）— 3 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Product Card | 商品卡片 | 商品图+名称+价格+评分 |
| Shopping Cart | 购物车 | 已选商品列表+小计+结算 |
| Rating / Review | 评分评价 | 星级评分+用户评价 |

---

#### 13. Advanced Patterns（高级模式）— 6 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Dark Mode Toggle | 深色模式切换 | 主题偏好设置 |
| Drag & Drop | 拖放 | 列表排序、文件移动（Trello） |
| Virtual Scroll | 虚拟滚动 | 超大列表性能优化 |
| Responsive Breakpoints | 响应式断点 | 多设备自适应布局 |
| Micro-interactions | 微交互 | 悬停/点击/转场的小动画 |
| Keyboard Shortcuts | 快捷键一览 | 专业工具的快捷键面板 |

---

#### 14. Authentication（认证）— 2 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| Login Form | 登录表单 | 邮箱/密码 + 社交登录 |
| Sign Up Form | 注册表单 | 新用户注册 |

---

#### 15. Error & System（错误与系统）— 4 个

| 模式 | 中文 | 何时使用 |
|------|------|---------|
| 404 Page | 404 页面 | 页面不存在时的友好引导 |
| Error State | 错误状态 | 操作失败时的提示和恢复 |
| Maintenance Page | 维护页面 | 系统维护中的提示 |
| Cookie Banner | Cookie 横幅 | GDPR 合规的 Cookie 同意 |

---

### 在 WDS 中使用这些模式

这些模式不是用来背的——它们是你在 WDS 工作流中的"积木"：

**Phase 3（UX 场景设计）中引用模式**：

```
场景：用户首次打开 App
→ Welcome Screen → 3 步 Walkthrough → Progress Checklist

场景：用户搜索商品并下单
→ Search Bar + Autocomplete → Product Card (Grid Layout) → Shopping Cart → Multi-step Form (Stepper)
```

**写 Story 时精确描述**：

```
✅ "用户删除项目时，弹出 Confirmation Dialog，包含项目名称和两个按钮（取消/确认删除）"
✅ "商品列表使用 Masonry Layout，每张 Product Card 包含缩略图、标题、价格和 Rating"
```

**提示 Freya 时直接引用**：

```bash
# 告诉 Freya 使用什么模式
"首页 Hero Section 用 Full Bleed 背景图，下方用 Bento Grid 展示 4 个核心功能"
```

## 常见问题

**Q: 108 个模式太多了，怎么记？**

A: 不用记。这份词典是**速查表**——遇到需求时翻阅，找到最匹配的模式名称即可。用多了自然熟悉。最常用的 20 个模式（Button、Modal、Toast、Card Layout、Tab Bar、Search Bar、Table、Carousel、Hero Section、FAB、Breadcrumb、Accordion、Skeleton Screen、Empty State、Kanban、Toggle Switch、Pagination、Drawer、Bottom Sheet、Stepper）覆盖了 80% 的场景。

**Q: 这些模式和 WDS 设计系统（Phase 7）是什么关系？**

A: UI 模式是**概念层**——"用户需要一个 Drawer"；设计系统是**实现层**——"Drawer 的宽度是 320px，动画时长 300ms，背景色是 surface-2"。本课帮你识别需要什么模式，Phase 7 的设计系统负责把模式变成可复用的组件。

**Q: 同一个需求可以用不同模式吗？**

A: 当然。比如"展示商品列表"可以用 Grid Layout、Masonry Layout 或 List View——选择取决于内容类型和用户预期。这正是产品主理人需要做的设计决策。

## 下一步

- [1] 进入下一课：Lesson 18 - Trigger Map：用户心理→功能映射
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 3 | Lesson 17.1/26 | 上一课: Lesson 17 - WDS 概览 | 下一课: Lesson 17.2 - AI 原型实验室*
