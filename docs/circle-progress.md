# UCircleProgress component contract / UCircleProgress 组件契约

> Status / 状态：Private pre-release caller-controlled numeric ring.
> 状态：私有预发布调用方受控数值圆环。

`UCircleProgress` clamps caller `value` within a positive `max`, projects its rounded percentage, and optionally renders caller `label` or slot content. It does not interpret a task, animate, start a timer, or use Canvas.

`UCircleProgress` 将调用方 `value` 限制在正数 `max` 内，投影其四舍五入百分比，并可呈现调用方 `label` 或 slot 内容。它不解释任务、不动画、不启动计时器，也不使用 Canvas。

The root namespace is `u-circle-progress` and consumes `--u-comp-circle-progress-*`. The CSS arc is progressive enhancement; numeric text and context must remain available where it is unsupported.

根命名空间为 `u-circle-progress`，消费 `--u-comp-circle-progress-*`。CSS 弧线属于渐进增强；不支持时数值文字和上下文仍必须可用。
