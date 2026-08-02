# UReadMore component contract / UReadMore 组件契约

`UReadMore` is a controlled expand/collapse projection with fixed `showHeight`; it does not measure DOM, animate, auto-collapse, or paginate.

`UReadMore` 是固定 `showHeight` 的受控展开/收起投影；不测量 DOM、不做动画、不自动收起、不分页。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `boolean` | `false` |
| `showHeight` | `number` (24–600px) | `120` |
| `expandText` / `collapseText` | `string` | bilingual defaults / 双语默认值 |
| `disabled` | `boolean` | `false` |

Emits `update:modelValue` and `change`; consumes `--u-comp-read-more-*`. / emit 两事件；消费 `--u-comp-read-more-*`。
