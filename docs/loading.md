# ULoading component contract / ULoading 组件契约

`ULoading` displays caller-owned `visible`, finite `size`/`tone`, and optional `label` as a local status indicator. It also accepts migration `show` (`true` by default): an explicitly supplied `visible` wins; otherwise `show` decides whether the static indicator is rendered. Its CSS animation owns no request, timer, or asynchronous lifecycle.

`ULoading` 将调用方拥有的 `visible`、有限 `size`/`tone` 与可选 `label` 显示为本地状态指示器。它还接受迁移 `show`（默认 `true`）：显式提供的 `visible` 优先；否则由 `show` 决定是否渲染静态 indicator。它的 CSS 动画不拥有请求、timer 或异步生命周期。

The component has no default user-visible message; callers or a future UI locale bridge provide all copy.

组件没有默认用户可见消息；调用方或未来 UI locale bridge 提供全部文案。
