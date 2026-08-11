# UNumberBox component contract / UNumberBox 组件契约

`UNumberBox` presents decrement, controlled numeric text, and increment controls. It owns finite numeric normalization only; units, currency, inventory, display/business precision policy, persistence, and business validation remain outside.

`UNumberBox` 呈现减少、受控数字文字和增加控件。它只拥有有限数值规整；单位、货币、库存、展示/业务精度策略、持久化和业务校验均在组件外部。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `number` | `0` |
| `min` / `max` | `number` | `0` / `999999` |
| `step` | `number` | `1` |
| `disabled` / `readonly` | `boolean` | `false` |

Finite reversed bounds are sorted into ascending order. If either bound is non-finite, every input path is disabled and emits nothing. Button stepping uses a positive finite `step`, otherwise `1`, and performs fixed-point decimal arithmetic with at most 15 fractional digits and safe-integer intermediates. Excess precision or unsafe arithmetic fails closed with zero events rather than falling back to ordinary floating-point math.

有限反向边界会按升序规整。任一边界为非有限值时，全部输入路径都会禁用且不 emit 事件。按钮 step 使用正有限 `step`，否则回退为 `1`，并以最多 15 位小数及安全整数中间值执行定点十进制运算。精度过高或运算不安全时会 fail closed 为零事件，而不会回退普通浮点运算。

Direct input accepts a finite number or a trimmed strict decimal/decimal-exponent string. Blank text, hexadecimal, boolean, and non-finite values are rejected. Direct input clamps only to the normalized bounds; it does not align to the button step grid.

直接输入接受有限 number，或 trim 后的严格十进制/十进制指数字符串。空白文字、十六进制、boolean 与非有限值会被拒绝。直接输入只 clamp 到规整后的边界，不会对齐按钮 step 网格。

A successful change emits `update:modelValue(value)`, then `input(value)`, then `change(value)`. Boundary/no-op candidates equal to the current value emit nothing. Both `disabled` and `readonly` are handler guards; readonly also marks the native input readonly and disables the buttons.

成功变更会依次 emit `update:modelValue(value)`、`input(value)` 与 `change(value)`。边界/no-op 候选值等于当前值时不 emit 事件。`disabled` 与 `readonly` 都是 handler guard；readonly 还会把原生 input 标记为 readonly 并禁用按钮。

The root namespace is `u-number-box` and consumes `--u-comp-number-box-*`. The component calls no keyboard, vibration, storage, request, or navigation API.

根命名空间为 `u-number-box`，消费 `--u-comp-number-box-*`。组件不调用键盘、震动、storage、请求或导航 API。
