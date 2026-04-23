# 单课模板

本文档描述单个 Lesson 的标准结构和写法。

---

## 标准结构

```markdown
# Lesson X: [课程标题]

## 本课目标
- 目标 1：具体可衡量的学习目标
- 目标 2：具体可衡量的学习目标
- 目标 3：（可选）

## 核心内容

### 概念讲解
[用简洁、口语化的语言讲清楚"是什么"和"为什么"]

### 实战示例
[提供可直接运行的代码/命令]

```bash
# 示例命令
/example-command --option value
```

```javascript
// 示例代码
const result = doSomething();
console.log(result);
```

### 进阶内容（可选）
[针对进阶用户的额外说明]

## 常见问题

**Q: [问题 1]？**

A: [答案 1]

**Q: [问题 2]？**

A: [答案 2]

## 下一步

- 进入下一课：[Lesson X+1: 下一课标题]
- 复习本课：[Lesson X: 本课标题]
- 查看相关文档：[相关文档链接]

---

## 编写指南

### 本课目标

每个课程应该有 2-3 个明确的学习目标，使用动词开头：

- ✅ "理解 Skill 的结构"
- ✅ "掌握创建 Skills 的流程"
- ✅ "能够独立生成新的 Lesson"

- ❌ "了解 Skill"（太模糊）
- ❌ "学习如何创建 Skill"（不够具体）

### 概念讲解

原则：简洁、口语化、类比化

**好例子**：
"Skill 就像一个‘专业助手’。普通对话中，Claude 需要从零开始了解你的需求；但有了 Skill，就像给 Claude 请了一位‘老员工’，它已经掌握了这个领域的专业知识和工作流程。"

**差例子**：
"Skill 是 Claude Code 的插件系统，它通过 YAML frontmatter 和 Markdown 文档来定义技能的元数据和行为规范..."

### 实战示例

原则：可直接运行、循序渐进、有注释

**好例子**：
```bash
# 1. 进入项目目录
cd my-project

# 2. 创建新的 Skill
/claude-code /Users/me/.claude/skills/my-skill SKILL.md

# 3. 查看生成的模板
cat SKILL.md
```

**差例子**：
```
运行 create-skill 命令
```

### 常见问题

收集用户最常问的问题，并给出简洁的答案：

- 每个 Lesson 2-4 个 FAQ
- 问题要具体，不要问"如何使用 Skill"这种大问题
- 答案要给出具体的操作步骤或代码示例

### 下一步

清晰指引用户的学习路径：

- 如果理解了 → 进入下一课
- 如果想深入 → 查看相关文档
- 如果需要帮助 → 参考哪些资源

---

## 长度建议

| 阶段 | 单课建议长度 | 说明 |
|------|-------------|------|
| 阶段 1（基础入门） | 100-200 行 | 简单概念，快速上手 |
| 阶段 2（核心功能） | 200-400 行 | 详细讲解，充分示例 |
| 阶段 3（进阶技巧） | 300-500 行 | 深入分析，复杂场景 |
| 阶段 4（方法论） | 200-400 行 | 理念讲解，实践指导 |
| 阶段 5（生态扩展） | 100-200 行 | 简要介绍，引导探索 |

---

## 示例 Lesson

以下是一个完整的示例，展示了如何编写 Lesson：

```markdown
# Lesson 2: 创建你的第一个 Skill

## 本课目标
- 理解 Skill 的基本结构
- 掌握 YAML frontmatter 的写法
- 能够独立创建一个简单的 Skill

## 核心内容

### 什么是 Skill？

Skill 是 Claude Code 的"专业化插件"。想象一下：

- **普通模式**：Claude 就像一位刚入职的新员工，你需要从零开始告诉他所有事情
- **Skill 模式**：Claude 就像一位经验丰富的老员工，已经掌握了这个领域的专业知识和最佳实践

Skill 通过两个核心部分来"教会"Claude：
1. **元数据**（YAML frontmatter）：告诉 Claude 这个 Skill 是做什么的
2. **说明文档**（Markdown）：告诉 Claude 具体怎么做

### 创建 Skill 的第一步：写好 Frontmatter

每个 Skill 都以 YAML frontmatter 开头：

```yaml
---
name: my-skill
description: 一句话描述这个 Skill 做什么
---

# 我的技能

这里是技能的正文内容...
```

### 实战示例：创建一个"会议纪要"Skill

```bash
# 1. 进入 Skills 目录
cd ~/.claude/skills/

# 2. 创建新的 Skill 文件
cat > meeting-notes.md << 'EOF'
---
name: meeting-notes
description: 帮助整理和生成会议纪要
---

# 会议纪要助手

## 使用方法

1. 粘贴会议录音或笔记
2. 运行 /meeting-notes
3. AI 自动整理成结构化的会议纪要

## 支持的格式

- 纯文本
- Markdown
- 语音转文字结果
EOF

# 3. 查看创建的文件
cat meeting-notes.md
```

### 运行你的第一个 Skill

创建完成后，你可以这样使用：

```bash
/claude-code
/Users/me/.claude/skills/meeting-notes.md
```

## 常见问题

**Q: Skill 文件必须以 .md 结尾吗？**

A: 是的，Skill 文件必须是 `.md` 扩展名，这样 Claude Code 才能识别它。

**Q: description 字段最长可以多长？**

A: 建议控制在 1-2 句话，长度不超过 100 字。description 是 Claude 判断何时使用这个 Skill 的关键依据。

**Q: 一个 Skill 可以包含多个文件吗？**

A: 可以。对于复杂技能，你可以：
- 主文件在 `skills/` 目录
- 参考文件在 `skills/references/` 目录
- 脚本在 `skills/scripts/` 目录

## 下一步

- 进入下一课：[Lesson 3: 完善 Skill 的核心内容]
- 复习本课：[Lesson 2: 创建你的第一个 Skill]
- 实践一下：尝试创建一个自己的 Skill

---

*课程所属阶段：阶段 1 - 基础入门*
*上一课：[Lesson 1: 认识 Skill]*
*下一课：[Lesson 3: 完善 Skill 的核心内容]*
```

---

## 质量检查清单

创建完 Lesson 后，检查以下项目：

- [ ] 标题清晰，描述本课核心内容
- [ ] 有 2-3 个明确的学习目标
- [ ] 概念讲解简洁、口语化
- [ ] 示例代码可以直接运行
- [ ] 有 2-4 个常见问题
- [ ] 下一步指引清晰
- [ ] 长度符合阶段建议
- [ ] 无错别字和语法错误