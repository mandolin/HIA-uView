# UText component contract / UText 组件契约

`UText` presents caller text/default slot with finite `type`, `size`, optional bounded line clamp, and local `click` intent. It parses no HTML, rich text, external asset, or remote content.

`UText` 以有限 `type`、`size`、可选受限行数和本地 `click` 意图呈现调用方文字/default 插槽。不解析 HTML、富文本、外部资产或远程内容。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `show` | `boolean` | `true` |
| `text` | `string \| number` | `''` |
| `type` | `primary \| secondary \| success \| warning \| danger` | `primary` |
| `size` | `sm \| md \| lg` | `md` |
| `lines` | `number` (0–6) | `0` |
| `ellipsis` | `boolean` | `false` |

The default slot takes precedence over `text`. `show=false` removes this component projection only; it does not decide page state. `click(event)` forwards original local intent without selecting, copying, navigating, or changing text.

默认插槽优先于 `text`。`show=false` 仅移除该组件投影；不决定页面状态。`click(event)` 原样转发本地意图，不选择、复制、导航或改变文字。

Consumes `--u-comp-text-*`; text semantics remain caller-owned. / 消费 `--u-comp-text-*`；文字语义仍由调用方拥有。
