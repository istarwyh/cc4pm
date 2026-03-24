#!/usr/bin/env python3
"""
课件生成器初始化脚本

用于快速创建交互式教学课件的基础目录结构和文件。

用法：
    python init_courseware.py <target-repo> <skill-name> <guide-command> [--output-dir <path>]

示例：
    python init_courseware.py /path/to/repo my-guide /my-guide
    python init_courseware.py /path/to/repo cc4pm-guide /cc4pm-guide --output-dir /custom/path
"""

import argparse
import os
import sys
from pathlib import Path
from datetime import datetime


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

    for name, path in dirs.items():
        path.mkdir(parents=True, exist_ok=True)
        print(f"✅ 创建目录: {path}")

    return dirs


def generate_skill_md(dirs: dict, skill_name: str, guide_command: str, target_repo: str) -> str:
    """生成主 Skill 文件（SKILL.md）"""
    content = f"""---
name: {skill_name}
description: {target_repo.split('/')[-1]} 交互式教学 - 从入门到精通
---

# {target_repo.split('/')[-1]} 交互式教学

## 欢迎使用

欢迎使用 {target_repo.split('/')[-1]} 交互式教学！

本教学将帮助你从零开始掌握 {target_repo.split('/')[-1]}。

## 你将学到

- 核心概念：理解项目的设计理念
- 基础操作：掌握日常使用的基本功能
- 进阶技巧：学会组合用法和高级特性
- 方法论：理解最佳实践和设计哲学

## 预计用时

- 新手完整学习：约 30-60 分钟
- 有基础用户：约 15-30 分钟

## 使用方式

请选择你的学习方式：

**[1] 从头开始（推荐首次学习）**

从第一课开始，循序渐进地学习。

**[2] 跳到特定阶段**

如果你已有基础，可以直接跳转到特定阶段。

**[3] 查看学习进度**

查看已完成的课程和总体进度。

**[4] 退出**

结束本次学习。

---

## 阶段导航

### 阶段 1：基础入门 🔒 待解锁

前置要求：无

| 课程 | 标题 | 状态 |
|------|------|------|
| Lesson 1 | [待生成] | 🔒 待解锁 |
| Lesson 2 | [待生成] | 🔒 待解锁 |
| Lesson 3 | [待生成] | 🔒 待解锁 |

### 阶段 2：核心功能 🔒 待解锁

前置要求：完成阶段 1

### 阶段 3：进阶技巧 🔒 待解锁

前置要求：完成阶段 2

### 阶段 4：方法论 🔒 待解锁

前置要求：完成阶段 3

### 阶段 5：生态扩展 🔒 待解锁

前置要求：完成阶段 4

---

## 课程内容

### Lesson 1: [待生成]

**本课目标**

- [待生成]

**核心内容**

*[内容将由 courseware-generator 完整生成]*

**下一步**

- [1] 进入下一课：[Lesson 2]
- [2] 返回主菜单
- [3] 退出学习

---

## 进度追踪

### 你的学习进度

- 已完成课程：0/15
- 当前阶段：未开始
- 学习时长：0 分钟

### 成就徽章

- 🥉 初学者：完成第一课
- 🥈 入门者：完成阶段 1
- 🥇 进阶者：完成阶段 2
- 🏆 精通者：完成全部课程

---

## 退出

感谢使用 {target_repo.split('/')[-1]} 交互式教学！

运行 `{guide_command}` 随时继续学习。

---

*本教学 Skill 由 courseware-generator 自动生成*
*生成日期：{datetime.now().strftime('%Y-%m-%d')}*
*对应仓库：{target_repo}*
"""

    skill_md_path = dirs["root"] / "SKILL.md"
    skill_md_path.write_text(content)
    print(f"✅ 生成文件: {skill_md_path}")
    return content


def generate_readme(dirs: dict, skill_name: str, guide_command: str, target_repo: str):
    """生成 README 文件"""
    readme_content = f"""# {skill_name}

{target_repo.split('/')[-1]} 交互式教学课件

## 使用方法

```bash
# 运行教学
/claude-code
{ dirs['root'] }/SKILL.md
```

或直接运行：

```bash
{guide_command}
```

## 课程结构

```
{skill_name}/
├── SKILL.md           # 主教学入口
├── lessons/           # 课程目录
│   ├── stage-1/       # 基础入门
│   ├── stage-2/       # 核心功能
│   ├── stage-3/       # 进阶技巧
│   ├── stage-4/       # 方法论
│   └── stage-5/       # 生态扩展
├── _resources/        # 资源文件
└── assets/            # 静态资源
```

## 生成信息

- 生成日期：{datetime.now().strftime('%Y-%m-%d')}
- 对应仓库：{target_repo}
- 生成工具：courseware-generator

## 关于

本课件由 courseware-generator 自动生成，用于将 {target_repo.split('/')[-1]} 转换成交互式教学形式。
"""

    readme_path = dirs["root"] / "README.md"
    readme_path.write_text(readme_content)
    print(f"✅ 生成文件: {readme_path}")


def generate_understanding_map(dirs: dict, target_repo: str):
    """生成理解地图模板"""
    map_content = f"""# 仓库理解地图

## 基本信息

| 字段 | 内容 |
|------|------|
| 名称 | {target_repo.split('/')[-1]} |
| 用途 | [待填写] |
| 目标用户 | [待填写] |
| 核心方法论 | [待填写] |
| 版本 | [待填写] |
| 最后更新 | {datetime.now().strftime('%Y-%m-%d')} |

## 目录结构

```
{target_repo}/
├─ [目录1]/    职责：[描述]
├─ [目录2]/    职责：[描述]
├─ [目录3]/    职责：[描述]
└─ [文件]      [描述]
```

## 核心能力

### 能力 1：[待填写]

- **描述**：[待填写]
- **对应文件**：[待填写]
- **使用频率**：⭐⭐☆☆☆
- **入门难度**：⭐⭐☆☆☆

## 使用场景

### 场景 1：[待填写]

**描述**：[待填写]

**涉及的模块**：
- [模块 1]：负责 [功能描述]
- [模块 2]：负责 [功能描述]

**典型流程**：
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## 学习路径建议

### 新手推荐

1. **先学**：先学习 [能力/模块]，因为它是基础
2. **再学**：然后学习 [能力/模块]，因为它常用
3. **后学**：最后学习 [能力/模块]，因为它较复杂

---

*本理解地图由 courseware-generator 自动生成*
*生成日期：{datetime.now().strftime('%Y-%m-%d')}*
"""

    map_path = dirs["resources"] / "understanding-map.md"
    map_path.write_text(map_content)
    print(f"✅ 生成文件: {map_path}")


def generate_sample_lesson(dirs: dict, stage: int, lesson_num: int):
    """生成示例课程文件"""
    lesson_content = f"""# Lesson {lesson_num}: [课程标题]

## 本课目标

- 目标 1：具体可衡量的学习目标
- 目标 2：具体可衡量的学习目标

## 核心内容

### 概念讲解

[用简洁、口语化的语言讲清楚"是什么"和"为什么"]

### 实战示例

```bash
# 示例命令
/example-command --option value
```

### 进阶内容（可选）

[针对进阶用户的额外说明]

## 常见问题

**Q: [问题 1]？**

A: [答案 1]

**Q: [问题 2]？**

A: [答案 2]

## 下一步

- [1] 进入下一课：[Lesson {lesson_num + 1}]
- [2] 返回主菜单
- [3] 退出学习

---

*课程所属阶段：阶段 {stage} - [阶段名称]*
*上一课：[Lesson {lesson_num - 1}]*
*下一课：[Lesson {lesson_num + 1}]*
"""

    if stage == 1:
        lesson_path = dirs["lessons_stage1"] / f"lesson-{lesson_num}.md"
    elif stage == 2:
        lesson_path = dirs["lessons_stage2"] / f"lesson-{lesson_num}.md"
    elif stage == 3:
        lesson_path = dirs["lessons_stage3"] / f"lesson-{lesson_num}.md"
    elif stage == 4:
        lesson_path = dirs["lessons_stage4"] / f"lesson-{lesson_num}.md"
    else:
        lesson_path = dirs["lessons_stage5"] / f"lesson-{lesson_num}.md"

    lesson_path.write_text(lesson_content)
    print(f"✅ 生成示例课程: {lesson_path}")
    return lesson_path


def generate_gitignore(dirs: dict):
    """生成 .gitignore 文件"""
    gitignore_content = """# 课件生成器生成的文件

# AI 生成的内容可能需要审查
*.ai-generated

# 临时文件
*.tmp
*.bak

# macOS 系统文件
.DS_Store
"""

    gitignore_path = dirs["root"] / ".gitignore"
    gitignore_path.write_text(gitignore_content)
    print(f"✅ 生成文件: {gitignore_path}")


def main():
    parser = argparse.ArgumentParser(
        description="课件生成器初始化脚本 - 创建交互式教学课件的基础结构"
    )
    parser.add_argument("target_repo", help="目标仓库的路径")
    parser.add_argument("skill_name", help="要生成的 Skill 名称")
    parser.add_argument("guide_command", help="用户运行的教学命令，如 /xxx-guide")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="输出目录，默认为 {target-repo}/.claude/skills/{skill-name}",
    )

    args = parser.parse_args()

    # 确定输出目录
    if args.output_dir:
        output_base = Path(args.output_dir)
    else:
        output_base = Path(args.target_repo) / ".claude" / "skills"

    print(f"\n🚀 开始生成课件...")
    print(f"   目标仓库: {args.target_repo}")
    print(f"   Skill 名称: {args.skill_name}")
    print(f"   教学命令: {args.guide_command}")
    print(f"   输出目录: {output_base}\n")

    # 创建目录结构
    dirs = create_directory_structure(output_base, args.skill_name)

    # 生成文件
    print("\n📄 生成核心文件...")
    generate_skill_md(dirs, args.skill_name, args.guide_command, args.target_repo)
    generate_readme(dirs, args.skill_name, args.guide_command, args.target_repo)
    generate_understanding_map(dirs, args.target_repo)
    generate_gitignore(dirs)

    # 生成示例课程（每个阶段 1 个示例）
    print("\n📚 生成示例课程...")
    for stage in range(1, 6):
        generate_sample_lesson(dirs, stage, 1)

    print(f"\n✅ 课件初始化完成！")
    print(f"\n📋 下一步操作：")
    print(f"   1. 运行 courseware-generator 技能")
    print(f"   2. 输入目标仓库路径：{args.target_repo}")
    print(f"   3. 输入 Skill 名称：{args.skill_name}")
    print(f"   4. AI 将继续生成完整的课程内容")
    print(f"\n📖 快速开始：")
    print(f"   运行 {args.guide_command} 即可开始学习")

    return 0


if __name__ == "__main__":
    sys.exit(main())