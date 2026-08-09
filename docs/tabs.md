# UTabs component contract / UTabs 组件契约

> Status / 状态：Private pre-release controlled tab strip.
> 状态：私有预发布受控标签栏。

`UTabs` renders caller-declared finite `items` and controlled `modelValue`, emitting `update:modelValue` and `change`. For constrained uView-family migration, `list` is used only when `items` is empty; an explicitly supplied `current` selects by finite list index when possible, otherwise by its identifying value. An absent `current` never overrides `modelValue`. It does not navigate, request, lazy-load, animate scrolling, measure content, or manage hidden panels.

`UTabs` 呈现调用方声明的有限 `items` 和受控 `modelValue`，并 emit `update:modelValue` 与 `change`。对于受限的 uView 系列迁移，`list` 只在 `items` 为空时使用；显式提供的 `current` 会在可能时按有限列表索引选择，否则按其标识值选择。缺失的 `current` 绝不覆盖 `modelValue`。它不导航、不请求、不懒加载、不执行滚动动画、不测量内容，也不管理隐藏面板。

`change` still reports the selected HIA value. It is not a complete upstream payload, lifecycle, scroll, or panel-visibility compatibility layer.

`change` 仍报告被选择的 HIA value；它不是完整上游 payload、生命周期、滚动或面板可见性兼容层。

The root namespace is `u-tabs` and consumes `--u-comp-tabs-*`. The caller owns panel content and any follow-up view.

根命名空间为 `u-tabs`，消费 `--u-comp-tabs-*`。面板内容和任何后续视图仍由调用方拥有。
