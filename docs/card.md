# UCard component contract / UCard 组件契约

> Status / 状态：Private pre-release neutral surface container.
> 状态：私有预发布中性表面容器。

`UCard` provides title/subtitle, header/body/footer slots, bounded padding, border, and optional shadow. It owns no business collection, request, navigation, or status semantics.

`UCard` 提供标题/副标题、header/body/footer 插槽、受限 padding、边界和可选阴影。不拥有业务集合、请求、导航或状态语义。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `title` / `subTitle` | `string` | `''` |
| `bordered` / `shadow` | `boolean` | `true` / `false` |
| `padding` | `number` (0–64px) | `16` |

Consumes `--u-comp-card-*`; slots remain caller-owned. / 消费 `--u-comp-card-*`；插槽内容仍由调用方拥有。
