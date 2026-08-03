# UConfigProvider component contract / UConfigProvider 组件契约

`UConfigProvider` scopes finite `theme` (`light`), `density` (`comfortable` or `compact`), and caller `locale` (`zh-Hans` or `en`) markers to its default-slot subtree. Unknown values safely normalize to `light`, `comfortable`, and `zh-Hans`.

`UConfigProvider` 将有限的 `theme`（`light`）、`density`（`comfortable` 或 `compact`）和调用方 `locale`（`zh-Hans` 或 `en`）标记限定在默认插槽子树中。未知值安全规范化为 `light`、`comfortable` 与 `zh-Hans`。

It reads no system language, persists nothing, loads no translations, and globally mutates neither theme nor locale. `useULocale()` reads only the nearest provider's reactive locale in component setup and returns a local `zh-Hans` fallback when absent. It does not translate business copy, access source-comment locale, or replace application runtime i18n.

它不读取系统语言、不持久化、不加载翻译，也不全局修改 theme/locale。`useULocale()` 只在组件 setup 中读取最近 provider 的 reactive locale，缺少 provider 时返回局部 `zh-Hans` fallback。它不翻译业务文案、不访问源码注释 locale，也不替代应用 runtime i18n。
