# USkeleton component contract / USkeleton 组件契约

> Status / 状态：Private pre-release static skeleton projection.
> 状态：私有预发布静态骨架占位投影。

`USkeleton` renders bounded static title, avatar, and row placeholders while `loading` is true, and renders its default slot otherwise. It performs no animation, DOM measurement, request waiting, data reading, or layout inference.

`USkeleton` 在 `loading` 为真时呈现受边界保护的静态标题、头像和行占位，否则呈现默认 slot。它不播放动画、不测量 DOM、不等待请求、不读取数据，也不推断布局。

The root namespace is `u-skeleton` and consumes `--u-comp-skeleton-*`. The caller owns the loading decision and the real content lifecycle.

根命名空间为 `u-skeleton`，消费 `--u-comp-skeleton-*`。loading 决策和真实内容生命周期由调用方拥有。
