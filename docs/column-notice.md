# UColumnNotice component contract / UColumnNotice 组件契约

> Status / 状态：Private pre-release controlled vertical notice projection.
> 状态：私有预发布受控纵向 notice 投影。

`UColumnNotice` selects one caller-owned item from finite `items` using `activeIndex` and emits only a local `select` intent. The caller owns copy, data, index changes, and any rotation policy.

`UColumnNotice` 通过 `activeIndex` 从有限 `items` 中选择一个调用方拥有的项目，并且只发出本地 `select` 意图。调用方拥有文字、数据、索引变化与任何轮播策略。

It has no timer, auto-rotation, remote notice source, scroll measurement, or default user-facing copy. Its root namespace is `u-column-notice` and it consumes `--u-comp-column-notice-*`.

它没有计时器、自动轮播、远程 notice 来源、滚动测量或默认用户可见文案。根命名空间为 `u-column-notice`，消费 `--u-comp-column-notice-*`。
