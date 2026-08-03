# UIndexAnchor component contract / UIndexAnchor 组件契约

> Status / 状态：Private pre-release caller-controlled index anchor.
> 状态：私有预发布调用方受控索引锚点。

`UIndexAnchor` presents one caller-provided `label`/`value` as a finite local selection control. `active` is caller state only; `select` reports intent and never scrolls, measures an anchor, or updates caller state.

`UIndexAnchor` 将一个调用方提供的 `label`/`value` 呈现为有限本地选择控件。`active` 仅是调用方状态；`select` 报告意图，绝不滚动、测量锚点或更新调用方状态。

The root namespace is `u-index-anchor` and consumes `--u-comp-index-anchor-*`. It has no default alphabet, location, or domain grouping.

根命名空间为 `u-index-anchor`，消费 `--u-comp-index-anchor-*`。它没有默认字母表、地点或领域分组。
