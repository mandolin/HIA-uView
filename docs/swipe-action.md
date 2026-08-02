# USwipeAction component contract / USwipeAction 组件契约

`USwipeAction` projects explicit finite action buttons when `open` and emits `action`, `close`, and `update:open`. It intentionally uses no native gesture, transform, timer, deletion, or persistence.

`USwipeAction` 在 `open` 时呈现有限显式 action 按钮，并 emit `action`、`close`、`update:open`。刻意不使用原生手势、transform、定时器、删除或持久化。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `open` | `boolean` | `false` |
| `actions` | `unknown[]` | `[]` |
| `closeText` | `string` | `Close / 关闭` |
| `disabled` | `boolean` | `false` |

Consumes `--u-comp-swipe-action-*`; caller owns action meaning. / 消费 `--u-comp-swipe-action-*`；action 含义由调用方拥有。
