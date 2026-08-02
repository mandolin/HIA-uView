# UCol component contract / UCol 组件契约

> Status / 状态：Private pre-release 24-grid column primitive.
> 状态：私有预发布 24 栅格列布局原语。

`UCol` projects bounded `span`, `offset`, `align`, and `justify` values and emits local `click`. It measures no row or DOM and owns no navigation.

`UCol` 投影受限的 `span`、`offset`、`align` 与 `justify`，并 emit 局部 `click`。它不测量 row 或 DOM，也不拥有导航。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `span` | `number` (1–24) | `24` |
| `offset` | `number` (0–23) | `0` |
| `align` / `justify` | finite flex values / 有限 flex 值 | `stretch` / `flex-start` |

The default slot is the only content surface. / 默认插槽是唯一内容入口。
