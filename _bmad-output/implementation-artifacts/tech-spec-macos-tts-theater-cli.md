---
title: 'macOS TTS 剧场播音 CLI'
type: 'feature'
created: '2026-06-05'
status: 'done'
baseline_commit: '9f520bb84cbe27e43c1c2769d733140bf0831973'
context: ['CLAUDE.md']
---

# macOS TTS 剧场播音 CLI

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Swarm/Agent Teams 角色辩论现在只能以文字出现，缺少同步播出的舞台感。用户需要一个最小可用工具，把角色 agent 的台词按角色映射到 macOS 自带 `say` 播放。

**Approach:** 新增本地 CLI `theater-say`，先支持手动喂入角色名和台词，并预留 dry-run/参数化能力供后续 transcript 监听器复用。通过 `cc4pm theater-say` 暴露，不引入第三方依赖。

## Boundaries & Constraints

**Always:** 仅使用本机 `say`；使用参数数组调用子进程，不拼 shell 字符串；支持 dry-run 便于测试；非 macOS 或缺少 `say` 时给出清晰错误。

**Ask First:** 自动监听 Claude transcript、配置 hooks、后台常驻进程、写入用户全局设置、安装依赖或改变 Agent Teams 行为。

**Never:** 不让角色 agent 各自直接播音；不播放 idle/shutdown/系统消息；不接入外部 TTS 服务；不提交或发布代码。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 角色台词 dry-run | `theater-say gu-yan "台词" --dry-run` | 输出将调用的 voice/rate/text JSON，不播放音频 | N/A |
| 未知角色 | `theater-say unknown "台词"` | 失败并提示可用角色 | exit 1 |
| 空台词 | `theater-say gu-yan ""` 或 stdin 为空 | 失败并提示 text required | exit 1 |
| 覆盖音色 | `--voice Tingting --rate 180` | 使用覆盖参数而非默认角色映射 | 参数无效时报错 |
| 列出角色 | `--list-roles` | 输出角色、voice、rate | N/A |

</frozen-after-approval>

## Code Map

- `scripts/cc4pm.js` -- 顶层 CLI 命令分发与帮助文案。
- `scripts/theater-say.js` -- 新增 macOS TTS 剧场播音 CLI。
- `tests/scripts/cc4pm.test.js` -- 现有顶层命令分发测试。
- `tests/scripts/theater-say.test.js` -- 新增 theater-say 行为测试。
- `tests/run-all.js` -- 测试入口，需纳入新测试文件。

## Tasks & Acceptance

**Execution:**
- [ ] `tests/scripts/theater-say.test.js` -- 新增失败优先测试 -- 锁定 CLI 行为和边界。
- [ ] `scripts/theater-say.js` -- 实现角色映射、参数解析、stdin 输入、dry-run、`say` 调用 -- 提供 MVP 播音能力。
- [ ] `scripts/cc4pm.js` -- 增加 `theater-say` 命令和帮助文案 -- 统一从 cc4pm CLI 调用。
- [ ] `tests/scripts/cc4pm.test.js` / `tests/run-all.js` -- 补充命令分发和测试入口 -- 保证 CI 覆盖。

**Acceptance Criteria:**
- Given macOS 本机有 `say`，when 运行 `node scripts/theater-say.js gu-yan "..."`，then 使用顾砚默认音色和语速播放该台词。
- Given `--dry-run`，when 运行任意有效角色台词，then 输出 JSON 且不调用 `say` 播放。
- Given 未知角色或空台词，when 运行 CLI，then 以非 0 状态退出并输出明确错误。
- Given 用户运行 `node scripts/cc4pm.js theater-say --list-roles`，then 成功委托到 theater-say 并展示角色列表。

## Verification

**Commands:**
- `node tests/scripts/theater-say.test.js` -- expected: all theater-say tests pass.
- `node tests/scripts/cc4pm.test.js` -- expected: command routing tests pass.
- `node tests/run-all.js` -- expected: full JS test suite passes.
