# USelect component contract / USelect 组件契约

`USelect` normalizes finite primitive or `{ label, value, disabled }` options and emits `update:modelValue`/`change`. It performs no request, search, remote filtering, popup service, or persistence.

`USelect` 规范化有限原始值或 `{ label, value, disabled }` 选项并 emit 两个受控事件。不执行请求、搜索、远程过滤、浮层服务或持久化。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `string \| number` | `''` |
| `options` | `unknown[]` | `[]` |
| `placeholder` | `string` | `Select / 请选择` |
| `disabled` | `boolean` | `false` |

Consumes `--u-comp-select-*`; outer presentation remains caller-owned. / 消费 `--u-comp-select-*`；外层呈现仍由调用方拥有。
