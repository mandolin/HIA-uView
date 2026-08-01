# UScrollList component contract / UScrollList 组件契约

> Status / 状态：Private pre-release CSS overflow projection.
> 状态：私有预发布 CSS overflow 横向投影。

`UScrollList` presents finite caller `items` and default-slot content inside a local CSS `overflow-x` surface. Enabled items emit `select`; the component uses no WXS, BindingX, native plugin, DOM measurement, indicator synchronization, paging, request, or cache.

`UScrollList` 在局部 CSS `overflow-x` 表面中呈现调用方有限 `items` 和默认 slot 内容。启用 item emit `select`；组件不使用 WXS、BindingX、native plugin、DOM 测量、指示器同步、分页、请求或缓存。

The root namespace is `u-scroll-list` and consumes `--u-comp-scroll-list-*`. Target-platform overflow and accessibility behavior are not certified by this contract.

根命名空间为 `u-scroll-list`，消费 `--u-comp-scroll-list-*`。本文不认证目标平台 overflow 和无障碍行为。
