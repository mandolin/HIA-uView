# UIndexList component contract / UIndexList 组件契约

> Status / 状态：Private pre-release caller-controlled index-group projection.
> 状态：私有预发布调用方受控索引组投影。

`UIndexList` normalizes a finite caller `groups` array into local anchor controls and exposes its content through the default slot. The caller owns `activeValue`, data, and any actual scrolling; `select` reports only a local group candidate.

`UIndexList` 将有限调用方 `groups` 数组规范化为本地锚点控件，并通过默认 slot 暴露其内容。调用方拥有 `activeValue`、数据和任何实际滚动；`select` 只报告本地组候选。

The root namespace is `u-index-list` and consumes `--u-comp-index-list-*`. It does not observe visibility, find anchors, or operate `scroll-view`.

根命名空间为 `u-index-list`，消费 `--u-comp-index-list-*`。它不观察可见性、不查找锚点，也不操作 `scroll-view`。
