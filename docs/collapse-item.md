# UCollapseItem component contract / UCollapseItem 组件契约

> Status / 状态：Private pre-release controlled disclosure item.
> 状态：私有预发布受控折叠子项。

`UCollapseItem` presents `title`, optional `description`, and a default slot. Inside `UCollapse` it uses the local context and reports `toggle`; outside a parent it reads caller-owned `open` and emits `update:open`. It uses no transition, animation, timer, icon registry, or command execution.

`UCollapseItem` 呈现 `title`、可选 `description` 和默认 slot。在 `UCollapse` 内使用局部 context 并 emit `toggle`；脱离父组件时读取调用方拥有的 `open` 并 emit `update:open`。它不使用 transition、animation、timer、icon registry，也不执行命令。

The root namespace is `u-collapse-item` and consumes `--u-comp-collapse-item-*`. The caller owns item names and open-value writeback.

根命名空间为 `u-collapse-item`，消费 `--u-comp-collapse-item-*`。item 名称和展开值写回由调用方拥有。
