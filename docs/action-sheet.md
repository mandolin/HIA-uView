# UActionSheet component contract / UActionSheet 组件契约

> Status / 状态：Private pre-release caller-controlled local action sheet. / 私有预发布调用方受控局部操作 sheet。

`UActionSheet` renders caller-owned `visible` or migration `modelValue`, optional title/default-slot content, finite `items`, and optional cancel text. An explicitly supplied `visible` wins. Each item keeps only a visible `label`/`text`, transparent `value`, and `disabled` state; callback, URL, command, and business fields are never executed.

`UActionSheet` 呈现调用方拥有的 `visible` 或迁移 `modelValue`、可选标题/默认 slot 内容、有限 `items` 与可选取消文字。显式提供的 `visible` 优先。每个 item 只保留可见 `label`/`text`、透明 `value` 与 `disabled` 状态；绝不执行 callback、URL、command 或业务字段。

An eligible item emits `select({ value, index })` and then migration `click(index)` without closing the sheet. An eligible cancel, opt-in mask close, or component-ref `close()` emits `update:modelValue(false)` and then `close(rawEvent, reason)`, where `reason` is `cancel`, `mask`, or `programmatic`. The caller owns every writeback and follow-up action.

符合条件的 item 会依次 emit `select({ value, index })` 与迁移事件 `click(index)`，但不会关闭 sheet。符合条件的取消、显式开启的遮罩关闭或组件 ref `close()` 会依次 emit `update:modelValue(false)` 与 `close(rawEvent, reason)`；`reason` 为 `cancel`、`mask` 或 `programmatic`。全部写回和后续 action 都由调用方拥有。

The component creates no portal, router, permission check, async provider, command executor, or global service. The root namespace is `u-action-sheet` and consumes `--u-comp-action-sheet-*`.

组件不创建 portal、router、权限判断、异步 provider、命令执行器或全局服务。根命名空间为 `u-action-sheet`，消费 `--u-comp-action-sheet-*`。
