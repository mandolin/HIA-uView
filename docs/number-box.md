# UNumberBox component contract / UNumberBox 组件契约

> Status / 状态：Private pre-release, bounded local numeric interaction only.
> 状态：私有预发布，仅提供受边界保护的本地数值交互。

`UNumberBox` presents decrement, controlled numeric text, and increment controls. It applies only finite `min`/`max`/`step` geometry; units, currency, inventory, precision, persistence, and business validation remain outside.

`UNumberBox` 呈现减少、受控数字文字和增加控件。它只应用有限的 `min`/`max`/`step` 几何规则；单位、货币、库存、精度、持久化和业务校验均在组件外部。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `number` | `0` |
| `min` / `max` | `number` | `0` / `999999` |
| `step` | `number` | `1` |
| `disabled` / `readonly` | `boolean` | `false` |

The component emits `update:modelValue`, `input`, and `change` with a finite bounded candidate. Direct text input that cannot be confirmed as a finite number emits nothing.

组件通过 `update:modelValue`、`input` 和 `change` 回传有限且受边界保护的候选值。无法确认是有限数字的直接文字输入不触发事件。

The root namespace is `u-number-box`; styling consumes `--u-comp-number-box-*`. The component does not call keyboard, vibration, storage, request, or navigation APIs.

根命名空间为 `u-number-box`，样式消费 `--u-comp-number-box-*`。组件不调用键盘、震动、存储、请求或导航 API。
