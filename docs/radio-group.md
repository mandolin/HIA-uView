# URadioGroup component contract / URadioGroup 组件契约

`URadioGroup` supplies one controlled local string/number selection context to slot-contained `URadio` children. It has no option array, default choice, form model, validator, request, persistence, router, picker, popup, or global state.

`URadioGroup` 向 slot 内 `URadio` 子项提供一个受控本地字符串/数字选择上下文。它没有 option 数组、默认选择、表单模型、validator、请求、持久化、router、picker、popup 或全局状态。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | Caller-owned selected value; only exact child `value` equality presents selected. / 调用方拥有的 selected value；仅精确等于 child `value` 才呈现 selected。 |
| `disabled` | `boolean` | `false` | Disables every group-context child without changing their caller text. / 禁用所有 group-context 子项而不改变调用方文字。 |

It emits `update:modelValue(nextValue)` and `change(nextValue)` when an enabled, not-currently-selected child selects itself. Both carry the same unmodified child value; the group writes no prop and does not interpret selection as completed work.

当启用且未被当前选中的子项选择自身时，它 emit `update:modelValue(nextValue)` 与 `change(nextValue)`。两者携带同一未修改 child value；group 不写 prop，也不把选择解释为完成工作。

The default slot is the only content surface. The group does not discover descendants outside its slot or register global radio instances.

默认 slot 是唯一内容面。group 不发现其 slot 外的后代，也不注册全局 radio 实例。
