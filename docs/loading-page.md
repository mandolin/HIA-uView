# ULoadingPage component contract / ULoadingPage 组件契约

> Status / 状态：Private pre-release static page loading presentation.
> 状态：私有预发布静态页面 loading 呈现。

`ULoadingPage` presents caller-owned `visible`, `text`, and finite `tone`. Its visible ellipsis is a static text placeholder; there is no timer, request, progress inference, auto-hide, global mask, or icon asset.

`ULoadingPage` 呈现调用方拥有的 `visible`、`text` 和有限 `tone`。省略号只是静态文字占位；不包含计时器、请求、进度推断、自动隐藏、全局遮罩或图标资产。

The root namespace is `u-loading-page` and consumes `--u-comp-loading-page-*`. Page visibility and any async lifecycle remain caller-owned.

根命名空间为 `u-loading-page`，消费 `--u-comp-loading-page-*`。页面可见性和任何异步生命周期仍由调用方拥有。
