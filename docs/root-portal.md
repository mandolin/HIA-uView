# URootPortal component contract / URootPortal 组件契约

`URootPortal` creates a same-tree, caller-slot wrapper with a bounded local layer. `visible` and `layer` remain caller-owned.

`URootPortal` 创建带有受边界保护本地层级的同树调用方插槽包装器。`visible` 与 `layer` 仍归调用方所有。

It is an explicit Mini Program-safe fallback, not Vue Teleport, cross-root relocation, page-root mutation, or a global portal service.

它是明确的小程序安全降级，不是 Vue Teleport、跨根重挂、页面根 mutation 或全局 portal 服务。
