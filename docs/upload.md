# UUpload component contract / UUpload 组件契约

`UUpload` renders caller-owned file-state records, emits legacy local intents, and optionally orchestrates a caller-injected adapter. It implements no file chooser, file-byte access, URL/header/token construction, upload/delete/preview/download transport, network, cache, backend, timer, persistence, or platform integration.

`UUpload` 渲染调用方拥有的文件状态 record、emit legacy 本地 intent，并可选编排调用方注入的 adapter。它不实现文件 chooser、文件字节访问、URL/header/token 构造、upload/delete/preview/download transport、网络、cache、后端、timer、持久化或平台集成。

## Public inputs / 公开输入

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `visible` | `boolean` | `false` |
| `modelValue` | `ReadonlyArray<unknown>` | `undefined` |
| `files` | `ReadonlyArray<unknown>` | `[]` |
| `adapter` | `UUploadAdapter \| null` | `null` |
| `max` | `number` | `1` |
| `label` / `selectText` / `previewText` / `removeText` / `retryText` | `string` | `''` |
| `disabled` | `boolean` | `false` |

An explicitly supplied `modelValue`, including an empty array, is the controlled source; only `undefined` falls back to `files`. Neither array is mutated. Records may be string/number shortcuts or objects. The component reads only shallow `label`/`name`, `description`, `status`, `statusText`, and `disabled` presentation fields. Supported statuses are `ready`, `pending`, and `error`; every other status presents as `ready`.

显式传入的 `modelValue`（包括空数组）是受控 source；只有 `undefined` 才回退到 `files`。两个数组都不会被修改。record 可以是字符串/数字 shorthand 或对象。组件只读取浅层 `label`/`name`、`description`、`status`、`statusText` 与 `disabled` 呈现字段。支持的 status 为 `ready`、`pending` 与 `error`；其他 status 均呈现为 `ready`。

The visible projection inspects at most the first 12 source indexes. Unreadable or empty labels are omitted without renumbering the original index. Finite `max` is rounded and clamped to `1..12`; non-finite input falls back to `1`. Rendering requires `visible` plus a readable file or eligible select control. Empty action copy hides that action; retry appears only for an `error` record.

可见投影最多检查来源数组前 12 个 index。不可读或空 label 会被省略，但不会重编号原始 index。有限 `max` 会 round 并 clamp 到 `1..12`；非有限输入回退到 `1`。只有 `visible` 且存在可读文件或合格 select control 时才渲染。空 action copy 会隐藏对应操作；retry 只为 `error` record 呈现。

## Legacy intents and adapter context / Legacy intent 与 adapter context

Eligible interaction first emits its legacy synchronous intent: `select({ remainingSlots, event })`, or `preview/remove/retry({ file, event })`. A null, missing, or non-function same-name adapter method stops there and emits no adapter state.

合格交互首先 emit legacy 同步 intent：`select({ remainingSlots, event })`，或 `preview/remove/retry({ file, event })`。null、缺失或非函数的同名 adapter method 会在此结束，且不 emit adapter state。

The exact shallow-frozen adapter contexts are:

- select: `{ action, files, remainingSlots, event, requestId }`
- file action: `{ action, files, file, index, event, requestId }`

精确且浅冻结的 adapter context 为：

- select：`{ action, files, remainingSlots, event, requestId }`
- 文件操作：`{ action, files, file, index, event, requestId }`

`files` is a newly allocated shallow-frozen container that preserves each raw caller record identity. File-action `index` remains the index in the original controlled source. The adapter method is called with the adapter object as `this`.

`files` 是新创建且浅冻结的容器，保留每个 raw caller record identity。文件操作的 `index` 仍是原受控 source 中的 index。adapter method 以 adapter 对象作为 `this` 调用。

## Results, failures, and concurrency / 结果、失败与并发

`adapter-state` is the only asynchronous state event. Its shallow-frozen union is:

- `pending` or `stale`: `{ status, action, requestId }`
- `succeeded`: `{ status, action, requestId, updated }`
- `failed`: `{ status, action, requestId, failure: { code } }`

`adapter-state` 是唯一异步状态事件。其浅冻结 union 为：

- `pending` 或 `stale`：`{ status, action, requestId }`
- `succeeded`：`{ status, action, requestId, updated }`
- `failed`：`{ status, action, requestId, failure: { code } }`

Returning `undefined` emits `succeeded` with `updated: false`. Only a genuinely new readable raw array whose identity is distinct from the starting and current `modelValue`/`files` inputs is accepted. It emits `update:modelValue(newArray)` before `succeeded` with `updated: true`. Scalar/null results, an input-array alias, reactive/readonly aliases, and unreadable proxies fail with `invalid-result`.

返回 `undefined` 会 emit `succeeded`，且 `updated: false`。只有真正新的、可读 raw array，并且其 identity 与调用开始及结算时的 `modelValue`/`files` 输入均不同，才会被接受。组件先 emit `update:modelValue(newArray)`，再 emit `succeeded` 且 `updated: true`。scalar/null 结果、输入数组 alias、reactive/readonly alias 与不可读 proxy 都会以 `invalid-result` 失败。

Failure codes are exactly `adapter-threw`, `adapter-rejected`, and `invalid-result`; original errors, messages, credentials, and arbitrary rejection reasons are never exposed. Request IDs increase within one component instance. A later request for the same action makes the prior request `stale` exactly once; different actions are independent. A source or adapter identity/readability change makes settlement stale. After unmount, all later resolution or rejection is silent and no unhandled rejection escapes.

failure code 精确限定为 `adapter-threw`、`adapter-rejected` 与 `invalid-result`；原始 error、message、凭据及任意 rejection reason 绝不对外暴露。request ID 在组件实例内递增。同一 action 的后发请求会让先前请求恰好一次进入 `stale`；不同 action 相互独立。source 或 adapter identity/readability 变化会让结算变为 stale。卸载后，所有后续 resolve/reject 均保持静默，且不会泄漏 unhandled rejection。

Status remains presentation-only and is not a network or file-system conclusion. All copy, file data, transport decisions, model writeback, and business consequences remain caller-owned.

status 仍只用于呈现，不是网络或文件系统结论。全部文字、文件数据、transport 决策、model 写回及业务后果仍由调用方拥有。
