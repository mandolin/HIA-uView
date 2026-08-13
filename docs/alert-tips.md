# UAlertTips component contract / UAlertTips 组件契约

> Status / 状态：Private pre-release caller-controlled alert strip with runtime-tested body/close isolation and package-owned precise types. / 私有预发布调用方受控提示条；内容区/关闭隔离已有 runtime 测试，并具备 package 自有精确类型。

`UAlertTips` presents caller-owned local feedback with a finite type, optional title/body, controlled visibility, and an optional close control. It creates no timer, global toast, page discovery, request, error-code mapping, navigation, or business consequence.

`UAlertTips` 以有限 type、可选标题/正文、受控可见性和可选关闭 control 呈现调用方拥有的局部反馈。它不创建定时器、全局 toast、页面发现、请求、错误码映射、导航或业务后果。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | Controls this alert projection only. / 只控制当前提示条投影。 |
| `type` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Finite tokenized feedback type. / 有限 token 化反馈类型。 |
| `title` | `string` | `''` | Optional caller-owned visible heading. / 可选调用方自有可见标题。 |
| `description` | `string` | `''` | Body fallback when the default slot is absent. / 默认 slot 缺省时的正文回退。 |
| `closable` | `boolean` | `false` | Shows the local close-intent control. / 显示局部 close 意图 control。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `click` | none / 无 | Emitted only by the body region; it forwards no platform event or text. / 只由内容区 emit；不转发平台事件或文字。 |
| `close` | none / 无 | Emitted only by the close control; it does not update `show`. / 只由关闭 control emit；不更新 `show`。 |
| `default` slot | none / 无 | Replaces `description`; the two bodies are never rendered together. / 替代 `description`；两份正文绝不同时呈现。 |

The close control stops propagation, so one close activation never also becomes a body `click`. Unknown runtime `type` values fall back to `primary`. The root inherits the caller's `font-family`; the component selects, downloads, bundles, or registers no font and exposes no font token/API.

关闭 control 会停止传播，因此一次关闭激活绝不会同时变成内容区 `click`。runtime 未知 `type` 回退到 `primary`。根节点继承调用方 `font-family`；组件不选择、下载、捆绑或注册字体，也不暴露字体 token/API。

`show` only controls projection; the caller decides whether to update `show` after `click` or `close`. The component does not select, download, bundle, or register a font.

`show` 只控制投影；调用方决定是否在 `click` 或 `close` 后更新 `show`。组件不选择、下载、捆绑或注册字体。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`show` is the reviewed compatible input. `title`, `description`, `type`, payload-free `click`, and payload-free `close` are bounded mappings: same names do not make the entire visual and control contract identical. Upstream uses `closeAble`; HIA uses `closable`, and no alias is provided. Upstream raw colors/styles, close text, icons, and icon visibility/style are unsupported.

`show` 是已复核的 compatible 输入。`title`、`description`、`type`、无 payload `click` 和无 payload `close` 是受限 mapping：同名不代表完整视觉与 control 契约相同。上游使用 `closeAble`；HIA 使用 `closable`，且不提供 alias。上游原始颜色/样式、close text、图标及图标可见性/样式均未支持。

## Examples / 示例

```vue
<u-alert-tips
  :show="alertVisible"
  type="warning"
  title="Check input / 请检查输入"
  :closable="true"
  @click="focusFirstInvalidField"
  @close="alertVisible = false"
>
  Required fields are incomplete. / 必填字段尚未完整。
</u-alert-tips>
```

```vue
<!-- Incorrect: `closeAble` is not an alias and close never hides the alert automatically. -->
<!-- 错误：`closeAble` 不是 alias，且 close 绝不会自动隐藏提示条。 -->
<u-alert-tips :show="true" :close-able="true" @close="expectAutomaticHide" />
```

## Limits and evidence / 限制与证据

Runtime tests cover slot/description precedence, payload-free body click, payload-free close, propagation isolation, and caller-owned visibility. Package types constrain props/events. Compiler fixtures do not prove live-region announcement, screen-reader/keyboard behavior, visual contrast on every host, DevTools/device behavior, timers, global feedback, or cross-platform runtime.

Runtime 测试覆盖 slot/description 优先级、无 payload 内容区 click、无 payload close、传播隔离和调用方自有可见性。package 类型约束 props/events。compiler fixture 不证明 live-region 宣读、读屏/键盘行为、所有宿主上的视觉对比度、开发者工具/真机行为、定时器、全局反馈或跨端 runtime。
