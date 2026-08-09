# USteps component contract / USteps 组件契约

> Status / 状态：Private pre-release declarative finite step sequence.
> 状态：私有预发布声明式有限步骤序列。

`USteps` renders caller-declared `steps`, finite `status`, `current`, and `direction`. It owns no flow lifecycle, automatic advancement, submission, request, or business state machine.

`USteps` 呈现调用方声明的 `steps`、有限 `status`、`current` 和 `direction`。它不拥有流程生命周期、自动推进、提交、请求或业务状态机。

The root namespace is `u-steps` and consumes `--u-comp-steps-*`. Status is presentation input, not a conclusion about a real process.

根命名空间为 `u-steps`，消费 `--u-comp-steps-*`。status 只是呈现输入，不是对真实流程的结论。

In vertical direction, the connector remains aligned beneath the finite status marker and does not consume horizontal content width.

在纵向模式下，连接线始终对齐在有限状态圆点下方，不占用横向正文宽度。
