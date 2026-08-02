# UCellGroup component contract / UCellGroup 组件契约

> Status / 状态：Private pre-release local information-row container. / 私有预发布局部信息行容器。

`UCellGroup` presents an optional title and bordered slot container. It registers no cells and owns no form or submission lifecycle.

`UCellGroup` 呈现可选标题和带边界的插槽容器。不注册 cell，也不拥有表单或提交生命周期。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `title` | `string` | `''` |
| `bordered` | `boolean` | `true` |

Consumes `--u-comp-cell-group-*`; child semantics remain caller-owned. / 消费 `--u-comp-cell-group-*`；子项语义仍由调用方拥有。
