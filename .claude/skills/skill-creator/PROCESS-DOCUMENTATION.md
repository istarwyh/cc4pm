# Skill 创建过程文档：courseware-generator

> 本文档记录了如何使用 skill-creator 创建 courseware-generator 的完整过程，作为教学案例。

## 📋 目录

1. [项目背景](#项目背景)
2. [Step 1: 理解技能需求](#step-1-理解技能需求)
3. [Step 2: 规划可复用内容](#step-2-规划可复用内容)
4. [Step 3 & 4: 实现技能](#step-3--4-实现技能)
5. [最佳实践应用总结](#最佳实践应用总结)
6. [关键决策点](#关键决策点)
7. [教学要点](#教学要点)

---

## 项目背景

### 原始输入

用户提供了一个完整的"交互式教学仓库转型方法论"，包括：

- **核心理念**：从"读文档"到"AI带你学"的范式转换
- **Deep Research 流程**：AI 如何像人类一样探索仓库结构
- **理解地图生成**：将探索结果提炼为知识地图
- **教学设计原则**：5 阶段渐进式结构
- **交互方式设计**：欢迎界面、阶段导航、课程反馈等
- **增量生成策略**：解决上下文限制问题

### 目标

将这套方法论转换为一个可复用的 Skill（`courseware-generator`），能够：

- 自动将任意代码仓库转换成交互式教学课件
- 生成 `/xxx-guide` 格式的交互式教学入口
- 支持增量生成，适应上下文限制

---

## Step 1: 理解技能需求

### 1.1 用户输入分析

**用户原话**：
```
好的，我直接把完整文章输出给你：
[完整的交互式教学仓库转型方法论]
```

### 1.2 技能功能提取

通过分析方法论，提取出技能需要实现的核心功能：

| 功能模块 | 功能描述 | 优先级 |
|---------|---------|--------|
| Deep Research 探索 | AI 自然探索仓库结构 | P0 |
| 理解地图生成 | 提炼仓库知识结构 | P0 |
| 教学设计 | 5 阶段划分 | P0 |
| 主 Skill 生成 | 交互式教学入口 | P0 |
| Lesson 生成 | 逐个生成教学内容 | P0 |
| 增量支持 | 分阶段生成 | P1 |

### 1.3 触发条件设计

在 SKILL.md frontmatter 中定义清晰的触发条件：

```yaml
name: courseware-generator
description: |
  将任意代码仓库转换成交互式教学课件。AI 通过 Deep Research 探索仓库，
  理解其结构、方法论和核心能力，然后生成一个 /xxx-guide 的交互式教学 Skill，
  包含多个渐进式 Lesson，支持用户随时获得一对一教学体验。

  使用场景：
  - "把这个仓库变成教学课件"
  - "我想让 xxx 也能学会使用这个项目"
  - "我需要一个交互式的一对一教学入口"
```

### 1.4 技能边界定义

**包含**：
- Deep Research 流程
- 理解地图生成
- 教学阶段设计
- 主 Skill 框架生成
- 单课内容生成
- 增量生成支持

**不包含**：
- 具体课件内容的填充（由 AI 在运行时生成）
- 课件的分发和部署
- 用户学习过程的管理（由生成的主 Skill 处理）

---

## Step 2: 规划可复用内容

### 2.1 资源文件规划

根据 skill-creator 的指导，分析每个功能需要哪些可复用资源：

#### 方法论分析

| 功能 | 是否需要脚本 | 是否需要参考 | 是否需要资源 |
|------|-------------|-------------|-------------|
| Deep Research 探索 | ❌ | ✅ 需要流程模板 | ❌ |
| 理解地图生成 | ✅ 需要初始化 | ✅ 需要模板 | ❌ |
| 教学设计 | ❌ | ✅ 需要阶段划分模板 | ❌ |
| 主 Skill 生成 | ❌ | ✅ 需要完整模板 | ❌ |
| Lesson 生成 | ❌ | ✅ 需要单课模板 | ❌ |
| 交互流程 | ❌ | ✅ 需要示例大全 | ❌ |

### 2.2 最终资源结构

```
courseware-generator/
├── SKILL.md (主文件，~300行)
├── references/
│   ├── understanding-map-template.md (理解地图模板)
│   ├── lesson-template.md (单课模板，含完整示例)
│   ├── main-skill-template.md (主 Skill 模板，含完整示例)
│   └── interaction-flows.md (交互流程示例大全)
└── scripts/
    └── init_courseware.py (初始化脚本)
```

### 2.3 渐进式披露设计

**SKILL.md 加载时机**：技能触发后立即加载
**内容**：
- 技能概述（100字）
- 核心工作流（6个阶段）
- 使用方法（参数说明）
- 详细流程（每个阶段的具体步骤）
- 资源文件索引

**references/ 加载时机**：按需加载
- `understanding-map-template.md`：Deep Research 完成后
- `lesson-template.md`：设计每个 Lesson 时
- `main-skill-template.md`：生成入口 Skill 时
- `interaction-flows.md`：设计用户交互时

**scripts/ 加载时机**：直接执行，无需加载到上下文

---

## Step 3 & 4: 实现技能

### 4.1 创建 SKILL.md

#### Frontmatter 设计

```yaml
---
name: courseware-generator
description: 将任意代码仓库转换成交互式教学课件。AI 通过 Deep Research 探索仓库，理解其结构、方法论和核心能力，然后生成一个 /xxx-guide 的交互式教学 Skill，包含多个渐进式 Lesson，支持用户随时获得一对一教学体验。
compatibility: Claude Code 环境
---
```

**设计决策**：
- `name`：使用全小写连字符，符合命名规范
- `description`：包含完整功能描述和触发场景
- `compatibility`：指定运行环境

#### Body 结构设计

**1. 何时使用**（WHEN）
```markdown
## 何时使用

当用户需要将某个代码仓库转换成交互式教学课件时使用。具体场景包括：

- 用户说"把这个仓库变成教学课件"
- 用户说"我想让 xxx 也能学会使用这个项目"
- 用户需要一个交互式的一对一教学入口
- 用户希望将技术文档转换为更易学的形式
```

**2. 工作流程概览**
```markdown
## 工作流程概览

本技能遵循"交互式教学仓库转型方法论"，包含六个核心阶段：

1. **Deep Research 探索** - AI 像人类一样自然探索仓库结构
2. **生成理解地图** - 提炼仓库的完整知识结构
3. **教学设计** - 确定阶段划分和课程结构
4. **生成主 Skill 框架** - 创建交互式入口
5. **增量生成 Lessons** - 逐个生成教学内容
6. **质量验证** - 确保教学效果
```

**3. 核心原则**
```markdown
## 核心原则

### 像人类一样探索

不要预设仓库"应该有什么"，而是自然地发现"它有什么"。

### 渐进式内容生成

由于上下文限制，采用增量生成策略：
- 第一次运行：生成理解地图 + 主 Skill 框架 + 阶段 1
- 后续运行：逐个生成其他阶段的 Lessons

### 教学设计标准

遵循 5 阶段结构（从简单到复杂，从高频到方法论）
```

**4. 使用方法**
```markdown
## 使用方法

### 必需参数

- `target-repo`: 目标仓库的路径（必需）
- `skill-name`: 要生成的 Skill 名称（必需）
- `guide-command`: 用户运行的教学命令（必需）

### 可选参数

- `target-audience`: 目标学习人群描述
- `output-dir`: 输出目录
- `start-phase`: 从哪个阶段开始生成
```

**5. 详细工作流程**

按照方法论的 6 个阶段组织：

```markdown
### 阶段 1: Deep Research 探索仓库

按照以下顺序自然探索仓库：

**1.1 俯瞰全局**
```bash
cat README.md
ls -la
tree -L 2
```

**1.2 探索核心模块**
...

**1.3 查找使用示例**
...

**1.4 理解设计哲学（可选）**
...

**1.5 补充缺失（如果需要）**
```

### 4.2 创建参考资料文件

#### 4.2.1 understanding-map-template.md

**模板结构**：

```markdown
# 仓库理解地图模板

## 基本信息
| 字段 | 内容 |
|------|------|
| 名称 | [仓库名称] |
| 用途 | [一句话描述] |
| ...

## 目录结构
```
[仓库根目录]
├─ [目录1]/ 职责：[描述]
...
```

## 核心能力
### 能力 1：[能力名称]
- **描述**：[一句话]
- **对应文件**：[路径]
- **使用频率**：⭐⭐⭐⭐⭐
- **入门难度**：⭐⭐⭐⭐☆

## 使用场景
### 场景 1：[场景名称]
...

## 学习路径建议
...

## 方法论/最佳实践
...

## 常见陷阱
...

## 相关资源
...
```

**设计决策**：
- 使用表格结构化基本信息，易于阅读和填充
- 目录结构使用树形展示，清晰直观
- 核心能力使用星级评分，便于用户快速判断
- 包含"常见陷阱"部分，提高实用性

#### 4.2.2 lesson-template.md

**完整 Lesson 示例**：

```markdown
# Lesson 2: 创建你的第一个 Skill

## 本课目标
- 理解 Skill 的基本结构
- 掌握 YAML frontmatter 的写法
- 能够独立创建一个简单的 Skill

## 核心内容

### 概念讲解
Skill 是 Claude Code 的"专业化插件"。想象一下：
- **普通模式**：Claude 就像一位刚入职的新员工
- **Skill 模式**：Claude 就像一位经验丰富的老员工

### 实战示例
```bash
# 1. 进入 Skills 目录
cd ~/.claude/skills/

# 2. 创建新的 Skill 文件
cat > meeting-notes.md << 'EOF'
---
name: meeting-notes
description: 帮助整理和生成会议纪要
EOF
```

### 运行你的第一个 Skill
```bash
/claude-code
/Users/me/.claude/skills/meeting-notes.md
```

## 常见问题

**Q: Skill 文件必须以 .md 结尾吗？**
A: 是的，Skill 文件必须是 `.md` 扩展名。

**Q: description 字段最长可以多长？**
A: 建议控制在 1-2 句话，长度不超过 100 字。

## 下一步
- 进入下一课：[Lesson 3: 完善 Skill 的核心内容]
- 复习本课：[Lesson 2: 创建你的第一个 Skill]
- 实践一下：尝试创建一个自己的 Skill
```

**设计决策**：
- 包含完整的 Lesson 示例，而非只有模板
- 使用对比手法（普通模式 vs Skill 模式）帮助理解
- 提供可直接运行的命令示例
- 包含"常见问题"和"下一步指引"

#### 4.2.3 main-skill-template.md

**完整主 Skill 示例（节选）**：

```markdown
# Claude Code 插件集合（cc4pm）交互式教学

## 欢迎使用

欢迎使用 Claude Code 插件集合（cc4pm）交互式教学！

cc4pm 是一个为工程师提供生产就绪的代理、技能、命令、规则和 MCP 配置的集合。

## 你将学到

- **核心概念**：理解 agents、skills、commands、hooks、rules 的设计理念
- **基础操作**：掌握常用命令的使用方法
- **进阶技巧**：学会组合使用多个组件
- **最佳实践**：了解工程化和自动化的最佳实践

## 预计用时

- 新手完整学习：约 45 分钟
- 有基础用户：约 20 分钟

## 使用方式

请选择你的学习方式：

**[1] 从头开始（推荐首次学习）**

**[2] 跳到特定阶段**

**[3] 查看学习进度**

**[4] 退出**

## 阶段导航

### 阶段 1：基础入门 ✅ 完成 0/4

| 课程 | 标题 | 状态 |
|------|------|------|
| Lesson 1 | 认识 cc4pm | ⬜ 待学习 |
| Lesson 2 | 探索项目结构 | 🔒 锁定 |

...
```

**设计决策**：
- 完整的可运行主 Skill，而非只有模板
- 包含欢迎界面、学习目标、预计用时
- 阶段导航使用状态标记（✅/⬜/🔒）
- 课程内包含"下一步"导航选项
- 包含进度追踪和成就徽章

#### 4.2.4 interaction-flows.md

**交互流程示例**：

```markdown
## 欢迎界面流程

```
用户运行 /xxx-guide

    ↓

显示欢迎界面
├─ 项目介绍（1-2 句话）
├─ 你将学到（3-4 个要点）
├─ 预计用时
└─ 主菜单选项

    ↓

用户选择 [1-4]
├─ [1] 从头开始 → 进入阶段 1 第 1 课
├─ [2] 跳到特定阶段 → 显示阶段选择菜单
├─ [3] 查看学习进度 → 显示进度页面
└─ [4] 退出 → 结束
```

## 课程学习流程

```
用户进入 Lesson X

    ↓

显示课程内容
├─ 本课目标
├─ 核心内容
├─ 常见问题
└─ 下一步选项

    ↓

用户学习并实践

    ↓

用户选择下一步
├─ [1] 进入下一课
├─ [2] 重新学习本课
├─ [3] 返回主菜单
└─ [4] 退出
```

## 进度追踪流程

```
用户选择 [3] 查看学习进度

    ↓

显示进度页面
├─ 已完成课程数/总课程数
├─ 当前阶段
├─ 学习时长统计
├─ 成就徽章
└─ 学习建议
```

## 高级交互模式

### 知识检查模式

```markdown
## 知识检查

**Q1: [问题]？**

A. 选项 A
B. 选项 B
C. 选项 C
D. 选项 D

请输入你的答案（A/B/C/D）：
```

### 代码实操模式

```markdown
## 动手实践

**任务**：请运行以下命令并截图反馈结果

```bash
[示例命令]
```
```

### 场景模拟模式

```markdown
## 场景模拟

假设你遇到了以下情况：

**场景**：你需要在项目中添加一个新的命令

根据本课所学，你会如何操作？
```
```

**设计决策**：
- 使用流程图展示交互逻辑
- 区分标准流程和高级交互模式
- 包含多种交互模式（知识检查、实操练习、场景模拟）
- 提供交互设计最佳实践

### 4.3 创建脚本文件

#### init_courseware.py

**功能**：
1. 快速创建课件的基础目录结构
2. 生成主 Skill 文件（SKILL.md）
3. 生成 README 文件
4. 生成理解地图模板
5. 生成示例课程文件
6. 生成 .gitignore 文件

**脚本结构**：

```python
def create_directory_structure(base_path: Path, skill_name: str) -> dict:
    """创建课件的基础目录结构"""
    dirs = {
        "root": base_path / skill_name,
        "lessons_stage1": base_path / skill_name / "lessons" / "stage-1",
        "lessons_stage2": base_path / skill_name / "lessons" / "stage-2",
        "lessons_stage3": base_path / skill_name / "lessons" / "stage-3",
        "lessons_stage4": base_path / skill_name / "lessons" / "stage-4",
        "lessons_stage5": base_path / skill_name / "lessons" / "stage-5",
        "resources": base_path / skill_name / "_resources",
        "assets": base_path / skill_name / "assets",
    }
    ...

def generate_skill_md(dirs: dict, skill_name: str, guide_command: str, target_repo: str) -> str:
    """生成主 Skill 文件（SKILL.md）"""
    ...

def generate_readme(dirs: dict, skill_name: str, guide_command: str, target_repo: str):
    """生成 README 文件"""
    ...

def generate_understanding_map(dirs: dict, target_repo: str):
    """生成理解地图模板"""
    ...

def generate_sample_lesson(dirs: dict, stage: int, lesson_num: int):
    """生成示例课程文件"""
    ...

def main():
    parser = argparse.ArgumentParser(...)
    args = parser.parse_args()

    # 创建目录结构
    dirs = create_directory_structure(...)

    # 生成文件
    generate_skill_md(...)
    generate_readme(...)
    generate_understanding_map(...)
    generate_sample_lesson(...)
    ...

if __name__ == "__main__":
    sys.exit(main())
```

**命令行使用**：

```bash
python init_courseware.py <target-repo> <skill-name> <guide-command> [--output-dir <path>]

# 示例
python init_courseware.py /path/to/repo cc4pm-guide /cc4pm-guide
```

**设计决策**：
- 使用 argparse 处理命令行参数
- 支持必需参数和可选参数
- 自动创建完整的目录结构
- 生成可立即使用的基础文件
- 提供清晰的使用提示

---

## 最佳实践应用总结

### 1. 渐进式披露（Progressive Disclosure）

**应用方式**：

```courseware-generator/
├── SKILL.md (~300行，触发后立即加载)
├── references/ (按需加载)
│   ├── understanding-map-template.md
│   ├── lesson-template.md
│   ├── main-skill-template.md
│   └── interaction-flows.md
└── scripts/ (直接执行，零上下文)
```

**效果**：
- SKILL.md 保持精简
- 详细模板按需加载
- 脚本零上下文开销

### 2. 精简的 SKILL.md Body

**行数统计**：

| 部分 | 行数 |
|------|------|
| Frontmatter | 5 行 |
| 何时使用 | 10 行 |
| 工作流程概览 | 15 行 |
| 核心原则 | 25 行 |
| 使用方法 | 20 行 |
| 详细工作流程 | 120 行 |
| 资源文件 | 30 行 |
| 常见问题 | 40 行 |
| 输出规范 | 25 行 |
| **总计** | **~310 行** |

**效果**：符合"控制在 500 行以内"的指导原则

### 3. 模块化参考资料

**模块划分**：

| 文件 | 用途 | 大小 |
|------|------|------|
| understanding-map-template.md | 理解地图模板 | ~80 行 |
| lesson-template.md | 单课模板 + 完整示例 | ~320 行 |
| main-skill-template.md | 主 Skill 模板 + 完整示例 | ~400 行 |
| interaction-flows.md | 交互流程示例大全 | ~500 行 |

**效果**：每个文件聚焦单一功能，按需加载

### 4. 完整的模板和示例

**模板质量**：

- ✅ 理解地图模板：结构化、易于填充
- ✅ 单课模板：包含完整示例（Lesson 2）
- ✅ 主 Skill 模板：包含完整示例（cc4pm-guide）
- ✅ 交互流程：包含多种场景和模式

### 5. 可执行脚本

**脚本功能**：

- ✅ 目录结构自动创建
- ✅ 主文件自动生成
- ✅ 示例内容自动填充
- ✅ 清晰的使用提示

---

## 关键决策点

### 决策 1: 技能边界定义

**问题**：方法论内容很丰富，应该包含多少在 SKILL.md 中？

**决策**：
- SKILL.md 包含：核心流程、关键步骤、资源索引
- References 包含：详细模板、完整示例
- 不包含：具体课件内容（由 AI 运行时生成）

**理由**：遵循渐进式披露原则，避免 SKILL.md 过于庞大

### 决策 2: 增量生成策略

**问题**：Claude Code 上下文限制，无法一次性生成所有课程内容

**决策**：采用增量生成策略

```
第一次运行：生成理解地图 + 主 Skill 框架 + 阶段 1
第二次运行：生成阶段 2
第三次运行：生成阶段 3
...
```

**参数支持**：

```yaml
### 可选参数

- `start-phase`: 从哪个阶段开始生成，默认为 1
```

**理由**：平衡上下文限制和用户体验

### 决策 3: 模板 vs 示例

**问题**：只提供模板，还是提供完整示例？

**决策**：提供模板 + 完整示例

**示例选择**：
- 单课示例：Lesson 2 - 创建你的第一个 Skill（实际可运行）
- 主 Skill 示例：完整的 cc4pm-guide（实际可使用）

**理由**：示例比模板更容易理解和使用

### 决策 4: 脚本的必要性

**问题**：是否需要提供命令行脚本？

**决策**：提供 init_courseware.py 脚本

**功能**：
- 一键创建基础目录结构
- 生成可运行的初始文件
- 提供清晰的命令行界面

**理由**：对于重复性高的任务，脚本比手动操作更高效

---

## 教学要点

### 适用于教学的亮点

1. **渐进式披露的实践应用**
   - 展示如何将长篇内容拆分为多层
   - 解释何时加载什么内容

2. **模板设计的艺术**
   - 提供可运行的模板，而非死板的框架
   - 平衡结构化和灵活性

3. **用户至上的交互设计**
   - 欢迎界面、学习目标、预计用时
   - 清晰的导航和反馈机制

4. **考虑边界情况**
   - 增量生成支持
   - 仓库结构混乱的处理

5. **脚本的战略性使用**
   - 何时需要脚本
   - 脚本如何与 Skill 配合

### 练习建议

1. **练习 1**：修改 understanding-map-template.md 以适应特定项目类型
2. **练习 2**：为另一个领域（如数据分析）创建类似的课程模板
3. **练习 3**：为生成的课件添加新的交互模式
4. **练习 4**：扩展 init_courseware.py 支持更多配置选项

---

## 附录

### A. 技能目录结构

```
courseware-generator/
├── SKILL.md
├── references/
│   ├── understanding-map-template.md
│   ├── lesson-template.md
│   ├── main-skill-template.md
│   └── interaction-flows.md
└── scripts/
    └── init_courseware.py
```

### B. 相关文件

- **原始方法论**：由用户提供
- **skill-creator 参考**：`/Users/mac/.claude/plugins/cache/anthropic-agent-skills/example-skills/1ed29a03dc85/skills/skill-creator/SKILL.md`

### C. 版本信息

- **创建日期**：2026-03-22
- **Skill Creator 版本**：1.0
- **courseware-generator 版本**：1.0

---

*本文档由 courseware-generator 自动生成*
*用于教学目的，展示 skill-creator 的完整应用过程*