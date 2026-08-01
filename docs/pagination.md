# UPagination component contract / UPagination 组件契约

> Status / 状态：Private pre-release controlled finite page selector.
> 状态：私有预发布受控有限页码选择器。

`UPagination` accepts caller-computed `pageCount` and controlled `current`, then emits `update:current` and `change`. It does not request, cache, read remote totals, manage cursor/offset, or implement business pagination.

`UPagination` 接收调用方计算的 `pageCount` 和受控 `current`，并 emit `update:current` 与 `change`。它不请求、不缓存、不读取远程 total、不管理 cursor/offset，也不实现业务分页策略。

The root namespace is `u-pagination` and consumes `--u-comp-pagination-*`. Page count is bounded for presentation only; the caller owns data and query behavior.

根命名空间为 `u-pagination`，消费 `--u-comp-pagination-*`。页数上限只服务呈现边界；数据和查询行为仍由调用方拥有。
