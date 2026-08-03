# UTable component contract / UTable 组件契约

> Status / 状态：Private pre-release view-based table container.
> 状态：私有预发布 view-based 表格容器。

`UTable` provides a bounded `view` container for caller-composed `UTr`, `UTh`, and `UTd` slots. It accepts only `bordered` and an optional accessible label; callers own all data, rows, columns, and domain table semantics.

`UTable` 为调用方组合的 `UTr`、`UTh` 和 `UTd` slot 提供受限 `view` 容器。它只接受 `bordered` 和可选可访问标签；调用方拥有所有数据、行、列和领域表格语义。

The root namespace is `u-table` and consumes `--u-comp-table-*`. Its `table` role is a discoverability marker, not a promise of native HTML table, Mini Program, or screen-reader behavior.

根命名空间为 `u-table`，消费 `--u-comp-table-*`。其 `table` role 是可发现性标记，不承诺原生 HTML table、小程序或读屏行为。
