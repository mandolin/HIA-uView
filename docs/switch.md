# USwitch component contract / USwitch 组件契约

`USwitch` wraps a native switch while preserving caller-configured active and inactive values. It does not persist, authorize, call a service, or infer a business setting.

`USwitch` 包装原生 switch，同时保留调用方配置的 active 与 inactive 值。它不持久化、授权、调用服务，也不推断业务设置。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `boolean \| string \| number` | `false` | Caller-owned controlled value. / 调用方拥有的受控值。 |
| `activeValue` | `boolean \| string \| number` | `true` | Value emitted for native checked `true`. / 原生 checked 为 `true` 时 emit 的值。 |
| `inactiveValue` | `boolean \| string \| number` | `false` | Value emitted for native checked `false`. / 原生 checked 为 `false` 时 emit 的值。 |
| `disabled` | `boolean` | `false` | Native disabled state and interaction guard. / 原生 disabled 状态及交互 guard。 |
| `loading` | `boolean` | `false` | Caller-owned local busy guard; it starts no request or service. / 调用方拥有的本地 busy guard；不启动请求或 service。 |
| `label` | `string` | `''` | Optional caller-owned adjacent copy. / 可选的调用方拥有的相邻文字。 |

Checked presentation uses `Object.is(modelValue, activeValue)`. A valid native event must contain a real boolean `detail.value`; `true` maps to `activeValue` and `false` maps to `inactiveValue` without changing its type. The component then emits `update:modelValue(mappedValue)` followed by `change(mappedValue)`.

checked 呈现使用 `Object.is(modelValue, activeValue)`。有效原生事件必须在 `detail.value` 中携带真正的 boolean；`true` 映射到 `activeValue`，`false` 映射到 `inactiveValue`，且不改变其类型。组件随后依次 emit `update:modelValue(mappedValue)` 与 `change(mappedValue)`。

Disabled/loading interaction, a missing payload, or a string such as `"true"` emits nothing. The caller decides whether to write a value back or begin any workflow.

disabled/loading 交互、缺失 payload，或 `"true"` 这类字符串均不 emit 事件。是否写回值或开始任何流程由调用方决定。

The root namespace is `u-switch` and consumes `--u-comp-switch-*` tokens. WCAG 2.2 AA visual distinction is the target; platform and assistive-technology behavior remains unverified.

根命名空间为 `u-switch`，消费 `--u-comp-switch-*` token。WCAG 2.2 AA 视觉区分是目标；平台和辅助技术行为仍未验证。
