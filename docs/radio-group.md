# URadioGroup component contract / URadioGroup 组件契约

`URadioGroup` supplies one caller-controlled string/number selection context to slot-contained `URadio` children.

`URadioGroup` 向 slot 内的 `URadio` 子项提供一个由调用方受控的字符串/数字选择 context。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | Caller-owned selected value; only strict child-value equality presents selected. / 调用方拥有的 selected value；仅与 child value 严格相等时呈现 selected。 |
| `disabled` | `boolean` | `false` | Disables every group-context child. / 禁用所有 group-context 子项。 |
| `labelDisabled` | `boolean` | `false` | Blocks child label activation without disabling marker/root controls. / 阻止子项标签激活，但不禁用 marker/root control。 |

When an enabled, non-current child selects itself, the group emits `update:modelValue(nextValue)` and then `change(nextValue)` with the same unmodified value. Selecting the current value, child/group disabled interaction, or a label guarded by child/group `labelDisabled` emits nothing. The group never writes the prop or interprets selection as completed work.

当启用且非当前值的子项选择自身时，group 会依次 emit `update:modelValue(nextValue)` 与 `change(nextValue)`，两者携带同一个未转换值。选择当前值、child/group disabled 交互，或受 child/group `labelDisabled` 保护的标签交互，均不 emit 事件。group 不写入 prop，也不把选择解释为完成工作。

The default slot is the only content surface. There is no option array, default choice, form model, validator, request, persistence, router, picker, popup, descendant discovery outside the slot, or global radio registry.

默认 slot 是唯一内容面。不存在 option 数组、默认选择、表单模型、validator、请求、持久化、router、picker、popup、slot 外后代发现或全局 radio registry。
