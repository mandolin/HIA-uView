# UCheckbox component contract / UCheckbox 组件契约

`UCheckbox` presents one caller-owned boolean option. It accepts string/number `value`, `label`, the existing `checked` alias, standard boolean `modelValue`, and string/boolean `disabled`. When both independent inputs are present, explicit `checked` keeps its existing HIA precedence; otherwise `modelValue` controls the visual state. In independent mode it emits `update:modelValue(nextChecked)` and then the retained `change({ value, checked: nextChecked })` only while enabled; it never writes a prop, stores state, or interprets the toggle as a business command.

`UCheckbox` 呈现一个调用方拥有的布尔选项。它接受字符串/数字 `value`、`label`、既有 `checked` alias、标准布尔 `modelValue` 与字符串/布尔 `disabled`。独立输入同时存在时，显式 `checked` 保持既有 HIA 优先级；否则由 `modelValue` 控制可见状态。在独立模式下仅当启用时，先 emit `update:modelValue(nextChecked)`，再保留 `change({ value, checked: nextChecked })`；绝不写 prop、存储状态或把切换解释为业务命令。

Inside `UCheckboxGroup`, checked derives from exact membership in caller-owned `modelValue`; child or group disabled suppresses change. The child delegates value intent to its group and creates no array itself. Its default slot replaces only the visible label and receives no scoped data.

在 `UCheckboxGroup` 内，checked 从调用方拥有的 `modelValue` 精确成员关系派生；child 或 group disabled 都会抑制 change。子项把 value intent 委托给 group，自身不创建数组。其默认 slot 只替代可见 label，不接收 scoped data。

No picker, popup, option source, form/async rule, network, storage, router, asset, DevTools, device, accessibility-tree, App, H5, or cross-platform behavior is promised.

不承诺 picker、popup、option source、表单/异步规则、网络、storage、router、asset、DevTools、真机、无障碍树、App、H5 或跨端行为。
