# UToast component contract / UToast 组件契约

> Status / 状态：Private pre-release static controlled feedback.
> 状态：私有预发布静态受控反馈。

`UToast` presents caller-owned `visible`, `message`, finite `tone`, and optional `loading`, with optional explicit close text. `loading` only composes a local static indicator; it does not start a task or prove a task is running. It has no timer, queue, global toast API, imperative `show()`/`close()` command, callback execution, notification source, request, or route behavior.

`UToast` 呈现调用方拥有的 `visible`、`message`、有限 `tone` 与可选 `loading`，并支持可选显式关闭文字。`loading` 只组合局部静态 indicator；它不启动任务，也不证明任务正在运行。它不包含计时器、队列、全局 toast API、命令式 `show()`/`close()`、回调执行、通知来源、请求或路由行为。

The root namespace is `u-toast` and consumes `--u-comp-toast-*`. The caller decides when feedback appears or disappears.

根命名空间为 `u-toast`，消费 `--u-comp-toast-*`。反馈何时出现或消失由调用方决定。
