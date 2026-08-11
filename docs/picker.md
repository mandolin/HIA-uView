# UPicker component contract / UPicker 组件契约

`UPicker` is a private pre-release, caller-controlled finite single-/multi-column picker. It owns only a short-lived local draft; confirmed values and option data remain caller-owned.

`UPicker` 是私有预发布、调用方受控的有限单列/多列 picker。它只拥有短生命周期的本地草稿；确认值与 option 数据仍由调用方拥有。

## Migration boundary / 迁移边界

Upstream `u-picker` uses same-named APIs for popup visibility and richer region/time/column state. This contract uses `modelValue` only for a finite selected scalar or complete selected-value array. Shared names are therefore **mapped, not API-compatible**: do not pass upstream visibility, region, time, or column state unchanged.

上游 `u-picker` 使用同名 API 表示浮层可见性及更丰富的地区/时间/列状态。本契约只用 `modelValue` 表示有限的选中标量或完整选中值数组。因此同名项只是 **mapped, not API-compatible**：不得原样传入上游可见性、地区/时间/列状态。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| ReadonlyArray<string \| number>` | `''` | Caller-owned confirmed single- or multi-column value. / 调用方拥有的已确认单列或多列值。 |
| `columns` | `ReadonlyArray<unknown>` | `[]` | Nonempty input wins over `range`; all-flat means one column and fully nested means multiple columns. / 非空输入优先于 `range`；全平面表示单列，完整嵌套表示多列。 |
| `range` | `ReadonlyArray<unknown>` | `[]` | Single-column migration alias used only when `columns` is empty. / 仅在 `columns` 为空时使用的单列迁移 alias。 |
| `rangeKey` | `string` | `''` | One shallow own display field on option records; never a path or prototype lookup. / option record 上一个浅层自有展示字段；绝不是路径或原型查找。 |
| `preserveSelection` | `boolean` | `true` | Relocates the latest complete confirmed transparent values after column changes; `false` returns immediately to the caller model. / columns 变化后按透明值重定位最近一次完整确认选择；`false` 会立即回到 caller model。 |
| `title` | `string` | `''` | Caller-owned title fallback. / 调用方拥有的标题回退。 |
| `confirmText` / `cancelText` | `string` | `''` | Empty props use one locale-specific presentation fallback; the prop defaults remain empty. / 空 prop 在呈现时使用一种 locale 回退；prop 默认值仍为空。 |
| `disabled` | `boolean` | `false` | Blocks draft changes and actions. / 阻止草稿变化和操作。 |

Options may be primitive values or records. A mixed partly nested `columns` shape fails closed to no columns. Resolution uses strict equality and the first enabled duplicate. An unmatched value remains unresolved; the component never guesses the first option.

option 可以是原始值或 record。部分嵌套的混合 `columns` 形状会 fail closed 为无列。解析使用严格相等，并采用首个 enabled 重复项。未匹配值保持 unresolved；组件绝不猜测第一项。

Changing an option draft emits only `columnchange({ column, index, value, option, values, indexes, options })`; it does not update the model. Confirm is allowed only when every column resolves to an enabled option, and emits `update:modelValue(value)` followed by `confirm({ value, values, indexes, options })`. The top-level `value` is a scalar for one column and an array for multiple columns.

改变 option 草稿只 emit `columnchange({ column, index, value, option, values, indexes, options })`，不会更新 model。只有每列都解析为 enabled option 时才允许确认，并依次 emit `update:modelValue(value)` 与 `confirm({ value, values, indexes, options })`。顶层 `value` 在单列时为标量，在多列时为数组。

Cancel restores the current caller selection without a model update and emits only `cancel({ value, values, indexes, options })`. An unresolved column uses `null`, `-1`, and `null` in its value/index/option positions while the top-level value preserves the caller snapshot. Result objects and their containers are shallow-frozen; raw option identities are retained.

取消会恢复当前 caller selection，不更新 model，并且只 emit `cancel({ value, values, indexes, options })`。未解析列在 value/index/option 位置分别使用 `null`、`-1` 与 `null`，顶层 value 则保留 caller snapshot。结果对象及其容器浅冻结，同时保留 raw option identity。

The named `title` slot receives `{ title }`. The default slot appears after the built-in actions and receives no draft or option bindings. Disabled, invalid mixed-shape, unresolved-confirm, popup, region/time data, linkage service, request, router, remote options, and persistence behavior are absent.

具名 `title` slot 接收 `{ title }`。默认 slot 位于内建操作之后，不接收草稿或 option binding。disabled、非法混合形状、未解析确认、popup、地区/时间数据、联动 service、请求、router、远端 options 与持久化能力均不包含在内。

Styling consumes `--u-comp-picker-*`; any outer popup remains caller-owned. / 样式消费 `--u-comp-picker-*`；任何外层浮层仍由调用方拥有。
