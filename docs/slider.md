# USlider component contract / USlider 组件契约

`USlider` projects a caller-controlled native slider onto a bounded, minimum-relative decimal step grid. It does not interpret the number as price, inventory, completion, or remote progress.

`USlider` 把调用方受控的原生 slider 投影到受边界保护、相对 min 的十进制 step 网格。不把数值解释为价格、库存、完成度或远端进度。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `number` | `0` |
| `min` / `max` | `number` | `0` / `100` |
| `step` | `number` | `1` |
| `showValue` / `disabled` | `boolean` | `false` / `false` |

A non-finite `min` falls back to `0`; a non-finite `max` falls back to `max(min, 100)`. A finite reversed range collapses at `min` rather than swapping bounds. A nonpositive or non-finite `step` falls back to `1`.

非有限 `min` 回退为 `0`；非有限 `max` 回退为 `max(min, 100)`。有限反向范围会折叠到 `min`，而不是交换边界。非正或非有限 `step` 回退为 `1`。

Both model presentation and emitted changes use the nearest complete `min + N × step` point after clamping. When `max` is off-grid, the last complete step is the highest reachable value. Arithmetic uses at most 15 decimal places and safe-integer intermediates; an unsafe grid presents the safe minimum and emits no corrective event.

model 呈现与 emit 变更都会在 clamp 后使用最近的完整 `min + N × step` 点。`max` 不在网格上时，最后一个完整 step 是最高可达值。运算最多使用 15 位小数及安全整数中间值；不安全网格会呈现安全 min，且不 emit 修正事件。

The native payload reads `detail.value` first and falls back to `target.value` only when missing. It accepts a finite number or strict decimal/decimal-exponent string. Missing, blank, boolean, hexadecimal, `NaN`, `Infinity`, disabled, or unsafe input emits nothing. A valid interaction emits `update:modelValue(value)` and then `change(value)`.

原生 payload 优先读取 `detail.value`，仅在缺失时回退到 `target.value`。它接受有限 number 或严格十进制/十进制指数字符串。缺失、空白、boolean、十六进制、`NaN`、`Infinity`、disabled 或不安全输入均不 emit 事件。有效交互依次 emit `update:modelValue(value)` 与 `change(value)`。

The default slot is retained. Styling consumes `--u-comp-slider-*`; the `target.value` fallback is not an H5 support claim, and platform slider accessibility requires target-profile verification.

默认 slot 继续保留。样式消费 `--u-comp-slider-*`；`target.value` 回退不构成 H5 支持声明，平台 slider 无障碍能力需按目标 profile 验证。
