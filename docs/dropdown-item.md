# UDropdownItem component contract / UDropdownItem 组件契约

`UDropdownItem` has two mutually exclusive modes. Omitting `name` keeps the legacy finite-value item; explicitly supplying `name` enters registered options mode. An invalid explicit name remains inert and never falls back to legacy behavior.

`UDropdownItem` 有两种互斥模式。省略 `name` 时保持 legacy 有限值 item；显式传入 `name` 时进入注册 options 模式。显式非法 name 会保持 inert，绝不回退到 legacy 行为。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `value` | `string \| number` | `''` |
| `name` | `string \| number` | `undefined` |
| `label` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `modelValue` | `string \| number \| ReadonlyArray<string \| number>` | `''` |
| `options` | `ReadonlyArray<unknown>` | `[]` |
| `show` | `boolean` | `true` |

An independent legacy item emits only `select(value)`. Under a legacy parent, the order is parent `update:modelValue(value)`, parent `change(value)`, then child `select(value)`. Values are transparent strings or finite numbers and no command or navigation is executed.

独立 legacy item 只 emit `select(value)`。位于 legacy parent 下时，顺序为 parent `update:modelValue(value)`、parent `change(value)`、child `select(value)`。value 是透明字符串或有限数字，不会执行命令或导航。

Registered options mode requires a valid owning parent registration plus visible and enabled state. Missing parent, duplicate/non-owner name, hidden state, or invalid registration is inert. Option values may be strings, finite numbers, or arrays of those values; arrays use strict reference equality and are delivered unchanged. The first enabled strict-equal duplicate wins.

注册 options 模式要求有效的 owner parent registration，以及 visible、enabled 状态。缺失 parent、重复/non-owner name、hidden 状态或非法 registration 均保持 inert。option value 可以是字符串、有限数字或由这些值组成的数组；数组使用严格引用相等并原样交付。严格相等的重复项由首个 enabled 项胜出。

Selecting an enabled option emits child `update:modelValue(value)`, then parent `close(rawName)`, then child `change(value)`. An explicit click retains this sequence even when the selected value equals the current value. Trigger activation itself emits no event; activating the current trigger closes it through the parent.

选择 enabled option 时会依次 emit child `update:modelValue(value)`、parent `close(rawName)`、child `change(value)`。即使所选 value 与当前值相同，显式点击仍保留此顺序。trigger 激活本身不 emit 事件；激活当前 trigger 会通过 parent 将其关闭。

In legacy mode, the default slot replaces the label. In options mode, it replaces the complete active panel and receives no scoped business data. Name/show/disabled changes and unmount silently clear registration or active state; they never fabricate `close`.

在 legacy 模式中，默认 slot 替换 label。在 options 模式中，它替换完整 active panel，且不接收 scoped business data。name/show/disabled 变化及卸载会静默清除 registration 或 active state，绝不伪造 `close`。
