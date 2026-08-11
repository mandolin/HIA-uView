# USelect component contract / USelect 组件契约

`USelect` owns a short-lived inline panel and optional local confirmation draft over caller-owned finite options. It does not own a page popup/overlay service, request, search, remote filtering, router, or persistence.

`USelect` 在调用方拥有的有限 options 上拥有短生命周期的 inline panel 与可选本地确认草稿。它不拥有页面 popup/overlay service、请求、搜索、远端过滤、router 或持久化。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | Caller-owned selected value. / 调用方拥有的选中值。 |
| `options` | `ReadonlyArray<unknown>` | `[]` | Finite primitives or caller records such as `{ label, value, disabled }`. / 有限原始值或 `{ label, value, disabled }` 等 caller record。 |
| `placeholder` | `string` | `''` | Empty uses one locale-specific presentation fallback; the prop default remains empty. / 空值在呈现时使用一种 locale 回退；prop 默认值仍为空。 |
| `confirmText` / `cancelText` | `string` | `''` | Caller copy with locale-specific empty-value fallbacks. / 调用方文字，空值按 locale 回退。 |
| `confirmMode` | `boolean` | `false` | `false` commits immediately; `true` keeps an uncommitted draft. / `false` 立即提交；`true` 保留未提交草稿。 |
| `disabled` | `boolean` | `false` | Blocks opening and selection. / 阻止打开与选择。 |

Option matching uses strict equality and the first enabled duplicate; no string/number coercion occurs. Records are read through shallow own fields, and event snapshots retain the raw option identity.

option 匹配使用严格相等并采用首个 enabled 重复项；不会转换字符串与数字。record 只通过浅层自有字段读取，事件快照保留 raw option identity。

The first enabled trigger activation opens the panel and then emits `click(event)`. Disabled or already-open triggers emit nothing. In immediate mode, selecting an enabled option closes the panel and then emits `update:modelValue(value)` followed by `change(value)`; it emits no `confirm`.

首次 enabled trigger 激活会先打开 panel，再 emit `click(event)`。disabled 或已打开的 trigger 不 emit 事件。在即时模式中，选择 enabled option 会先关闭 panel，再依次 emit `update:modelValue(value)` 与 `change(value)`；不会 emit `confirm`。

In confirmation mode, option activation changes only the draft. Confirm closes the panel and emits `update:modelValue(value)`, `change(value)`, then `confirm({ value, index, option })`. Cancel restores the current caller model, closes the panel, and emits only `cancel({ value, index, option })`; an orphan caller value is preserved with `index: -1` and `option: null`.

在确认模式中，option 激活只改变草稿。确认会关闭 panel，并依次 emit `update:modelValue(value)`、`change(value)` 与 `confirm({ value, index, option })`。取消会恢复当前 caller model、关闭 panel，并且只 emit `cancel({ value, index, option })`；orphan caller value 会保留，且使用 `index: -1`、`option: null`。

Caller-model updates overwrite the draft. An options change that invalidates the draft restores the caller model. Becoming disabled closes silently and does not fabricate cancel. Invalid/disabled option activation or confirmation without a valid draft emits nothing. The component has no slots.

caller-model 更新会覆盖草稿。options 变化导致草稿失效时，会恢复 caller model。运行时变为 disabled 会静默关闭，不伪造 cancel。非法/disabled option 激活或没有有效草稿的确认均不 emit 事件。组件不提供 slot。

Styling consumes `--u-comp-select-*`; compiler/jsdom evidence does not establish DevTools, device, accessibility, or cross-platform support. / 样式消费 `--u-comp-select-*`；compiler/jsdom 证据不构成 DevTools、真机、无障碍或跨端支持。
