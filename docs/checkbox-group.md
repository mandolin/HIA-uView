# UCheckboxGroup component contract / UCheckboxGroup 组件契约

`UCheckboxGroup` supplies controlled membership context to slot-contained `UCheckbox` children. It accepts `modelValue: string[]` (default `[]`) and `disabled: boolean` (default `false`). The caller owns the array and every follow-up decision.

`UCheckboxGroup` 向 slot 内 `UCheckbox` 子项提供受控成员关系上下文。它接受 `modelValue: string[]`（默认 `[]`）与 `disabled: boolean`（默认 `false`）。调用方拥有数组及每个后续决策。

When an enabled child changes, the group creates a new string array: add the exact value once when checked, or remove every exact occurrence when unchecked. It emits the new array through both `update:modelValue(nextValues)` and `change(nextValues)`. It never mutates `modelValue`, sorts values, creates defaults, validates counts, persists data, or treats membership as permission or completion.

当启用子项 change 时，group 创建一个新字符串数组：checked 时仅添加该精确 value 一次，unchecked 时移除全部精确出现。它通过 `update:modelValue(nextValues)` 与 `change(nextValues)` emit 新数组。它绝不 mutate `modelValue`、排序 value、创建默认值、校验数量、持久化数据，或把成员关系当作权限或完成结论。

The default slot is the only content surface. No select-all, inverse selection, indeterminate state, option data source, native picker, popup, global registry, router, network, storage, image, icon, font, device, or cross-platform capability is included.

默认 slot 是唯一内容面。不包含全选、反选、不确定状态、option data source、native picker、popup、全局 registry、router、网络、storage、图片、图标、字体、真机或跨端能力。
