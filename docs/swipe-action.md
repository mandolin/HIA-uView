# USwipeAction component contract / USwipeAction 组件契约

`USwipeAction` projects explicit finite action buttons when caller-controlled `open` or migration `show` is true and emits `click`, `action`, `close`, and `update:open`. An explicitly supplied `open` wins; otherwise `show` is used. Existing `actions` wins when non-empty; migration `options` is projected only when `actions` is empty. An option may use `label` or migration `text`; all action meaning remains caller-owned. It intentionally uses no native gesture, transform, timer, deletion, or persistence.

`USwipeAction` 在调用方受控 `open` 或迁移 `show` 为真时呈现有限显式 action 按钮，并 emit `click`、`action`、`close` 和 `update:open`。显式提供的 `open` 优先；否则使用 `show`。既有 `actions` 非空时优先；仅在 `actions` 为空时投影迁移 `options`。option 可以使用 `label` 或迁移 `text`；全部 action 含义仍由调用方拥有。刻意不使用原生手势、transform、定时器、删除或持久化。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `open` | `boolean` | `false` |
| `show` | `boolean` | `false` |
| `actions` | `unknown[]` | `[]` |
| `options` | `unknown[]` | `[]` |
| `closeText` | `string` | `Close / 关闭` |
| `disabled` | `boolean` | `false` |

Consumes `--u-comp-swipe-action-*`; caller owns action meaning. / 消费 `--u-comp-swipe-action-*`；action 含义由调用方拥有。
