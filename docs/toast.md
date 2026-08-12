# UToast component contract / UToast 组件契约

> Status / 状态：Private pre-release controlled, component-ref, and explicitly scoped feedback. / 私有预发布受控、组件 ref 与显式作用域反馈。

`UToast` has three local presentation entries: caller-controlled props, component-ref commands, and an explicit scoped service host. They share the same finite field and value boundaries, while the two imperative entries share the strict options normalizer. Controlled props retain caller ownership and do not use `duration`. None creates a global queue or default singleton.

`UToast` 有三种局部呈现入口：调用方受控 props、组件 ref 命令和显式作用域 service host。三者共享相同的有限字段和值域边界，两条命令式入口共享严格 options normalizer；受控 props 仍由调用方拥有且不使用 `duration`。三者都不创建全局队列或默认 singleton。

## Controlled presentation / 受控呈现

`visible` plus nonempty `message` controls the fallback surface. `tone` has priority over migration `type`; valid values are `info`, `success`, `warning`, and `error`. `position` is limited to `top`, `center`, or `bottom`. `loading` only composes a static indicator and proves no task exists. A nonempty `closeText` creates a labeled close control whose `close(rawEvent)` intent does not write `visible`.

`visible` 与非空 `message` 控制 fallback 表面。`tone` 优先于迁移 `type`；合法值为 `info`、`success`、`warning` 与 `error`。`position` 只允许 `top`、`center` 或 `bottom`。`loading` 只组合静态 indicator，不证明任务存在。非空 `closeText` 创建带标签关闭控件，其 `close(rawEvent)` 意图不写入 `visible`。

## Component ref / 组件 ref

The imperative `show()`/`close()` command surface is instance-local; `hide()` is the same idempotent close operation. `show(string | options)` replaces the current imperative session. The last valid show wins, clears the previous timer, and cannot be closed by a stale timer. `duration=0` persists until close; a positive bounded duration ends silently. Invalid options are a safe no-op. When an imperative session ends, controlled props immediately become the fallback again.

命令式 `show()`/`close()` 表面只属于当前实例；`hide()` 是同一幂等关闭操作。`show(string | options)` 整体替换当前命令式 session。最后一次合法 show 获胜并清除旧 timer，陈旧 timer 不能关闭新 session。`duration=0` 保持到显式关闭；受限正 duration 到时静默结束。非法 options 安全 no-op。命令式 session 结束后立即回退受控 props。

## Explicit service host / 显式 service host

Create a scope and controller explicitly, then mount a host with the same `serviceScope` and `serviceHost=true`. `useToast(scope)` exposes `show`, `close`, `success`, `error`, `warning`, `info`, and `loading`. Each accepted show receives a scope-local monotonic `requestId`; an optional expected ID on close prevents stale work from closing a replacement request.

显式创建 scope 与 controller，再以同一 `serviceScope` 和 `serviceHost=true` 挂载 host。`useToast(scope)` 暴露 `show`、`close`、`success`、`error`、`warning`、`info` 与 `loading`。每次被接受的 show 获得 scope 内单调递增 `requestId`；close 的可选 expected ID 可阻止陈旧工作关闭替代请求。

```vue
<script setup>
import { createUFeedbackScope, useToast } from '@hia-uview/ui/services';

const feedbackScope = createUFeedbackScope();
const toast = useToast(feedbackScope);

function showLocalFeedback() {
  return toast.success('Saved locally / 已在本地保存');
}
</script>

<template>
  <UToast :service-scope="feedbackScope" :service-host="true" />
</template>
```

The close control for a component-ref or service session appends finite `{ source, requestId, reason: 'control' }` metadata. Timer expiry and unmount are silent. A service controller result only reports synchronous acceptance or a stable rejection and does not prove visual delivery, user observation, or business completion. See [explicit feedback services](feedback-services.md).

组件 ref 或 service session 的关闭控件会追加有限 `{ source, requestId, reason: 'control' }` metadata。timer 到期与卸载均静默。service controller 结果只报告同步接收或稳定拒绝，不证明视觉送达、用户看到或业务完成。参见[显式反馈服务](feedback-services.md)。

The component/service accepts no callback, URL, router, request, identity, credential, storage, page discovery, or arbitrary payload. The root namespace is `u-toast` and consumes `--u-comp-toast-*`.

组件/service 不接受 callback、URL、router、请求、身份、凭据、存储、页面发现或任意 payload。根命名空间为 `u-toast`，消费 `--u-comp-toast-*`。
