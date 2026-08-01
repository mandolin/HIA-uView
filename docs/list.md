# UList component contract / UList 组件契约

> Status / 状态：Private pre-release caller-owned finite list.
> 状态：私有预发布调用方拥有的有限列表。

`UList` presents caller-declared finite `items` rows and an optional default slot. Each enabled row emits `select` with `{ value, index }`; the component does not request, cache, virtualize, paginate, or trigger automatic loading.

`UList` 呈现调用方声明的有限 `items` 行和可选默认 slot。启用行 emit `{ value, index }` 的 `select`；组件不请求、不缓存、不虚拟化、不分页，也不自动加载。

The root namespace is `u-list` and consumes `--u-comp-list-*`. Platform scroll/list behavior, remote-source trust, and accessibility-tree support remain caller and target responsibilities.

根命名空间为 `u-list`，消费 `--u-comp-list-*`。平台滚动/列表行为、远程源可信决策和无障碍树支持仍由调用方与目标平台负责。
