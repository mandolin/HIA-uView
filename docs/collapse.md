# UCollapse component contract / UCollapse 组件契约

> Status / 状态：Private pre-release controlled disclosure parent.
> 状态：私有预发布受控折叠父组件。

`UCollapse` provides a local Vue context for `UCollapseItem`. `modelValue` is an array in normal mode and a scalar value in `accordion` mode; `update:modelValue` and `change` report the next value. It performs no animation, timer, request, persistence, or business state-machine work.

`UCollapse` 为 `UCollapseItem` 提供局部 Vue context。普通模式下 `modelValue` 为数组，`accordion` 模式下为标量；`update:modelValue` 与 `change` 报告下一组值。它不执行动画、计时、请求、持久化或业务状态机工作。

The root namespace is `u-collapse` and consumes `--u-comp-collapse-*`. Context is limited to the current Vue subtree; it is not a global registry.

根命名空间为 `u-collapse`，消费 `--u-comp-collapse-*`。context 只限当前 Vue 子树，不是全局 registry。
