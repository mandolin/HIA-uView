# URow component contract / URow 组件契约

> Status / 状态：Private pre-release flex-row layout primitive.
> 状态：私有预发布 flex 行布局原语。

`URow` arranges its default slot using bounded `gutter`, `wrap`, `align`, and `justify` values. It emits no events, measures no DOM, and owns no child or page semantics.

`URow` 使用受限的 `gutter`、`wrap`、`align`、`justify` 排列默认插槽。不 emit 事件、不测量 DOM，也不拥有子项或页面语义。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `gutter` | `number` (0–64px) | `0` |
| `wrap` | `boolean` | `true` |
| `align` / `justify` | finite flex values / 有限 flex 值 | `stretch` / `flex-start` |

The default slot is the only content surface. / 默认插槽是唯一内容入口。
