---
name: courseware-generator
description: 将任意代码仓库转换成交互式教学课件。AI 通过 Deep Research 探索仓库，理解其结构、方法论和核心能力，然后生成一个 /xxx-guide 的交互式教学 Skill，包含多个渐进式 Lesson，支持用户随时获得一对一教学体验。
compatibility: Claude Code 环境
---

# 课件生成器

## 何时使用

当用户需要将某个代码仓库转换成交互式教学课件时使用。具体场景包括：

- 用户说"把这个仓库变成教学课件"
- 用户说"我想让 xxx 也能学会使用这个项目"
- 用户需要一个交互式的一对一教学入口
- 用户希望将技术文档转换为更易学的形式

## 工作流程概览

本技能遵循"交互式教学仓库转型方法论"，包含六个核心阶段：

1. **Deep Research 探索** - AI 像人类一样自然探索仓库结构
2. **生成理解地图** - 提炼仓库的完整知识结构
3. **教学设计** - 确定阶段划分和课程结构
4. **生成主 Skill 框架** - 创建交互式入口
5. **增量生成 Lessons** - 逐个生成教学内容
6. **质量验证** - 确保教学效果

## 核心原则

### 像人类一样探索

不要预设仓库"应该有什么"，而是自然地发现"它有什么"。探索顺序：

- README → 目录结构 → 核心模块 → 使用示例 → 设计哲学 → 补充缺失

### 渐进式内容生成

由于上下文限制，采用增量生成策略：

- 第一次运行：生成理解地图 + 主 Skill 框架 + 阶段 1 所有 Lessons
- 后续运行：逐个生成其他阶段的 Lessons
- 最终：所有内容生成完毕，主 Skill 可完整运行

### 教学设计标准

遵循 5 阶段结构（从简单到复杂，从高频到方法论）：

| 阶段 | 名称 | 目标 | 课程数 |
|------|------|------|--------|
| 阶段 1 | 基础入门 | 理解"是什么"、"解决什么问题" | 3-5 节 |
| 阶段 2 | 核心功能 | 掌握高频使用的功能 | 5-10 节 |
| 阶段 3 | 进阶技巧 | 组合用法、高级特性 | 5-8 节 |
| 阶段 4 | 方法论 | 理解设计哲学、最佳实践 | 3-5 节 |
| 阶段 5 | 生态扩展 | 插件、社区、进阶资源 | 2-3 节 |

## 使用方法

### 必需参数

- `target-repo`: 目标仓库的路径（必需）
- `skill-name`: 要生成的 Skill 名称（必需）
- `guide-command`: 用户运行的教学命令，如 `/xxx-guide`（必需）

### 可选参数

- `target-audience`: 目标学习人群描述
- `output-dir`: 输出目录，默认为 `{target-repo}/.claude/skills/{skill-name}`
- `start-phase`: 从哪个阶段开始生成，默认为 1

### 使用示例

```skill
courseware-generator
目标仓库: /path/to/cc4pm
Skill 名称: cc4pm-guide
教学命令: /cc4pm-guide
目标人群: 产品经理
```

## 详细工作流程

### 阶段 1: Deep Research 探索仓库

按照以下顺序自然探索仓库：

**1.1 俯瞰全局**
```bash
cat README.md
ls -la
tree -L 2
```
记录要点：仓库用途、主要目录、入口文件、核心模块

**1.2 探索核心模块**
进入核心目录（如 skills/、commands/、agents/、src/、docs/）
```bash
ls skills/
cat skills/README.md  # 如果有
cat skills/skill-1.md  # 看具体内容
```
记录要点：每个模块职责、模块间关系、高频功能

**1.3 查找使用示例**
```bash
ls examples/
cat examples/getting-started.md
ls docs/
cat docs/tutorial.md
```
记录要点：典型使用场景、快速上手路径、常见组合

**1.4 理解设计哲学（可选）**
```bash
git log --oneline --graph | head -20
cat CHANGELOG.md
```

**1.5 补充缺失（如果需要）**
如果仓库结构混乱或文档缺失：
- 基于代码推断（阅读代码文件、函数名、注释）
- 生成辅助文档（README、结构说明）
- 标注不确定性（标记"推测"或"建议补充"）

### 阶段 2: 生成理解地图

根据探索结果，生成理解地图（存储在 `{output-dir}/_resources/understanding-map.md`）：

```markdown
# 仓库理解地图

## 基本信息
- 名称：xxx
- 用途：一句话描述
- 目标用户：xxx
- 核心方法论：xxx

## 目录结构
├─ skills/ 职责：xxx，包含 N 个 skills
├─ commands/ 职责：xxx，包含 M 个 commands
├─ agents/ 职责：xxx，定义 K 个角色
├─ docs/ 文档，重点关注 xxx
└─ examples/ 示例，演示 xxx 场景

## 核心能力
1. **能力1**：描述、对应文件、使用频率
2. **能力2**：描述、对应文件、使用频率

## 使用场景
1. **场景1**：描述、涉及的模块、典型流程
2. **场景2**：描述、涉及的模块、典型流程

## 学习路径建议
- 新手：先学 xxx
- 进阶：学 xxx
- 高级：关注 xxx

## 方法论/最佳实践
- xxx
```

### 阶段 3: 教学设计

基于理解地图，设计 5 阶段结构：

**3.1 确定阶段划分**
- 根据内容复杂度划分
- 确保学习曲线平滑
- 每个阶段聚焦特定目标

**3.2 规划每个阶段的课程**
- 阶段 1（基础入门）：3-5 节
- 阶段 2（核心功能）：5-10 节
- 阶段 3（进阶技巧）：5-8 节
- 阶段 4（方法论）：3-5 节
- 阶段 5（生态扩展）：2-3 节

**3.3 设计单课结构**
每个 Lesson 独立 Markdown 文件：
```markdown
# Lesson X: 标题

## 本课目标
- 目标1
- 目标2

## 核心内容
### 概念讲解
简洁口语化的解释

### 实战示例
可直接运行的代码/命令

## 常见问题
Q: xxx?
A: xxx

## 下一步
- 进入下一课：[Lesson X+1]
- 相关文档：[链接]
```

### 阶段 4: 生成主 Skill 框架

生成主 Skill 文件（`{output-dir}/SKILL.md`）：

**4.1 包含组件**
- 欢迎界面（显示学习目标和预计用时）
- 阶段导航（显示当前阶段、已完成课程、待完成课程）
- 课程交互（继续、跳过、重学）
- 课程结束反馈（测试题、进入下一课）

**4.2 参考模板**
详见 [main-skill-template.md](references/main-skill-template.md)

### 阶段 5: 增量生成 Lessons

按照阶段顺序逐个生成 Lessons：

**5.1 第一次运行**
生成：
- 理解地图
- 主 Skill 框架
- 阶段 1 所有 Lessons

**5.2 后续运行**
读取理解地图，继续生成：
- 阶段 2 所有 Lessons
- 阶段 3 所有 Lessons
- ...

**5.3 检查完成**
检查所有阶段是否都有对应的 Lessons，确保没有遗漏

### 阶段 6: 质量验证

生成完成后，验证以下内容：

- [ ] 主 Skill 欢迎界面完整
- [ ] 阶段导航功能正常
- [ ] 每个 Lesson 结构完整
- [ ] 课程之间有合理的衔接
- [ ] 示例代码可运行
- [ ] 常见问题有解答

## 资源文件

### 模板文件

- [understanding-map-template.md](references/understanding-map-template.md) - 理解地图模板
- [lesson-template.md](references/lesson-template.md) - 单课模板
- [main-skill-template.md](references/main-skill-template.md) - 主 Skill 模板
- [interaction-flows.md](references/interaction-flows.md) - 交互流程示例

### 脚本文件

- [scripts/init_courseware.py](scripts/init_courseware.py) - 初始化课件目录结构

## 常见问题

### Q: 生成的课件放在哪里？

默认放在 `{target-repo}/.claude/skills/{skill-name}/`

用户可以通过设置 `output-dir` 参数自定义输出位置

### Q: 如何分多次生成所有课程？

使用 `start-phase` 参数：

第一次：
```skill
courseware-generator
目标仓库: /path/to/repo
Skill 名称: xxx-guide
教学命令: /xxx-guide
start-phase: 1
```

第二次：
```skill
courseware-generator
目标仓库: /path/to/repo
Skill 名称: xxx-guide
教学命令: /xxx-guide
start-phase: 2
```

### Q: 如果仓库结构混乱怎么办？

Deep Research 时：
- 基于代码推断（阅读代码文件、函数名、注释）
- 生成辅助文档（README、结构说明）
- 在理解地图中标注"推测"或"建议补充"

### Q: 生成的 Skill 如何使用？

用户运行生成的命令即可：
```bash
/claude-code
/path/to/repo /xxx-guide
```

## 输出规范

所有生成的课件都应符合以下标准：

1. **语言一致性**：根据用户配置选择语言（默认中文）
2. **格式标准化**：使用统一的 Markdown 格式
3. **可操作性**：每个示例都可直接运行
4. **渐进性**：从简单到复杂，从基础到方法论
5. **完整性**：覆盖所有核心功能和场景