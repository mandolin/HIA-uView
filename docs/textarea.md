# UTextarea component contract / UTextarea 组件契约

> Status / 状态：Private pre-release controlled multiline-input contract with standalone and form-composed runtime coverage.
> 具有独立与表单组合 runtime 覆盖的私有预发布受控多行输入契约。

`UTextarea` reports caller-owned multiline editing intent and finite native presentation options. It owns no hidden draft, rule, quota, submission, storage, request, or business formatting.

`UTextarea` 报告调用方拥有的多行编辑意图，并提供有限原生呈现选项。它不拥有隐藏草稿、规则、配额、提交、存储、请求或业务格式化。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Controlled multiline value. / 受控多行值。 |
| `placeholder` | `string` | `''` | Caller-owned hint, not a visible label. / 调用方拥有的提示，不是可见标签。 |
| `disabled` / `readonly` | `boolean` | `false` / `false` | Local guards OR-combined with the nearest `UFormItem`. / 与最近 `UFormItem` 按 OR 合并的局部 guard。 |
| `maxlength` | `number` | `140` | Passed to the native surface; the component does not truncate or rewrite. / 传给原生表面；组件不截断或重写。 |
| `autoHeight` / `focus` | `boolean` | `false` / `false` | Caller-controlled native presentation switches. / 调用方控制的原生呈现开关。 |
| `showCount` | `boolean` | `false` | Shows a neutral character count; it is not validation or remaining quota. / 显示中性字符计数；它不是校验或剩余配额。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `update:modelValue` | `value: string` | First value intent for an accepted input. / 被接受输入的首个值意图。 |
| `input` / `change` | `value: string` | The same unmodified candidate, in that order. `change` does not imply blur or completion. / 按顺序触发同一未经修改候选值；`change` 不表示失焦或完成。 |
| `focus` / `blur` | platform event / 平台事件 | Original observation while enabled. / 启用状态的原始观察。 |
| `confirm` | platform event / 平台事件 | Original confirm observation, not submission. / 原始确认观察，不是提交。 |
| `click` | none / 无 | Enabled local click with no payload. / 启用状态且无 payload 的局部点击。 |

Only string `detail.value` or `target.value` candidates are accepted. A malformed event emits nothing. Effective `disabled` suppresses every event. Effective `readonly` blocks `update:modelValue`, `input`, and `change`, while allowing actual focus, blur, confirm, and click observations.

只接受字符串形式的 `detail.value` 或 `target.value` 候选。畸形事件保持零事件。有效 `disabled` 抑制全部事件。有效 `readonly` 阻止 `update:modelValue`、`input` 与 `change`，同时允许实际发生的 focus、blur、confirm 与 click 观察。

Inside the nearest `UFormItem`, an accepted edit emits all three value events, waits for caller writeback, and notifies matching `change` rules. Enabled blur similarly notifies matching `blur` rules after the caller receives the event. The component uses no timer, debounce, trim, request, or implicit submit.

位于最近 `UFormItem` 内时，被接受的编辑会触发三个值事件、等待调用方写回，并通知匹配的 `change` 规则。启用状态的 blur 也会在调用方收到事件后通知匹配的 `blur` 规则。组件不使用 timer、防抖、trim、请求或隐式提交。

The root namespace is `u-textarea` and consumes `--u-comp-textarea-*`. Compose a meaningful visible label through `UFormItem` or `UField`; placeholder alone is insufficient. WCAG 2.2 AA remains the controllable visual target, while keyboard, screen-reader, accessibility-tree, IME, DevTools, and device behavior require platform verification.

根命名空间为 `u-textarea`，消费 `--u-comp-textarea-*`。应通过 `UFormItem` 或 `UField` 组合有意义的可见标签；仅有 placeholder 并不足够。WCAG 2.2 AA 仍是可控视觉目标，而键盘、读屏、无障碍树、输入法、开发者工具与真机行为需要平台验证。
