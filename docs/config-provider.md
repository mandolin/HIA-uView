# UConfigProvider component contract / UConfigProvider 组件契约

`UConfigProvider` scopes finite `theme` (`light`) and `density` (`comfortable` or `compact`) CSS markers to its default-slot subtree. Unknown values safely normalize to `light` and `comfortable`.

`UConfigProvider` 将有限的 `theme`（`light`）和 `density`（`comfortable` 或 `compact`）CSS 标记限定在默认插槽子树中。未知值安全规范化为 `light` 与 `comfortable`。

It reads, persists, and globally mutates neither theme nor locale. A later locale contract may extend this bounded subtree surface without making it a global singleton.

它不读取、持久化或全局修改 theme/locale。后续 locale 契约可以扩展这个受限子树表面，但不会使其成为全局 singleton。
