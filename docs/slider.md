# USlider component contract / USlider 组件契约

`USlider` projects bounded `min`/`max`/`step` and emits controlled numeric updates. It does not interpret the number as price, inventory, completion, or remote progress.

`USlider` 投影受限的 `min`/`max`/`step` 并 emit 受控数值更新。不把数值解释为价格、库存、完成度或远程进度。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `number` | `0` |
| `min` / `max` | `number` | `0` / `100` |
| `step` | `number` | `1` |
| `showValue` / `disabled` | `boolean` | `false` / `false` |

Consumes `--u-comp-slider-*`; platform slider accessibility requires target-profile verification. / 消费 `--u-comp-slider-*`；平台滑块无障碍需按目标 profile 验证。
