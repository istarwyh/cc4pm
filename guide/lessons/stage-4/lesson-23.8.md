# Lesson 23.8: NVIDIA NIM API Catalog——免费的原型模型接口入口

## 本课目标

- 找到 NVIDIA 免费 NIM / API Catalog 的正确入口
- 理解 `NVIDIA_API_KEY`、`NGC_API_KEY` 和 hosted NIM endpoints 的关系
- 区分“免费原型验证”和“生产授权”两条边界
- 学会把 NVIDIA API Catalog 当成产品原型阶段的模型试验场

> **这堂课解决什么问题？**
> 很多产品主理人听说“英伟达也有免费 API”，但不知道入口在哪里、拿到的 key 应该怎么用、它和 NGC key 有什么区别。NVIDIA NIM API Catalog 不是 Claude Code 的直接替代入口，而是一个适合快速验证模型能力、RAG、推理服务和多模态能力的原型接口池。

## 核心内容

### 1. 入口在哪里？

NVIDIA API Catalog 的入口是：

```text
https://build.nvidia.com
```

API Key 管理页是：

```text
https://build.nvidia.com/settings/api-keys
```

官方 Quickstart 的路径是：进入 `build.NVIDIA.com`，选择一个模型，在模型页右侧点击 **Get API Key**。如果还没登录，会先要求你输入邮箱、登录或创建 NVIDIA 账号；完成后会弹出 key，复制保存即可。

这一步会让你成为 NVIDIA Developer Program 成员。根据 NVIDIA NIM 文档，Developer Program 成员可以免费访问 NIM API endpoints 做 prototyping；但这不是生产授权，也不是无限免费。

### 2. `NVIDIA_API_KEY` 怎么放？

面向 build.nvidia.com hosted NIM endpoints 的 key 通常以 `nvapi-` 开头。NVIDIA 文档给出的环境变量是：

```bash
export NVIDIA_API_KEY="nvapi-..."
```

PowerShell 写法是：

```powershell
$env:NVIDIA_API_KEY = "nvapi-..."
```

这个 key 可用于访问 NVIDIA-hosted NIM endpoints，文档中提到的 endpoint 域名包括 `ai.api.nvidia.com` 和 `integrate.api.nvidia.com`。

> **安全提醒**：key 弹出后要立刻复制保存，因为完整 secret 后续可能无法再次查看。不要把 `nvapi-...` 写进课程、Git、截图或公开笔记。

### 3. 它和 `NGC_API_KEY` 有什么区别？

NVIDIA 生态里容易混淆两类 key：

| Key | 来源 | 典型用途 |
|-----|------|----------|
| `NVIDIA_API_KEY` | `build.nvidia.com` | 调用 NVIDIA-hosted NIM endpoints，例如 API Catalog 里的模型 |
| `NGC_API_KEY` | NGC API key 页面 | Helm、`nvcr.io`、NGC Catalog、下载模型或部署相关资源 |

如果你只是想体验 API Catalog 里的 hosted model，优先看 `NVIDIA_API_KEY`。如果你要拉取 NIM 容器、部署到自己的环境、配 Helm 或访问 NGC Catalog，再看 `NGC_API_KEY`。

NVIDIA RAG Blueprint 文档还提到，服务级 key 可以覆盖全局 key，优先级是：

```text
service-specific key → NVIDIA_API_KEY → NGC_API_KEY → None
```

这对产品主理人的启发是：不要把“英伟达 API key”当成一个东西。先问清楚自己要做的是 hosted API 原型、RAG 服务配置，还是私有化部署。

### 4. 免费边界：适合原型，不等于生产免费

NVIDIA NIM 文档明确区分了两类场景：

- **原型验证**：NVIDIA Developer Program 成员可以免费访问 NIM API endpoints 做 prototyping。
- **研究、开发、测试与实验**：Developer Program 成员也可以获得可下载的 NIM microservice 访问权限，文档限定到最多 16 GPUs。
- **生产使用**：需要 NVIDIA AI Enterprise license。

所以你可以把它用于：

- 快速测试某个开源模型是否适合你的产品场景
- 给 RAG、客服机器人、文档问答做低成本原型验证
- 对比同一 prompt 在不同 hosted model 上的表现
- 判断是否值得进入私有化部署或生产采购讨论

但不要把它当成“生产环境永久免费模型池”。真正上线前，你需要重新确认授权、配额、SLA、成本和数据合规边界。

### 5. 产品主理人的判断框架

当你看到一个新模型 API，不要先问“能不能白嫖”，先问四个问题：

| 问题 | 判断 |
|------|------|
| 入口是否官方？ | `build.nvidia.com` 是官方 API Catalog 入口 |
| 免费是否有边界？ | 免费用于 prototyping，生产需要授权 |
| key 是否适配当前任务？ | hosted endpoint 用 `NVIDIA_API_KEY`，部署/NGC 相关看 `NGC_API_KEY` |
| 能否接入现有工具链？ | 可直接用于应用原型；若要驱动 Claude Code，需要额外的兼容代理或 provider 层 |

这套判断框架比记一个链接更重要。产品主理人的任务不是追逐每个免费 API，而是把它放进自己的验证链路：能不能更快验证需求、降低试错成本、减少采购前的不确定性。

## 常见问题

**Q: NVIDIA API Catalog 是免费的吗？**
A: NVIDIA NIM 文档说 Developer Program 成员可以免费访问 NIM API endpoints 做 prototyping。它适合原型验证，不等于生产免费，也不等于无限量使用。

**Q: 我应该用 `NVIDIA_API_KEY` 还是 `NGC_API_KEY`？**
A: 如果你在 `build.nvidia.com` 调用 hosted NIM endpoints，优先用 `NVIDIA_API_KEY`。如果你在 NGC、Helm、`nvcr.io` 或部署相关流程里工作，再看 `NGC_API_KEY`。

**Q: 这个能直接接到 Claude Code 吗？**
A: 不能简单等同。NVIDIA API Catalog 是模型/API Catalog 入口，Claude Code 需要 Anthropic 兼容或 OpenAI/Claude 兼容的 provider 层。要接入 Claude Code，通常还需要额外代理或适配层，类似 Lesson 23.6 里 CLIProxyAPI 的角色。

**Q: key 泄露了怎么办？**
A: 立刻到对应 key 管理页面删除或轮换 key，并检查代码仓库、日志、截图和环境变量历史里是否还有残留。

## 🛠️ 实操练习

### 练习 1：拿到你的 `NVIDIA_API_KEY`

1. 打开 `https://build.nvidia.com`
2. 登录或创建 NVIDIA 账号
3. 选择一个模型，点击 **Get API Key**
4. 复制 `nvapi-...` key，保存到本地安全位置
5. 在 shell 中设置：

```bash
export NVIDIA_API_KEY="nvapi-..."
```

### 练习 2：做一次产品原型判断

选择你正在做的一个 AI 功能，写下三句话：

```text
我想验证的功能：
为什么 NVIDIA hosted NIM endpoint 适合/不适合这个验证：
如果验证成功，进入生产前还要确认的授权、成本和数据边界：
```

这个练习的目标不是马上上线，而是把“免费 API”变成一次有边界的产品实验。

## 下一步

请调用 `AskUserQuestion` 展示以下选项，让学习者点击选择；从每条中提炼 1-5 个词作为 label，其余写入 description，不要要求输入数字：

- 进入阶段 5：继续学习高级应用与持续优化
- 返回 Lesson 23.7：回顾 Goal 模式，给 Claude 一个可验收的终点
- 回顾 Lesson 23.6：复习 CLIProxyAPI 如何把免费额度接入 Claude Code

---
*阶段 4 | Lesson 23.8/26 | 上一课: Lesson 23.7 - Goal 模式 | 下一课: Lesson 24 - 高级特性（阶段 5）*
