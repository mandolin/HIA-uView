# UActionSheet component contract / UActionSheet 组件契约

> Status / 状态：Private pre-release caller-declared local action sheet.
> 状态：私有预发布调用方声明的局部操作 sheet。

`UActionSheet` renders finite `items` with caller-owned `visible`, `title`, and optional `cancelText`. It emits `select` and `close` intent only; it executes no command, navigation, permission check, async provider, or global service.

`UActionSheet` 呈现由调用方拥有 `visible`、`title` 和可选 `cancelText` 的有限 `items`。它只 emit `select` 与 `close` 意图；不执行命令、导航、权限判断、异步 provider 或全局服务。

The root namespace is `u-action-sheet` and consumes `--u-comp-action-sheet-*`. Mask closing is opt-in through `maskClosable`; the caller controls any follow-up state.

根命名空间为 `u-action-sheet`，消费 `--u-comp-action-sheet-*`。遮罩关闭必须通过 `maskClosable` 显式开启；任何后续状态仍由调用方拥有。
