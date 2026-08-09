# UCellItem component contract / UCellItem 组件契约

`UCellItem` presents caller-owned `title`, optional `label`/`value`, a visible `required` cue, finite `arrow`, and explicit `clickable`/`disabled` state. A clickable, enabled row emits `click` and never navigates itself.

`UCellItem` 呈现调用方拥有的 `title`、可选 `label`/`value`、可见的 `required` 提示、有限 `arrow` 与显式 `clickable`/`disabled` 状态。可点击且未禁用的行 emit `click`，绝不自行导航。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `label` | `string \| number` | `''` | Secondary caller copy. Numeric `0` remains visible. / 次级调用方文字；数值 `0` 保持可见。 |
| `value` | `string \| number` | `''` | Trailing caller copy. When it is the empty string, the default slot may provide the trailing presentation. / 尾部调用方文字。为空字符串时，默认 slot 可以提供尾部展示。 |
| `required` | `boolean` | `false` | Displays a visible asterisk cue only. It does not register a field, validate, submit, or create an error state. / 仅显示可见星号提示；不注册字段、不校验、不提交，也不创建错误状态。 |

The default slot is a caller-owned trailing presentation fallback for an empty `value`. It does not receive an automatic click, navigation, data, or form contract.

默认 slot 是 `value` 为空时调用方自有的尾部展示回退。它不会自动获得 click、导航、数据或表单契约。

It coexists with `UCell`; neither component is an alias or a complete upstream API substitute.

它与 `UCell` 并存；两者不互为 alias，也不构成完整上游 API 替代。
