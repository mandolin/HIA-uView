# UTransition component contract / UTransition 组件契约

`UTransition` wraps caller slot content with finite CSS `mode`, bounded millisecond `duration`, and caller-owned visibility. An explicitly supplied `visible` wins; otherwise the migration `show` alias controls rendering.

`UTransition` 使用有限 CSS `mode`、受边界保护的毫秒 `duration` 与调用方拥有的可见性包装调用方 slot 内容。显式提供的 `visible` 优先；否则由迁移别名 `show` 控制渲染。

The component uses no JavaScript timer, measurement, lifecycle event service, cross-root movement, or hidden-content manager. This constrained projection therefore does not claim complete upstream transition lifecycle parity.

组件不使用 JavaScript timer、测量、生命周期事件服务、跨根移动或隐藏内容管理器。因此，这个受限投影不声明完整上游 transition 生命周期一致性。
