# UPicker component contract / UPicker 组件契约

> Status / 状态：Private pre-release controlled finite single-column picker.
> 状态：私有预发布受控有限单列选择器。

`UPicker` normalizes primitive values or `{ label, value, disabled }` objects, keeps a local draft, and emits `update:modelValue`, `confirm`, and `cancel`. It does not own a popup, request, route, or identity session.

`UPicker` 规范化原始值或 `{ label, value, disabled }` 对象，维护本地草稿并 emit `update:modelValue`、`confirm`、`cancel`。它不拥有浮层、请求、路由或身份会话。

Migration boundary: upstream `u-picker` uses `modelValue` for popup visibility and complex region/time/column state. This contract uses it only for a finite single-column selected value. The shared event names are therefore mapped, not API-compatible; do not pass upstream visibility, region, time, or multi-column state to this component.

迁移边界：上游 `u-picker` 用 `modelValue` 表示浮层可见性以及复杂地区/时间/列状态；本契约只用它表示有限单列的选中值。因此同名事件只是 mapped 而非 API-compatible；不得把上游可见性、地区、时间或多列状态传给本组件。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `string \| number` | `''` |
| `columns` | `unknown[]` | `[]` |
| `title` | `string` | `''` |
| `confirmText` / `cancelText` | `string` | bilingual defaults / 双语默认值 |
| `disabled` | `boolean` | `false` |

Consumes `--u-comp-picker-*`; outer popup and persistence are caller-owned. / 消费 `--u-comp-picker-*`；外层浮层和持久化由调用方拥有。
