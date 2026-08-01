# UBadge component contract / UBadge 组件契约

> Status / 状态：Private pre-release controlled text/dot badge.
> 状态：私有预发布受控文字/dot 徽标。

`UBadge` wraps a slot and presents caller `value` or a dot. `max` is display truncation only; the component reads no notification source, fetches no count, and creates no global service.

`UBadge` 包装 slot 并呈现调用方 `value` 或 dot。`max` 只负责显示截断；组件不读取通知源、不请求计数，也不创建全局服务。

The root namespace is `u-badge` and consumes `--u-comp-badge-*`. `tone`, `size`, `visible`, and `showZero` are finite presentation inputs, not business state.

根命名空间为 `u-badge`，消费 `--u-comp-badge-*`。`tone`、`size`、`visible` 和 `showZero` 是有限呈现输入，不是业务状态。
