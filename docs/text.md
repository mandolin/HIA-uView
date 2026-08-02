# UText component contract / UText 组件契约

`UText` presents caller text/default slot with finite `type`, `size`, and optional bounded line clamp. It parses no HTML, rich text, external asset, or remote content.

`UText` 以有限 `type`、`size` 和可选受限行数呈现调用方文字/default 插槽。不解析 HTML、富文本、外部资产或远程内容。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `text` | `string` | `''` |
| `type` | `primary \| secondary \| success \| warning \| danger` | `primary` |
| `size` | `sm \| md \| lg` | `md` |
| `lines` | `number` (0–6) | `0` |
| `ellipsis` | `boolean` | `false` |

Consumes `--u-comp-text-*`; text semantics remain caller-owned. / 消费 `--u-comp-text-*`；文字语义仍由调用方拥有。
