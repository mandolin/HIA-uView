# ULink component contract / ULink 组件契约

> Status / 状态：Private pre-release link-like text primitive without href.
> 状态：私有预发布、无 href 的链接样式文字原语。

`ULink` presents text/default slot and emits local `click`. It deliberately accepts no `href`, router, command, or network protocol; the application decides what the intent means.

`ULink` 呈现文字/default 插槽并 emit 局部 `click`。它刻意不接受 `href`、router、命令或网络协议；意图含义由应用决定。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `text` / `color` | `string` | `''` |
| `underlined` / `disabled` | `boolean` | `false` / `false` |

Consumes `--u-comp-link-*`; color override remains caller-audited. / 消费 `--u-comp-link-*`；颜色覆盖值仍由调用方审计。
