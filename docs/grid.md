# UGrid component contract / UGrid 组件契约

> Status / 状态：Private pre-release local grid container.
> 状态：私有预发布本地网格容器。

`UGrid` provides bounded columns, gap, border, square intent, and a private layout context for direct `UGridItem` children. It owns no business items or navigation.

`UGrid` 提供受限列数、间距、边界、方形意图，以及给直接 `UGridItem` 子项使用的私有布局 context。不拥有业务项目或导航。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `columns` | `number` (1–12) | `3` |
| `gap` | `number` (0–64px) | `0` |
| `border` / `square` | `boolean` | `false` / `false` |

Consumes `--u-comp-grid-*`; context carries layout only. / 消费 `--u-comp-grid-*`；context 只携带布局。
