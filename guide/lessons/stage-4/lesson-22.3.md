# Lesson 22.3: 六大编码原则——驯服 AI 代码的魔法词

## 本课目标

- 掌握 BRIEF、KISS、YAGNI、DRY、SPOT、SOLID 六大编码原则
- 学会用这些原则审查和引导 AI 生成的代码
- 理解为什么 AI 写代码越快，工程原则越重要

## 核心内容

### 为什么 AI 时代更需要编码原则？

AI 写代码的速度是人类的 100 倍。但速度是一把双刃剑——

```
没有原则：AI 快速生成 200 行 → 人类看不懂 → 维护爆炸
有原则约束：AI 生成代码 → 人类用原则审查 → 不达标打回重写
```

**核心观点**：AI 负责"写"，人类负责"判"。编码原则就是你的判据。

下面这 6 个词，就是你在 AI 时代驯服代码的魔法。

### BRIEF —— 简短是美德

BRIEF 不是行业标准缩写，而是一种实践倡导：**每个函数都应该简短**。

```
BRIEF 的三个启发：
  1. 函数尽量简短（超过 15 行考虑拆分）
  2. 参数尽量少（超过 4 个考虑用对象封装）
  3. 遵循纯函数设计，避免副作用
```

**为什么关注函数长度？** 人类的工作记忆容量约为 7±2 个信息块。一个简短的函数，你扫一眼就能理解它在做什么。函数越长，大脑需要"加载上下文"越多，认知负担越重。但这不是说必须卡在某个数字——如果一个函数读起来费劲，大概率是太长了。

**在 AI 编程中的应用**：

```
❌ 差的 Prompt：
  "帮我写一个用户管理模块"

✅ 好的 Prompt：
  "帮我写一个用户管理模块，函数尽量控制在 15 行以内，
   超过的请拆分，参数尽量不超过 4 个"
```

**实战示例**：

```typescript
// ❌ AI 常见输出：一个 30 行的"大杂烩"函数
async function processUser(raw: unknown) {
  const parsed = UserSchema.parse(raw)
  const existing = await db.findUser(parsed.email)
  if (existing) throw new ConflictError('Email taken')
  const hashed = await bcrypt.hash(parsed.password, 10)
  const user = await db.createUser({ ...parsed, password: hashed })
  await emailService.sendWelcome(user.email)
  await analytics.track('signup', { userId: user.id })
  return { id: user.id, email: user.email }
}

// ✅ 用 BRIEF 原则重构：每个函数只做一件事
async function processUser(raw: unknown) {
  const parsed = validateUser(raw)
  await ensureEmailAvailable(parsed.email)
  const user = await createUser(parsed)
  await notifyNewUser(user)
  return sanitize(user)
}

function validateUser(raw: unknown) { return UserSchema.parse(raw) }
async function ensureEmailAvailable(email: string) {
  if (await db.findUser(email)) throw new ConflictError('Email taken')
}
async function createUser(parsed: ParsedUser) {
  const hashed = await bcrypt.hash(parsed.password, 10)
  return db.createUser({ ...parsed, password: hashed })
}
async function notifyNewUser(user: User) {
  await emailService.sendWelcome(user.email)
  await analytics.track('signup', { userId: user.id })
}
function sanitize(user: User) { return { id: user.id, email: user.email } }
```

**参数太多的技巧**：当参数超过 4 个时，考虑用对象封装。

```typescript
// ❌ 4 个参数——记不住顺序
function createUser(name: string, email: string, age: number, role: string)

// ✅ 用对象封装——每个参数有名字
function createUser(input: { name: string; email: string; age: number; role: string })
```

### KISS —— 能用最直接的方法解决，就别绕弯子

KISS（Keep It Simple, Stupid）是最古老也最常被忽视的原则。

**AI 的通病**：AI 见过太多设计模式，喜欢"炫技"。你让它写一个简单的状态管理，它可能给你一个完整的 Redux + Middleware + Selector 套件。

```
KISS 检查清单：
  □ 新人能一眼看懂这段代码吗？
  □ 有没有用更简单的方式达到同样效果？
  □ 引入的复杂度是必要的吗？
```

**实战示例**：

```typescript
// ❌ AI 炫技：策略模式 + 工厂模式 + 依赖注入
interface PaymentStrategy { pay(amount: number): void }
class CreditCardStrategy implements PaymentStrategy { ... }
class PayPalStrategy implements PaymentStrategy { ... }
class PaymentFactory { static create(method: string): PaymentStrategy { ... } }

// ✅ KISS：一个函数搞定
function processPayment(method: string, amount: number) {
  if (method === 'card') return payByCard(amount)
  if (method === 'paypal') return payByPayPal(amount)
  throw new Error(`Unknown method: ${method}`)
}
```

**什么时候复杂是合理的？** 当同一个 if-else 分支超过 5 个，或者策略需要动态扩展时，再考虑设计模式。在那之前，简单的 if-else 就是最好的代码。

### YAGNI —— 当前用不到的功能，一律不写

YAGNI（You Ain't Gonna Need It）是对抗"过度工程"的武器。

**AI 的通病**：AI 喜欢"为你好"——你要一个 API 接口，它顺便给你加了分页、缓存、限流、日志、监控。

```
YAGNI 的判断标准：
  这个功能当前版本会用到吗？
    → 会 → 写
    → 不会 → 不写
    → 可能会 → 还是不写（真需要时再加）
```

**实战示例**：

```typescript
// ❌ AI "为你好"：你只要一个 GET 接口
app.get('/api/users', async (req, res) => {
  const { page = 1, limit = 20, sort = 'created_at', order = 'desc',
          search, role, status, created_after, created_before } = req.query
  // 50 行的分页 + 过滤 + 排序逻辑...
})

// ✅ YAGNI：当前版本只需要返回全部用户
app.get('/api/users', async (req, res) => {
  const users = await db.findAllUsers()
  res.json(users)
})
```

**YAGNI 不是懒惰**：它是"用重构代替预设"。当真的需要分页时再加——那时你有真实需求，设计出来比提前猜测的准确 10 倍。

### DRY —— 不要重复自己（但要务实）

DRY（Don't Repeat Yourself）的核心不是"没有重复代码"，而是**保证改动只在一处发生**。

```
务实的 DRY：
  ✅ 同一个业务规则只定义一次 → 改规则时只改一处
  ✅ 同一个验证逻辑只写一次 → 改验证时只改一处
  ⚠️ 两段代码长得像但语义不同 → 可以不合并
  ⚠️ 合并后反而难懂 → 保留重复
```

**实战示例**：

```typescript
// ❌ 过度 DRY：把不相关的验证强行合并
function validate(field: string, value: unknown, type: 'email' | 'phone' | 'name') {
  if (type === 'email') return emailRegex.test(value)
  if (type === 'phone') return phoneRegex.test(value)
  if (type === 'name') return value.length > 0 && value.length < 100
}
// 问题：改邮箱验证规则可能意外影响姓名验证

// ✅ 务实 DRY：每个验证独立，但正则常量集中定义
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^1[3-9]\d{9}$/

function isValidEmail(email: string) { return EMAIL_REGEX.test(email) }
function isValidPhone(phone: string) { return PHONE_REGEX.test(phone) }
function isValidName(name: string) { return name.length > 0 && name.length < 100 }
```

### SPOT —— 单一真相源

SPOT（Single Point of Truth）比 DRY 更具体。DRY 关注代码不重复，SPOT 关注**数据只有一个权威来源**。

```
SPOT 的应用场景：
  配置集中在一个文件 → 不要散落在各处
  常量定义在一个位置 → 改一处全局生效
  业务规则维护在一个地方 → 避免不一致
```

**SPOT vs DRY**：违反 DRY 是维护成本高（代码重复），违反 SPOT 是直接出 Bug（数据不一致）。

**实战示例**：

```typescript
// ❌ 违反 SPOT：税率在多处硬编码
function calculateTax(price: number) { return price * 0.13 }
function displayTax(price: number) { return `税费: ¥${(price * 0.13).toFixed(2)}` }
function validateTax(tax: number, price: number) { return tax === price * 0.13 }

// ✅ 遵循 SPOT：税率定义一处，全局引用
// config/constants.ts
export const TAX_RATE = 0.13

// 任何需要税率的地方
import { TAX_RATE } from '@/config/constants'
function calculateTax(price: number) { return price * TAX_RATE }
```

**SPOT 在 AI 编程中的重要性**：AI 生成代码时，经常在多个文件中硬编码同一个值。用 SPOT 原则审查 AI 输出，确保配置、常量、业务规则只有一个权威来源。

### SOLID —— 面向对象的五大纪律

SOLID 是面向对象设计的五个原则。对于产品主理人，不需要精通每个细节，但要理解其核心思想——**让代码容易修改，不容易出错**。

#### S — 单一职责（Single Responsibility）

一个类只做一件事。如果你需要用"和"来描述一个类的职责，它就应该拆分。

```typescript
// ❌ 一个类做了三件事
class UserService {
  createUser() { ... }
  sendWelcomeEmail() { ... }
  trackSignup() { ... }
}

// ✅ 每个类只做一件事
class UserService { createUser() { ... } }
class EmailService { sendWelcome(email: string) { ... } }
class AnalyticsService { track(event: string) { ... } }
```

**AI 审查要点**：检查 AI 生成的类/函数是否承担了多个职责。如果一个函数名里有 "and"，大概率违反了 SRP。

#### O — 开放封闭（Open-Closed）

对扩展开放，对修改封闭。新增功能时，应该加代码，而不是改已有代码。

```typescript
// ❌ 每次新增支付方式都要改这个函数
function processPayment(method: string, amount: number) {
  if (method === 'card') { ... }
  else if (method === 'paypal') { ... }
  else if (method === 'crypto') { ... }  // 又改了一次
}

// ✅ 用 map 扩展，新增方式只需加一行
const processors: Record<string, (amount: number) => void> = { ... }
function processPayment(method: string, amount: number) {
  processors[method](amount)
}
```

#### L — 里氏替换（Liskov Substitution）

子类型必须能替换父类型。如果代码接受 `Animal`，传入 `Dog` 或 `Cat` 都应该正常工作。

**AI 审查要点**：当 AI 使用继承时，检查子类是否改变了父类的约定（比如父类方法不抛异常，子类却抛了）。

#### I — 接口隔离（Interface Segregation）

不要强迫一个类实现它用不到的接口。接口应该小而专。

```typescript
// ❌ 一个"胖接口"——Robot 被迫实现 eat/sleep
interface Worker { work(): void; eat(): void; sleep(): void }

// ✅ 拆分为小接口
interface Workable { work(): void }
interface Eatable { eat(): void }
class Robot implements Workable { work() { ... } }
class Human implements Workable, Eatable { ... }
```

#### D — 依赖倒置（Dependency Inversion）

高层模块不应该依赖低层模块，两者都应该依赖抽象。

```typescript
// ❌ 绑死了 MySQL
class OrderService {
  private db = new MySQLDatabase()
  saveOrder(order: Order) { this.db.insert('orders', order) }
}

// ✅ 依赖接口，实现可替换
class OrderService {
  constructor(private repo: OrderRepository) {}
  saveOrder(order: Order) { this.repo.save(order) }
}
```

**AI 审查要点**：当 AI 生成的代码直接 `new` 一个具体实现时，考虑是否应该通过依赖注入传入。

### 如何在 Prompt 中使用这些原则

最有效的方式不是在审查时才用，而是在 Prompt 中就告诉 AI：

```
❌ "帮我写一个订单处理模块"

✅ "帮我写一个订单处理模块，要求：
   1. 函数尽量控制在 15 行以内，超过的拆分（BRIEF）
   2. 引入设计模式前先确认简单方案不够用（KISS）
   3. 只实现当前需要的功能，不要加分页、缓存等（YAGNI）
   4. 常量和配置集中定义（SPOT）
   5. 每个类只做一件事（SRP）"
```

| 场景 | 优先原则 |
|------|---------|
| AI 生成的函数太长 | BRIEF |
| AI 引入了不必要的设计模式 | KISS |
| AI 加了你没要求的功能 | YAGNI |
| AI 在多处硬编码同一个值 | SPOT |
| AI 把多个职责塞进一个类 | SRP |

## 🛠️ 实操练习

### 练习 1：BRIEF 重构

让 AI 生成一个"文件上传处理"函数，然后审查：函数是否过长（超过 15 行）？参数是否过多（超过 4 个）？如果有，让 AI 重构。

### 练习 2：YAGNI 精简

让 AI 生成一个"用户注册 API"，检查它是否添加了你没要求的功能。用 YAGNI 原则让 AI 去掉多余功能。

### 练习 3：SPOT 检查

让 AI 生成一个包含多个文件的模块，检查是否有同一个常量在多处硬编码。让 AI 将常量集中到一个文件。

### 练习 4：原则组合实战

用以下 Prompt 让 AI 生成代码，然后逐一审查：

```
"写一个发票处理模块，要求：
 函数尽量简短，不要过度设计，
 只实现开票和查询两个功能，
 常量集中定义，每个类只做一件事"
```

**检查清单**：

- [ ] 理解 BRIEF 的三个启发（短函数、少参数、纯函数）
- [ ] 能用 KISS 判断 AI 是否过度设计
- [ ] 能用 YAGNI 拒绝 AI 的"为你好"
- [ ] 理解 DRY 和 SPOT 的区别
- [ ] 能用 SOLID 的 S 和 I 审查 AI 生成的类
- [ ] 能在 Prompt 中嵌入编码原则约束

---

## 常见问题

**Q: 这些原则会不会限制 AI 的创造力？**

A: 恰恰相反。约束是创造力的朋友——给 AI 明确的原则，它产出的代码质量更高、更一致。

**Q: 6 个原则都要同时用吗？**

A: 入门阶段记住 3 个就够：**BRIEF**（代码要短）、**KISS**（不要过度设计）、**YAGNI**（不要加没用的功能）。等这三个成为习惯后，再加入 SPOT 和 SOLID。

**Q: SOLID 对产品主理人真的重要吗？**

A: 你不需要自己写出符合 SOLID 的代码——但你需要能**判断** AI 写的代码是否符合 SOLID。当 AI 生成了一个 500 行的"上帝类"时，你需要知道这违反了 SRP，并要求它拆分。

**Q: 这些原则和 /code-review 有什么关系？**

A: `/code-review` 的四级审查标准就是这些原则的自动化执行。比如"函数超过 50 行"是 HIGH 级别问题，本质上就是违反了 BRIEF。

## 下一步

- [1] 进入下一课：Lesson 23 - 自动化工作流
- [2] 返回主菜单
- [3] 退出学习

---
*阶段 4 | Lesson 22.3/26 | 上一课: Lesson 22.2 - 视觉校验 | 下一课: Lesson 22.4 - TDD Prompt 模板*
