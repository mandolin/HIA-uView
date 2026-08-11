# UInput component contract / UInput 组件契约

> Status / 状态：Private pre-release controlled-input contract with standalone and form-composed runtime coverage.
> 具有独立与表单组合 runtime 覆盖的私有预发布受控输入契约。

`UInput` renders caller-owned single-line text and reports local intent. It owns no hidden value, rule, submission, navigation, persistence, request, analytics, or business formatting.

`UInput` 渲染调用方拥有的单行文字并报告局部意图。它不拥有隐藏值、规则、提交、导航、持久化、请求、分析或业务格式化。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | Controlled visible value; editing candidates are always unmodified strings. / 受控可见值；编辑候选始终是未经修改的字符串。 |
| `placeholder` | `string` | `''` | Caller-owned hint, not a substitute for a visible label. / 调用方拥有的提示，不能替代可见标签。 |
| `disabled` | `boolean` | `false` | Local unavailable state, OR-combined with the nearest `UFormItem`. / 局部不可用状态，与最近 `UFormItem` 按 OR 合并。 |
| `readonly` | `boolean` | `false` | Local non-editable state, OR-combined with the nearest `UFormItem`. / 局部不可编辑状态，与最近 `UFormItem` 按 OR 合并。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `update:modelValue` | `value: string` | First value intent for each accepted input event. / 每次被接受输入事件的首个值意图。 |
| `input` | `value: string` | Same unmodified string, emitted after `update:modelValue`. / 与前者相同的未经修改字符串，在其后触发。 |
| `focus` / `blur` | platform event / 平台事件 | Original observation while enabled. / 启用状态下的原始观察。 |
| `click` | none / 无 | Enabled local click observation with no cross-platform event payload. / 启用状态的局部点击观察，不扩散跨平台事件 payload。 |
| `confirm` | `value: string` | Confirmed string extracted from a documented event shape. / 从已记录事件形状提取的确认字符串。 |

## Controlled and form-composed behavior / 受控与表单组合行为

The rendered value always comes from the latest prop. An accepted native input emits `update:modelValue` and then `input`; the application decides whether to write the candidate back. Only `detail.value` and `target.value` strings are accepted. A malformed event emits nothing instead of inventing an empty value.

渲染值始终来自最新 prop。被接受的原生输入会依次触发 `update:modelValue` 与 `input`；是否写回候选值由应用决定。只接受字符串形式的 `detail.value` 与 `target.value`。畸形事件不会伪造空值，而是零事件。

Inside the nearest `UFormItem`, an accepted input waits for caller writeback through Vue's next update and then notifies matching `change` rules. Enabled blur emits the original event first and then notifies matching `blur` rules. `UInput` deliberately has no public `change` event: form notification is a private parent-child protocol, not a second caller event.

位于最近 `UFormItem` 内时，被接受的输入会等待调用方经 Vue 下一次更新完成写回，再通知匹配的 `change` 规则。启用状态的 blur 先触发原始事件，再通知匹配的 `blur` 规则。`UInput` 有意不提供公开 `change` 事件：表单通知是私有父子协议，不是第二个调用方事件。

Effective `disabled` suppresses every event even when a handler is invoked directly. Effective `readonly` blocks value events but may still report actual focus, blur, click, and valid confirm observations; it is not an action authorization. No timer, debounce, trim, mask, maxlength policy, automatic focus, or form submission is introduced.

有效 `disabled` 会抑制全部事件，即使 handler 被直接调用。有效 `readonly` 阻止值事件，但仍可报告实际发生的 focus、blur、click 与合法 confirm 观察；它不是操作授权。组件不引入 timer、防抖、trim、掩码、maxlength 策略、自动聚焦或表单提交。

The root namespace is `u-input` and consumes `--u-comp-input-*`. Provide a meaningful visible label, normally through `UFormItem` or `UField`; placeholder alone is insufficient. WCAG 2.2 AA remains the controllable visual target, while native label linkage, keyboard, screen-reader, accessibility tree, IME, DevTools, and device behavior require platform verification.

根命名空间为 `u-input`，消费 `--u-comp-input-*`。应通过 `UFormItem` 或 `UField` 等提供有意义的可见标签；仅有 placeholder 并不足够。WCAG 2.2 AA 仍是可控视觉目标，而原生标签关联、键盘、读屏、无障碍树、输入法、开发者工具与真机行为需要平台验证。
