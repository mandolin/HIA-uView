# URadio component contract / URadio 组件契约

`URadio` is a private pre-release, caller-controlled single-choice runtime contract. Its current repository evidence does not establish DevTools, device, accessibility-tree, App, H5, or cross-platform support.

`URadio` 是私有预发布、调用方受控的单选 runtime 契约。当前仓库证据不构成 DevTools、真机、无障碍树、App、H5 或跨端支持。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `value` | `string \| number` | `''` | Transparent option key. An explicit value, including `''`, wins over `name`. / 透明选项键。显式 value（包括 `''`）优先于 `name`。 |
| `name` | `string \| number` | `''` | Fallback key only when `value` is omitted; its type is preserved. / 仅在省略 `value` 时作为回退键；保留原类型。 |
| `label` | `string` | `''` | Caller-owned fallback label. / 调用方拥有的回退标签。 |
| `checked` | `boolean` | `false` | Independent controlled presentation; group context takes precedence when present. / 独立受控呈现；存在 group context 时由 group 优先。 |
| `disabled` | `string \| boolean` | `''` | `true` or a nonempty string disables the option. / `true` 或非空字符串禁用选项。 |
| `labelDisabled` | `boolean` | `false` | Blocks only label-area activation. / 只阻止标签区域激活。 |

In independent mode, an enabled and not-currently-selected activation emits `select(value)` and then `change(value)`. An already selected radio cannot cancel itself. Disabled interaction, or label interaction while `labelDisabled` is effective, emits nothing.

在独立模式中，启用且当前未选中的激活会依次 emit `select(value)` 与 `change(value)`。已选 radio 不能自行取消。禁用交互，或 `labelDisabled` 生效时的标签交互，均不 emit 事件。

Inside `URadioGroup`, selected presentation derives from strict equality with the caller-owned group `modelValue`. The child delegates intent to the group and emits neither independent event. Child or group `disabled` blocks every interaction; child or group `labelDisabled` blocks only the label path. The default slot replaces the visible label and receives no scoped data.

在 `URadioGroup` 内，selected 呈现来自与调用方拥有的 group `modelValue` 严格相等的比较。子项把 intent 委托给 group，不 emit 自身的独立事件。child 或 group 的 `disabled` 会阻止全部交互；child 或 group 的 `labelDisabled` 只阻止标签路径。默认 slot 替换可见标签且不接收 scoped data。

No picker, popup, option source, form rule, async validation, request, persistence, router, business interpretation, bundled icon/image/font, or platform certification is included. WCAG 2.2 AA remains an acceptance target, not platform certification.

不包含 picker、popup、option source、表单规则、异步校验、请求、持久化、router、业务解释、内置图标/图片/字体或平台认证。WCAG 2.2 AA 仍是验收目标，而非平台认证。
