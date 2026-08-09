# UPagination component contract / UPagination 组件契约

> Status / 状态：Private pre-release controlled finite page selector.
> 状态：私有预发布受控有限页码选择器。

`UPagination` accepts caller-computed `pageCount` and controlled `current`, then emits `update:current` and `change`. It also offers constrained uView-family migration inputs: `modelValue` (`number`, default `1`), `pageSize` (`number`, default `10`), and optional `total` (`number`, no default). It does not request, cache, read remote totals, manage cursor/offset, or implement business pagination.

`UPagination` 接收调用方计算的 `pageCount` 和受控 `current`，并 emit `update:current` 与 `change`。它还提供受限的 uView 系列迁移输入：`modelValue`（`number`，默认 `1`）、`pageSize`（`number`，默认 `10`）和可选 `total`（`number`，无默认值）。它不请求、不缓存、不读取远程 total、不管理 cursor/offset，也不实现业务分页策略。

When explicit HIA `current`/`pageCount` is supplied, it takes precedence. Otherwise, `modelValue` selects the page and a positive finite `total`/`pageSize` derives the displayed count. Missing, zero, negative, or non-finite totals project one page without being interpreted as a request failure. A page change emits both `update:current` and `update:modelValue` with the candidate page, plus the existing `change` value; callers choose the binding they own.

显式提供 HIA `current`/`pageCount` 时，它们优先。否则，`modelValue` 选择当前页，正的有限 `total`/`pageSize` 推导展示页数。缺失、零、负数或非有限 total 都投影为一页，不会被解释为请求失败。页码变化会以候选页同时 emit `update:current` 和 `update:modelValue`，并保留既有 `change` value；调用方选择自己拥有的绑定。

The default slot may replace only the local current-page/total-page summary. Previous, numbered, and next controls remain component-owned presentation; the slot has no query, cursor, data, or state-writeback contract.

默认 slot 只能替换局部当前页/总页数摘要。上一页、数字页和下一页 control 仍是组件自有的呈现；该 slot 没有查询、cursor、数据或状态写回契约。

The root namespace is `u-pagination` and consumes `--u-comp-pagination-*`. Page count is bounded for presentation only; the caller owns data and query behavior.

根命名空间为 `u-pagination`，消费 `--u-comp-pagination-*`。页数上限只服务呈现边界；数据和查询行为仍由调用方拥有。
