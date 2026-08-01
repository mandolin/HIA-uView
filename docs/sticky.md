# USticky component contract / USticky 组件契约

> Status / 状态：Private pre-release CSS-only sticky projection.
> 状态：私有预发布仅 CSS 的吸顶投影。

`USticky` wraps its default slot with CSS `position: sticky`, a caller-declared `offsetTop`, and a bounded `zIndex`. `disabled` switches to static layout. It performs no observer, DOM measurement, platform sniffing, fixed fallback, or scroll service.

`USticky` 使用 CSS `position: sticky` 包裹默认 slot，接受调用方声明的 `offsetTop` 和受边界保护的 `zIndex`；`disabled` 时切换为静态布局。它不使用 observer、DOM 测量、平台嗅探、fixed fallback 或滚动服务。

The root namespace is `u-sticky` and consumes `--u-comp-sticky-*`. The caller must verify target-platform support before relying on sticky behavior.

根命名空间为 `u-sticky`，消费 `--u-comp-sticky-*`。依赖吸顶行为前，调用方必须自行验证目标平台支持。
