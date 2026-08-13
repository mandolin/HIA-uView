# UCellItem component contract / UCellItem 组件契约

> Status / 状态：Private pre-release uView-family information row with runtime-tested click/slot behavior and package-owned precise types. / 私有预发布 uView 系信息行；click/slot 行为已有 runtime 测试，并具备 package 自有精确类型。

`UCellItem` presents caller-owned title, secondary copy, trailing value, a visible required cue, a finite arrow cue, and explicit clickable/disabled state. It reports local intent and never navigates, validates, submits, or mutates a list.

`UCellItem` 呈现调用方拥有的标题、次级文字、尾部值、可见 required 提示、有限箭头提示，以及显式 clickable/disabled 状态。它只报告本地意图，绝不导航、校验、提交或修改列表。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Primary caller copy. / 调用方主要文字。 |
| `label` | `string \| number` | `''` | Secondary copy; numeric `0` remains visible. / 次级文字；数字 `0` 保持可见。 |
| `value` | `string \| number` | `''` | Trailing copy; only the empty string yields to the default slot. / 尾部文字；只有空字符串才让位于默认 slot。 |
| `required` | `boolean` | `false` | Shows an asterisk cue only; it creates no validation rule. / 只显示星号提示；不创建校验规则。 |
| `arrow` | `boolean` | `false` | Shows a decorative trailing arrow without route meaning. / 显示无路由语义的装饰性尾部箭头。 |
| `clickable` | `boolean` | `false` | Explicitly enables local activation. / 显式启用本地激活。 |
| `disabled` | `boolean` | `false` | Suppresses activation even when clickable. / 即使 clickable 也会抑制激活。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `click` event | original platform event / 原始平台事件 | Emits once only when `clickable=true` and `disabled=false`. / 仅在 `clickable=true` 且 `disabled=false` 时恰好 emit 一次。 |
| `default` slot | none / 无 | Supplies trailing presentation only when `value === ''`; it gains no click, route, data, or form contract. / 仅在 `value === ''` 时提供尾部展示；不会获得 click、route、data 或 form 契约。 |

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`label`, `required`, and `value` are reviewed compatible inputs. Other same-named surfaces remain mappings: upstream `click` reports its configured index, while HIA reports the original platform event; upstream's default slot is conditionally placed by its own layout, while HIA uses it only as the empty-value trailing fallback.

`label`、`required` 与 `value` 是已复核的 compatible 输入。其他同名表面仍为 mapping：上游 `click` 报告配置的 index，而 HIA 报告原始平台事件；上游默认 slot 按其布局条件放置，而 HIA 只把它作为空 value 的尾部回退。

| Upstream assumption / 上游假设 | Required review / 必需复核 |
| --- | --- |
| `@click="handleIndex"` receives an index / 接收 index | Change the handler to accept a platform event and keep record identity in caller closure/state. / 改为接收平台事件，并由调用方 closure/state 保存 record identity。 |
| `title` or `arrow` is sufficient to navigate / 仅有 `title` 或 `arrow` 即可导航 | Set `clickable` explicitly and execute navigation outside the component. / 显式设置 `clickable`，并在组件外执行导航。 |
| `icon`, `label`, `title`, or `right-icon` named slots / 多个上游具名 slot | Redesign with the documented default trailing slot or another bounded component; these named slots are unsupported. / 使用已记录的默认尾部 slot 或其他受限组件重新设计；这些具名 slot 未支持。 |
| raw style props and border flags / 原始样式 prop 与边界开关 | Replace with documented tokens/composition; do not silently drop them. / 改用已记录 token/组合；不要静默丢弃。 |

## Examples / 示例

```vue
<u-cell-item
  title="Order / 订单"
  :label="0"
  value="Ready / 就绪"
  :required="true"
  :arrow="true"
  :clickable="true"
  @click="openOrder"
/>
```

```vue
<!-- Incorrect: HIA emits a platform event, not the upstream index. -->
<!-- 错误：HIA emit 平台事件，而不是上游 index。 -->
<u-cell-item :index="record.id" title="Order" @click="loadByIndex" />
```

## Limits and evidence / 限制与证据

Runtime tests verify original-event identity, disabled/non-clickable zero-event behavior, numeric-zero visibility, and slot/value precedence. Compiler fixtures and package types do not prove navigation, device interaction, screen-reader behavior, or complete upstream equivalence. `UCellItem` has no route, registry, list selection, form lifecycle, request, or persistence behavior.

Runtime 测试验证原始事件 identity、disabled/non-clickable 零事件、数字零可见性，以及 slot/value 优先级。compiler fixture 与 package 类型不证明导航、真机交互、读屏行为或完整上游等价。`UCellItem` 没有 route、registry、列表选择、表单生命周期、请求或持久化行为。
