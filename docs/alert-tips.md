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

The root inherits the caller's `font-family`, keeping title, description, slotted copy, and close control aligned with application typography. `UAlertTips` does not select, download, bundle, or register a font and introduces no font token or theme API.

组件根继承调用方的 `font-family`，使标题、说明、插槽文字与关闭 control 遵循应用排版。`UAlertTips` 不选择、下载、捆绑或注册字体，也不新增字体 token 或主题 API。
