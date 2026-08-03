# UWaterfall component contract / UWaterfall 组件契约

> Status / 状态：Private pre-release deterministic finite-column projection.
> 状态：私有预发布确定性有限列投影。

`UWaterfall` distributes finite caller items across one to four columns by stable round robin. Each enabled card reports `select` with its transparent item/index/column candidate; callers own data, layout intent, and all follow-up actions.

`UWaterfall` 将有限调用方项目通过稳定 round robin 分配到一至四列。每张已启用卡片以透明的 item/index/column 候选报告 `select`；调用方拥有数据、布局意图及所有后续动作。

The root namespace is `u-waterfall` and consumes `--u-comp-waterfall-*`. It does not measure heights, balance columns by image size, reflow after resources, or fetch more items.

根命名空间为 `u-waterfall`，消费 `--u-comp-waterfall-*`。它不测量高度、不按图片尺寸平衡列、不在资源后重排，也不获取更多项目。
