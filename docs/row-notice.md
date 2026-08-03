# URowNotice component contract / URowNotice 组件契约

> Status / 状态：Private pre-release controlled horizontal notice projection.
> 状态：私有预发布受控横向 notice 投影。

`URowNotice` displays the caller-selected item from finite `items` at `activeIndex` and reports a local `select` intent. Layout is horizontal only; it is not a marquee or animation service.

`URowNotice` 显示有限 `items` 中由调用方 `activeIndex` 选择的项目，并报告本地 `select` 意图。布局仅是横向；它不是 marquee 或动画服务。

It does not rotate, time, fetch, measure, or provide default user-facing copy. The root namespace is `u-row-notice` and consumes `--u-comp-row-notice-*`.

它不轮播、不计时、不获取、不测量，也不提供默认用户可见文案。根命名空间为 `u-row-notice`，消费 `--u-comp-row-notice-*`。
