# UGap component contract / UGap 组件契约

> Status / 状态：Private pre-release spacing primitive.
> 状态：私有预发布间距原语。

`UGap` renders a caller-controlled vertical gap with bounded numeric height and optional color. It has no content, events, scroll, timer, or business meaning.

`UGap` 呈现调用方控制的垂直间距，接收受限数值高度和可选颜色。它没有内容、事件、滚动、定时器或业务含义。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `height` | `number` (0–256px) | `8` |
| `bgColor` | `string` | `''` |

The component consumes the local `u-gap` namespace; `--u-comp-gap-*` is reserved for theme extension. / 组件消费局部 `u-gap` 命名空间；`--u-comp-gap-*` 为主题扩展预留。
