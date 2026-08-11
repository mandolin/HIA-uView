# UCheckbox component contract / UCheckbox 组件契约

`UCheckbox` presents one caller-owned boolean option. In independent mode, explicit `checked` retains precedence over `modelValue`. The component never writes a prop, stores a durable selection, or interprets a toggle as a form submission, permission, route, or business command.

`UCheckbox` 呈现一个由调用方拥有的布尔选项。它绝不写入 prop、保存持久选择，也不把切换解释为表单提交、权限、路由或业务命令。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `value` | `string \| number` | `''` | Transparent option key. An explicitly supplied value, including `''`, wins over `name`. / 透明选项键。显式传入的值（包括 `''`）优先于 `name`。 |
| `name` | `string \| number` | `''` | Used only when `value` is omitted; no string/number coercion occurs. / 仅在省略 `value` 时使用；不会转换字符串与数字。 |
| `label` | `string` | `''` | Caller-owned fallback label. / 调用方拥有的回退标签。 |
| `checked` | `boolean` | `undefined` | When explicitly supplied in independent mode, it controls presentation before `modelValue`. / 在独立模式中显式传入时，其呈现优先于 `modelValue`。 |
| `modelValue` | `boolean` | `false` | Independent controlled state when `checked` is omitted. / 省略 `checked` 时的独立受控状态。 |
| `disabled` | `string \| boolean` | `''` | `true` or a nonempty string disables the whole option; an empty string is enabled. / `true` 或非空字符串禁用整个选项；空字符串表示启用。 |
| `labelDisabled` | `boolean` | `false` | Blocks only label-area activation; the marker/root control remains operable. / 只阻止标签区域激活；marker/root control 仍可操作。 |

In independent mode, an enabled change emits `update:modelValue(nextChecked)` and then `change({ value, checked: nextChecked })`. Both events use the resolved transparent value. Disabled interaction, or label interaction while `labelDisabled` is effective, emits nothing.

在独立模式中，启用状态下的变更依次 emit `update:modelValue(nextChecked)` 与 `change({ value, checked: nextChecked })`。两个事件都使用解析后的透明 value。禁用交互，或 `labelDisabled` 生效时的标签交互，均不 emit 事件。

## Group composition / Group 组合

Inside `UCheckboxGroup`, checked presentation derives from exact membership in the caller-owned group `modelValue`. The child delegates its value intent to the group and emits neither independent event. Child or group `disabled` blocks every interaction; child or group `labelDisabled` blocks only the label path. The default slot replaces the visible label and receives no scoped data.

在 `UCheckboxGroup` 内，checked 呈现来自调用方拥有的 group `modelValue` 中的精确成员关系。子项把 value intent 委托给 group，不 emit 自身的独立事件。child 或 group 的 `disabled` 会阻止全部交互；child 或 group 的 `labelDisabled` 只阻止标签路径。默认 slot 替换可见标签且不接收 scoped data。

No picker, popup, option source, form rule, network, storage, router, asset, DevTools, device, accessibility-tree, App, H5, or cross-platform behavior is promised.

不承诺 picker、popup、option source、表单规则、网络、storage、router、asset、DevTools、真机、无障碍树、App、H5 或跨端行为。
