# UTabs component contract / UTabs 组件契约

> Status / 状态：Private pre-release controlled tab strip. / 私有预发布受控标签栏。

`UTabs` renders caller-declared finite tabs. `items` has priority; migration `list` is used only when `items` is empty. An explicitly supplied `current` selects a valid finite index when numeric, otherwise it identifies a value; when absent, `modelValue` remains the selected value.

`UTabs` 呈现调用方声明的有限 tab。`items` 优先；只有 `items` 为空时才使用迁移 `list`。显式提供的 `current` 在为数字时选择合法有限索引，否则标识一个 value；缺失时仍由 `modelValue` 表示当前选中值。

An eligible click emits `update:modelValue(value)` and then `change(value)`. The component ref exposes bounded `clickTab(candidate)`: a number is interpreted only as an index, while a non-number is matched strictly as a value. Unknown, disabled, or already-current candidates emit nothing.

符合条件的点击会依次 emit `update:modelValue(value)` 与 `change(value)`。组件 ref 暴露受限 `clickTab(candidate)`：数字只按索引解释，非数字按 value 严格匹配。未知、disabled 或已经活动的候选不触发事件。

The component does not navigate, request, lazy-load, animate or measure scrolling, or manage hidden panels. Callers own panel content and every follow-up view.

组件不导航、不请求、不懒加载、不执行或测量滚动动画，也不管理隐藏 panel。panel 内容与全部后续视图由调用方拥有。
