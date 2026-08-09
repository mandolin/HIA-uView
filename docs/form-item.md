# UFormItem component contract / UFormItem 组件契约

> Status / 状态：Private pre-release layout and caller-declared message contract.
> 状态：私有预发布布局与调用方声明消息契约。

`UFormItem` presents a label, required cue, help text, slotted control, and an existing `UValidationMessage`. It does not register with `UForm`, run a validator, inspect a value, or infer validity.

`UFormItem` 呈现标签、必填提示、帮助文字、插槽控件和已有的 `UValidationMessage`。它不向 `UForm` 注册、不运行 validator、不读取值，也不推断有效性。

Its `label` and `required` props are presentation-compatible with their recorded upstream names only. The component intentionally provides no `resetField`, model binding, field registry, or validation lifecycle.

其 `label` 和 `required` 属性仅在呈现意义上与已记录的上游名称兼容。组件有意不提供 `resetField`、模型绑定、字段注册或校验生命周期。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `label` / `helpText` | `string` | `''` / `''` |
| `required` / `disabled` | `boolean` | `false` / `false` |
| `labelPosition` | `'top' \| 'left'` | `'top'` |
| `validationState` | `'idle' \| 'validating' \| 'error'` | `'idle'` |
| `validationMessage` | `string` | `''` |

The root namespace is `u-form-item` and consumes `--u-comp-form-item-*`. Message visibility and wording are entirely caller-declared. Use a visible label even when a native placeholder is present.

根命名空间为 `u-form-item`，消费 `--u-comp-form-item-*`。消息可见性和文字完全由调用方声明。即使存在原生 placeholder，也应提供可见标签。
WCAG 2.2 AA remains the visual acceptance target. The component does not claim validator, screen-reader, accessibility-tree, platform, device, App, or H5 conformance.

WCAG 2.2 AA 仍是视觉验收目标。组件不承诺 validator、读屏、无障碍树、平台、真机、App 或 H5 符合性。
