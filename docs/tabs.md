# UTabs component contract / UTabs 组件契约

> Status / 状态：Private pre-release controlled tab strip.
> 状态：私有预发布受控标签栏。

`UTabs` renders caller-declared finite `items` and controlled `modelValue`, emitting `update:modelValue` and `change`. It does not navigate, request, lazy-load, animate scrolling, measure content, or manage hidden panels.

`UTabs` 呈现调用方声明的有限 `items` 和受控 `modelValue`，并 emit `update:modelValue` 与 `change`。它不导航、不请求、不懒加载、不执行滚动动画、不测量内容，也不管理隐藏面板。

The root namespace is `u-tabs` and consumes `--u-comp-tabs-*`. The caller owns panel content and any follow-up view.

根命名空间为 `u-tabs`，消费 `--u-comp-tabs-*`。面板内容和任何后续视图仍由调用方拥有。
