# UFullScreen component contract / UFullScreen 组件契约

> Status / 状态：Private pre-release caller-controlled full-viewport sheet.
> 状态：私有预发布调用方受控全视口 sheet。

`UFullScreen` renders a same-tree full-viewport sheet only while caller `visible` is true. `close` and `backdrop` are local intents; the caller owns visibility writeback and every follow-up action.

`UFullScreen` 只在调用方 `visible` 为真时呈现同一组件树内的全视口 sheet。`close` 与 `backdrop` 是本地意图；调用方拥有可见性回写与所有后续操作。

It does not call a native fullscreen API, lock focus/scroll, manage a global overlay, or route back. Supply `title` and `closeText` from the application locale. The root namespace is `u-full-screen` and consumes `--u-comp-full-screen-*`.

它不调用原生 fullscreen API、不锁定焦点/滚动、不管理全局 overlay，也不执行返回路由。`title` 和 `closeText` 由应用 locale 提供。根命名空间为 `u-full-screen`，消费 `--u-comp-full-screen-*`。
