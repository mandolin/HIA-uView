# UDropdown component contract / UDropdown 组件契约

> Status / 状态：Private pre-release local controlled selection context. / 私有预发布局部受控选择 context。

`UDropdown` provides `modelValue` and a private context for direct `UDropdownItem` children. It owns no page popup, router, request, or global option registry.

`UDropdown` 提供 `modelValue` 和给直接 `UDropdownItem` 使用的私有 context。不拥有页面浮层、router、请求或全局选项 registry。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `string \| number` | `''` |
| `disabled` | `boolean` | `false` |

Emits `update:modelValue` and `change`. / emit `update:modelValue` 与 `change`。
