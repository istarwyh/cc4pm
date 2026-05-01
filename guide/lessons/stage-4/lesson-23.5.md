# Lesson 23.5: ccc 实战——国产大模型切换与严格 Supervisor 模式

## 本课目标

- 了解 `ccc` (Claude Code Supervisor) 如何增强原生 Claude Code 的能力
- 掌握如何将 Kimi、GLM、MiniMax 等国产大模型无缝接入开发流
- 理解基于 Fork 会话的 Supervisor 严格审查机制
- 学会配置“无人值守”的自动任务修正闭环

> **为什么需要 ccc？** 
> 原生 Claude Code 只能连接 Anthropic 服务。但在国内环境下，网络稳定性和 Token 成本是关键挑战。同时，原生模式在 Agent 停止后缺乏外部的“第二次审视”。`ccc` 解决了这两个痛点。

## 核心内容

### 什么是 ccc？

`ccc` 是由社区贡献的 Claude Code 增强工具，它通过 **Hook 拦截** 和 **Provider 映射**，为 Claude Code 披上了一层“超级外壳”。

### 核心功能一：国产大模型无缝切换

`ccc` 允许你通过简单的配置文件，将兼容 Anthropic 格式的国产大模型接口映射进来。

```bash
# 切换到 GLM 运行
ccc glm

# 切换到 Kimi 运行
ccc kimi
```

**这对 PM 的意义：**
- **显著降本**：对于大量的重复性代码生成（如补全测试、简单 UI），使用 Kimi 或 GLM 成本极低。
- **国内网络加速**：直连国内服务器，告别代理带来的延迟和断连。

### 核心功能二：Supervisor 模式（严格审查）

这是 `ccc` 最有价值的特性。它与我们 Lesson 23.2 学的 Loop 模式不同：

| 特性 | 原生 /orchestrate | ccc Supervisor |
|------|-------------------|----------------|
| **触发机制** | 预定义的代理链 | Stop Hook（每次 Agent 停下时触发） |
| **评估方式** | 信号/状态码检测 | **Fork 完整会话上下文** 进行内容审计 |
| **反馈深度** | 相对固定 | 根据实际代码输出质量给出具体修改意见 |

**工作流程：**
1. Agent 完成任务并尝试退出。
2. `ccc` 截获退出信号，Fork 出一个新的上下文（Supervisor）。
3. Supervisor 审阅变更：代码写了吗？测试跑了吗？逻辑对吗？
4. 如果不达标，Supervisor 拒绝退出，并将“反馈意见”注入回主会话。
5. Agent 自动根据反馈继续工作，直到 Supervisor 认可。

### 环境搭建

#### 1. 安装 (macOS/Linux)
```bash
# 下载并安装到 /usr/local/bin
OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m | sed -e 's/x86_64/amd64/' -e 's/aarch64/arm64/'); curl -LO "https://github.com/guyskk/claude-code-supervisor/releases/latest/download/ccc-${OS}-${ARCH}" && sudo install -m 755 "ccc-${OS}-${ARCH}" /usr/local/bin/ccc
```

#### 2. 配置提供商
创建 `~/.claude/ccc.json`：
```json
{
  "providers": {
    "kimi": {
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "你的_API_KEY",
        "ANTHROPIC_MODEL": "kimi-k2-thinking"
      }
    }
  }
}
```

### 实战：开启“无人值守”迭代

1. **启动 ccc**：
   ```bash
   ccc
   ```

2. **开启监督模式**：
   在对话框中输入：
   ```text
   /supervisor 好，开始实现用户登录模块，包含验证码逻辑和测试。
   ```

3. **观察**：
   - Agent 开始写代码。
   - 当 Agent 觉得写完想停下时，你会看到底部的状态栏闪烁。
   - `ccc` 自动唤起 Supervisor 审查。
   - 如果 AI 漏写了验证码测试，Supervisor 会提示：“登录功能已完成，但缺少对验证码重放攻击的测试，请补充。”
   - Agent 自动继续补全测试。

## 🛠️ 实操练习

### 练习 1：配置国产模型 Provider
按照上述步骤配置一个你常用的国产模型（Kimi 或 GLM），并运行 `ccc validate` 验证连通性。

### 练习 2：体验严格审查
故意给出一个模糊的需求，如“给这个项目加个日志功能”，然后开启 `/supervisor`。观察 Supervisor 如何迫使 Agent 补全文档和错误处理。

---

## 常见问题

**Q: `ccc` 会覆盖我的 Claude Code 配置吗？**
A: 不会。`ccc` 遵循“用户配置最高优先级”原则，它会合并配置并在运行时注入环境变量，你的 `settings.json` 中已安装的插件和 Hooks 依然有效。

**Q: 为什么 ccc 的 Supervisor 比原生 Loop 更强？**
A: 因为它是**基于内容的二次验证**。很多时候 AI 虽然不报错（Exit Code 0），但结果是“Slop”（敷衍的产出）。`ccc` 通过 Fork 上下文让另一个大脑来审视结果，能捕捉到这些非逻辑性的质量问题。

## 相关概念

- **Hooks System**（Lesson 8, 23）— ccc 通过 Hook 拦截实现 Provider 映射和审查机制
- **Quality Gate**（Lesson 23）— Supervisor 的 Fork 审查是 Quality Gate 的强化版

## 下一步

- [1] 进入阶段 5：高级应用与持续优化
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 23.5/26 | 上一课: Lesson 23.4 - 架构演进 | 下一课: Lesson 23.6 - CLIProxyAPI 实战*
