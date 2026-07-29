# UCheckbox component contract / UCheckbox 组件契约

`UCheckbox` presents one caller-owned boolean option. It accepts `value`, `label`, `checked`, and `disabled` with the same text/disabled meanings as `URadio`. In independent mode it emits `change({ value, checked: nextChecked })` only while enabled; it never writes `checked`, stores state, or interprets the toggle as a business command.

`UCheckbox` 呈现一个调用方拥有的布尔选项。它接受 `value`、`label`、`checked`、`disabled`，其文字/disabled 含义与 `URadio` 相同。在独立模式下仅当启用时 emit `change({ value, checked: nextChecked })`；绝不写入 `checked`、存储状态或把切换解释为业务命令。

Inside `UCheckboxGroup`, checked derives from exact membership in caller-owned `modelValue`; child or group disabled suppresses change. The child delegates value intent to its group and creates no array itself.

在 `UCheckboxGroup` 内，checked 从调用方拥有的 `modelValue` 精确成员关系派生；child 或 group disabled 都会抑制 change。子项把 value intent 委托给 group，自身不创建数组。

No picker, popup, option source, form/async rule, network, storage, router, asset, DevTools, device, accessibility-tree, App, H5, or cross-platform behavior is promised.

不承诺 picker、popup、option source、表单/异步规则、网络、storage、router、asset、DevTools、真机、无障碍树、App、H5 或跨端行为。
