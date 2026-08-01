# UToast component contract / UToast 组件契约

> Status / 状态：Private pre-release static controlled feedback.
> 状态：私有预发布静态受控反馈。

`UToast` presents caller-owned `visible`, `message`, and finite `tone`, with optional explicit close text. It has no timer, queue, global toast API, callback execution, notification source, request, or route behavior.

`UToast` 呈现调用方拥有的 `visible`、`message` 和有限 `tone`，并支持可选显式关闭文字。它不包含计时器、队列、全局 toast API、回调执行、通知来源、请求或路由行为。

The root namespace is `u-toast` and consumes `--u-comp-toast-*`. The caller decides when feedback appears or disappears.

根命名空间为 `u-toast`，消费 `--u-comp-toast-*`。反馈何时出现或消失由调用方决定。
