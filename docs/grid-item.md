# UGridItem component contract / UGridItem 组件契约

> Status / 状态：Private pre-release declarative grid item.
> 状态：私有预发布声明式网格项目。

`UGridItem` presents label, description, icon/default slots, and local `click` intent. The item is independently renderable and reads only optional `UGrid` layout context.

`UGridItem` 呈现 label、description、icon/default 插槽和局部 `click` 意图。无父级时也可独立渲染，只读取可选的 `UGrid` 布局 context。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `label` / `description` | `string` | `''` |
| `disabled` | `boolean` | `false` |

Consumes `--u-comp-grid-item-*`; the caller owns routing and business action. / 消费 `--u-comp-grid-item-*`；路由和业务动作由调用方拥有。
