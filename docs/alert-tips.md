# UAlertTips component contract / UAlertTips 组件契约

> Status / 状态：Private pre-release, caller-controlled alert presentation.
> 状态：私有预发布、调用方控制的提示呈现。

`UAlertTips` presents finite `type` values, caller text/slots, an explicit local `show` projection, and an optional close intent. It creates no timer, toast service, request, or business error mapping.

`UAlertTips` 呈现有限 `type`、调用方文字/插槽、显式本地 `show` 投影和可选 close 意图。不创建定时器、toast 服务、请求，也不映射业务错误。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `show` | `boolean` | `true` |
| `type` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` |
| `title` / `description` | `string` | `''` |
| `closable` | `boolean` | `false` |

`show` only controls projection of this local strip. Emits `close`; the caller decides whether to update `show`. `close` remains a bounded local intent rather than a complete upstream service/event equivalence.

`show` 只控制本地提示条投影。emit `close`；是否更新 `show` 由调用方决定。`close` 仍是有界本地 intent，不是完整上游 service/event 等价。

Consumes `--u-comp-alert-tips-*`; accessibility and device behavior remain subject to the `mp-weixin` fixture and platform verification.

消费 `--u-comp-alert-tips-*`；无障碍与设备行为仍需结合 `mp-weixin` fixture 和平台验证。
