# UCheckboxGroup component contract / UCheckboxGroup 组件契约

`UCheckboxGroup` supplies controlled string/number membership context to slot-contained `UCheckbox` children. Its runtime array shape is `Array<string | number>`; the public declaration accepts the equivalent readonly view. The caller owns the source array and every follow-up decision.

`UCheckboxGroup` 向 slot 内的 `UCheckbox` 子项提供受控字符串/数字成员关系 context。来源数组及全部后续决定均由调用方拥有。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `ReadonlyArray<string \| number>` | `[]` | Caller-owned exact-membership source. / 调用方拥有的精确成员关系来源。 |
| `disabled` | `boolean` | `false` | Disables every group-context child. / 禁用所有 group-context 子项。 |
| `labelDisabled` | `boolean` | `false` | Blocks child label activation without disabling marker/root controls. / 阻止子项标签激活，但不禁用 marker/root control。 |
| `max` | `number \| string` | `0` | Only a parseable positive integer limits additions. / 只有可解析的正整数才限制新增。 |

For `max`, a string is trimmed before numeric conversion. Blank strings, nonpositive values, fractions, and non-finite values mean unlimited. Reaching the limit blocks only a new unique member and emits nothing; removing an existing member is always allowed.

对于 `max`，字符串会先 trim 再转换为数字。空白字符串、非正数、小数及非有限值均表示无限制。达到上限后，只会阻止新增唯一成员并保持零事件；移除已有成员始终允许。

An enabled change creates a new array. Selection appends the exact value once after de-duplicating membership; deselection removes every strictly equal occurrence. The group emits the same new array reference through `update:modelValue(nextValues)` and then `change(nextValues)`. It never mutates or sorts the caller array, creates a default selection, or treats membership as permission or completion.

启用状态下的变更会创建新数组。选中时先去重成员关系，再把精确 value 追加一次；取消时移除全部严格相等的出现项。group 先通过 `update:modelValue(nextValues)`、再通过 `change(nextValues)` emit 同一个新数组引用。它绝不修改或排序调用方数组、创建默认选择，也不把成员关系解释为权限或完成结论。

The default slot is the only content surface. No select-all, inverse selection, indeterminate state, option source, native picker, popup, global registry, router, network, storage, asset, device, or cross-platform capability is included.

默认 slot 是唯一内容面。不包含全选、反选、不确定状态、option source、native picker、popup、全局 registry、router、网络、storage、资产、真机或跨端能力。
