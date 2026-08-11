# UFormItem component contract / UFormItem 组件契约

> Status / 状态：Private pre-release field lifecycle, validation, and presentation contract.
> 私有预发布的字段生命周期、校验与呈现契约。

`UFormItem` registers one safe field path with its nearest `UForm`, captures a mount-time value snapshot, combines form-level and item-level rules, and projects its latest eligible validation result through `UValidationMessage`. Without a form or valid `prop`, it remains a standalone label/help/external-message wrapper.

`UFormItem` 向最近的 `UForm` 注册一个安全字段路径、捕获挂载时值快照、组合 form-level 与 item-level 规则，并通过 `UValidationMessage` 投影最新且仍有效的校验结果。没有表单或合法 `prop` 时，它仍是独立的标签、帮助与外部消息包装器。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `prop` | `string` | `''` | Safe dotted/index path registered with the nearest form; empty or unsafe means standalone. / 注册到最近表单的安全 dotted/index 路径；空值或不安全值表示独立模式。 |
| `rules` | `UFormRule \| readonly UFormRule[]` | `[]` | Item rules appended after form-level rules in declaration order. / 按声明顺序追加在 form-level 规则之后的表单项规则。 |
| `label` / `helpText` | `string` | `''` / `''` | Caller-localized visible copy. / 调用方本地化的可见文字。 |
| `required` | `boolean` | `false` | Presents an asterisk only; use a `required` rule for validation. / 只呈现星号；真正校验应使用 `required` 规则。 |
| `validationState` | `'' \| 'idle' \| 'validating' \| 'error'` | `''` | External compatibility state used only while no internal validation is active. / 仅在没有内部校验活动时使用的外部兼容状态。 |
| `validationMessage` | `string` | `''` | External caller message; it never enters rule errors or callbacks. / 外部调用方消息；绝不进入规则错误或 callback。 |
| `labelPosition` | `'' \| 'top' \| 'left'` | `''` | Nonempty valid value overrides the nearest form; otherwise inherits and finally falls back to `top`. / 非空合法值覆盖最近表单；否则继承并最终回退 `top`。 |
| `disabled` | `boolean` | `false` | OR-combined with the nearest form and inherited by direct input descendants. / 与最近表单按 OR 合并，并由直接输入后代继承。 |
| `readonly` | `boolean` | `false` | Inherited by direct input descendants; it blocks value changes but is not equivalent to disabled. / 由直接输入后代继承；阻止值变化，但不等同于禁用。 |

The default slot remains caller-owned. The component emits no public event and exposes exactly three methods:

默认 slot 仍由调用方拥有。组件不触发公开事件，并精确暴露三个方法：

| Method / 方法 | Result / 结果 | Contract / 约定 |
| --- | --- | --- |
| `validate(trigger?)` | `Promise<UFormValidationError \| null>` | Validates a call-time value/rule snapshot; `trigger` is `''`, `change`, or `blur`. / 校验调用时的值与规则快照；`trigger` 为 `''`、`change` 或 `blur`。 |
| `clearValidate()` | `void` | Clears internal projection and invalidates in-flight UI writes; external presentation props remain untouched. / 清除内部投影并使在途 UI 写入失效；外部呈现 prop 不变。 |
| `resetField()` | `void` | Restores the registration snapshot only for an originally existing path, then clears validation. / 仅对注册时已存在的路径恢复快照，然后清除校验。 |

## Composition behavior / 组合行为

`UInput`, `UTextarea`, and `USearch` directly beneath the item inherit its effective guards. After an accepted value event and caller writeback, the input waits for Vue's next update and notifies `change` rules. After an enabled blur observation, it similarly notifies `blur` rules. There is no timer, debounce, implicit submit, or remote validation transport.

直接位于表单项下的 `UInput`、`UTextarea` 与 `USearch` 会继承其有效 guard。接受值事件并由调用方写回后，输入组件等待 Vue 下一次更新，再通知 `change` 规则；启用状态的 blur 观察也会相应通知 `blur` 规则。此过程没有 timer、防抖、隐式提交或远程校验传输。

Internal `validating` or `error` state takes precedence over `validationState` and `validationMessage`. When internal state returns to `idle`, the external compatibility presentation is visible again. A stale asynchronous result still resolves to the original method caller, but cannot overwrite UI after a newer run, clear, reset, path/owner change, or unmount.

内部 `validating` 或 `error` 状态优先于 `validationState` 与 `validationMessage`。内部状态回到 `idle` 后，外部兼容呈现才重新可见。过期异步结果仍会向原方法调用者 resolve，但不能在更新轮次、清除、重置、路径或 owner 变化、卸载之后覆盖 UI。

The root namespace is `u-form-item` and consumes `--u-comp-form-item-*`; message visuals remain in `--u-comp-validation-message-*`. Use a meaningful visible label even when a placeholder exists. Required and invalid states must not rely on color alone. Native label linkage, screen-reader announcement, accessibility-tree behavior, and device conformance remain application/platform verification responsibilities.

根命名空间为 `u-form-item`，消费 `--u-comp-form-item-*`；消息视觉仍属于 `--u-comp-validation-message-*`。即使存在 placeholder，也应使用有意义的可见标签。必填与无效状态不能只依靠颜色表达。原生标签关联、读屏播报、无障碍树行为和真机符合性仍由应用与平台验证负责。
