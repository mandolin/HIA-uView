# UDropdown component contract / UDropdown 组件契约

`UDropdown` is a private pre-release, instance-local owner for two mutually exclusive composition paths: legacy controlled selection and an explicit-name single-active registry. It owns no page popup, global registry, router, request, layout measurement, outside-click service, or persistent state.

`UDropdown` 是私有预发布、实例局部的 owner，提供两条互斥组合路径：legacy 受控选择与显式 name 的单 active registry。它不拥有页面 popup、全局 registry、router、请求、布局测量、outside-click service 或持久状态。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `string \| number` | `''` |
| `disabled` | `boolean` | `false` |

The default slot contains direct `UDropdownItem` children. In legacy mode, an enabled child delegates its transparent string/finite-number value to the parent. The parent emits `update:modelValue(value)` and then `change(value)` before the child emits `select(value)`. The parent never mutates the model.

默认 slot 包含直接 `UDropdownItem` 子项。在 legacy 模式中，enabled child 把透明的字符串/有限数字 value 委托给 parent。parent 先依次 emit `update:modelValue(value)` 与 `change(value)`，随后 child 才 emit `select(value)`。parent 绝不修改 model。

## Explicit-name registry / 显式 name registry

An item whose `name` prop is explicitly supplied enters registry/options mode. Valid names are strings or finite numbers; `''` and `0` are valid. The registry is private to one `UDropdown` instance, the first duplicate name owns registration, and at most one item is active.

显式传入 `name` prop 的 item 会进入 registry/options 模式。有效 name 是字符串或有限数字；`''` 与 `0` 都有效。registry 私有于单个 `UDropdown` 实例，重复 name 由首项拥有 registration，并且最多只有一个 active item。

The public instance exposes `open(name): boolean` and `close(): boolean`. `open` returns `false` for an unregistered, hidden, disabled, duplicate/non-owner, or invalid name. Opening the already active name is idempotent. Switching A to B changes the sole active item without emitting `close` and there is no `open` event.

公开实例暴露 `open(name): boolean` 与 `close(): boolean`。未注册、hidden、disabled、重复/non-owner 或非法 name 会使 `open` 返回 `false`。打开已 active 的同名项是幂等操作。A 切换到 B 只改变唯一 active item，不 emit `close`，也不存在 `open` 事件。

`close()` clears the active item first, then emits `close(rawName)` and returns `true`. With no active item it returns `false` and emits nothing. Parent runtime disable, item name/show/disabled changes, or unmount silently invalidate registration/active state; re-enabling does not reopen anything.

`close()` 会先清除 active item，再 emit `close(rawName)` 并返回 `true`。没有 active item 时返回 `false` 且不 emit 事件。parent 运行时禁用、item name/show/disabled 变化或卸载都会静默使 registration/active state 失效；重新启用不会自动重开。
