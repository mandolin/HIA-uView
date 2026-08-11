# UField component contract / UField 组件契约

> Status / 状态：Private pre-release dual-mode field contract with runtime behavior coverage.
> 具有 runtime 行为覆盖的私有预发布双模式字段契约。

`UField` combines visible label/help/validation presentation with either a built-in `UInput` or a caller-owned default slot. This preserves the familiar `u-field` migration surface without taking ownership of a form model, rule lifecycle, submission, storage, request, identity, or business field definition.

`UField` 将可见标签、帮助与校验呈现同内建 `UInput` 或调用方拥有的默认 slot 组合。它保留熟悉的 `u-field` 迁移表面，但不拥有表单模型、规则生命周期、提交、存储、请求、身份或业务字段定义。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `''` | Caller-owned value used only by built-in-input mode. / 仅由内建输入模式使用的调用方自有值。 |
| `label` / `helpText` | `string` | `''` / `''` | Caller-localized visible copy. / 调用方本地化的可见文字。 |
| `required` | `boolean` | `false` | Presents a required marker only; it creates no rule. / 只呈现必填标记；不创建规则。 |
| `placeholder` | `string` | `''` | Caller-owned hint for the built-in input. / 内建输入使用的调用方自有提示。 |
| `disabled` / `readonly` | `boolean` | `false` / `false` | Local guards forwarded to the built-in input. / 转发给内建输入的局部 guard。 |
| `validationState` | `'idle' \| 'validating' \| 'error'` | `'idle'` | Caller-declared presentation state. / 调用方声明的呈现状态。 |
| `validationMessage` | `string` | `''` | Caller-localized presentation copy. / 调用方本地化的呈现文字。 |

## Two composition modes / 两种组合模式

Without a default slot, `UField` renders a built-in `UInput` and forwards `modelValue`, `placeholder`, `disabled`, and `readonly`. In this mode it exposes exactly four events: `update:modelValue(value: string)`, `input(value: string)`, `confirm(value: string)`, and `click()`.

没有默认 slot 时，`UField` 渲染内建 `UInput`，并转发 `modelValue`、`placeholder`、`disabled` 与 `readonly`。此模式精确暴露四个事件：`update:modelValue(value: string)`、`input(value: string)`、`confirm(value: string)` 与 `click()`。

With a default slot, the slot replaces the built-in input. The slotted control owns its value, props, native attributes, and events; `UField` neither synthesizes nor proxies input events in this mode. A slotted input placed under a surrounding `UFormItem` may still consume that item's private guards and validation notifications through its own component contract.

存在默认 slot 时，slot 会替代内建输入。插槽控件拥有自身值、prop、原生属性与事件；`UField` 在此模式既不合成也不代理输入事件。位于外围 `UFormItem` 下的插槽输入，仍可按照自身组件契约消费该表单项的私有 guard 与校验通知。

`validationState` and `validationMessage` are presentation inputs passed to `UValidationMessage`; they are not a validator state machine. Use `UFormItem` when field registration, rules, automatic `change`/`blur` triggers, clear, or snapshot reset is required.

`validationState` 与 `validationMessage` 是传给 `UValidationMessage` 的呈现输入，并非 validator 状态机。需要字段注册、规则、自动 `change`/`blur` 触发、清除或快照重置时，应使用 `UFormItem`。

The root namespace is `u-field` and consumes `--u-comp-field-*`; validation-message visuals remain in `--u-comp-validation-message-*`. Provide a meaningful visible label, do not treat placeholder text as a label, and do not rely only on color for required or validation state. Native label linkage, keyboard, screen-reader, accessibility-tree, IME, and device behavior remain platform verification responsibilities.

根命名空间为 `u-field`，消费 `--u-comp-field-*`；校验消息视觉仍属于 `--u-comp-validation-message-*`。应提供有意义的可见标签，不要把 placeholder 当作标签，也不要只依靠颜色表达必填或校验状态。原生标签关联、键盘、读屏、无障碍树、输入法与真机行为仍由平台验证负责。
