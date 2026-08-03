# UCellItem component contract / UCellItem 组件契约

`UCellItem` presents caller-owned `title`, optional `label`/`value`, finite `arrow`, and explicit `clickable`/`disabled` state. A clickable, enabled row emits `click` and never navigates itself.

`UCellItem` 呈现调用方拥有的 `title`、可选 `label`/`value`、有限 `arrow` 与显式 `clickable`/`disabled` 状态。可点击且未禁用的行 emit `click`，绝不自行导航。

It coexists with `UCell`; neither component is an alias or a complete upstream API substitute.

它与 `UCell` 并存；两者不互为 alias，也不构成完整上游 API 替代。
