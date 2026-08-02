# UAlertTips component contract / UAlertTips 组件契约

> Status / 状态：Private pre-release, caller-controlled alert presentation.
> 状态：私有预发布、调用方控制的提示呈现。

`UAlertTips` presents finite `type` values, caller text/slots, and an optional close intent. It creates no timer, toast service, request, or business error mapping.

`UAlertTips` 呈现有限 `type`、调用方文字/插槽和可选 close 意图。不创建定时器、toast 服务、请求，也不映射业务错误。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `show` | `boolean` | `true` |
| `type` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` |
| `title` / `description` | `string` | `''` |
| `closable` | `boolean` | `false` |

Emits `close`; the caller updates `show`. / emit `close`；是否隐藏由调用方更新 `show` 决定。

Consumes `--u-comp-alert-tips-*`; accessibility and device behavior remain subject to the `mp-weixin` fixture and platform verification.

消费 `--u-comp-alert-tips-*`；无障碍与设备行为仍需结合 `mp-weixin` fixture 和平台验证。
