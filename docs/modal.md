# UModal component contract / UModal 组件契约

> Status / 状态：Private pre-release controlled and explicitly scoped modal. / 私有预发布受控且显式作用域 modal。

`UModal` has two deliberately separate use modes. In controlled mode, an explicitly supplied `visible` wins over migration `modelValue`; the caller owns title/content, labeled controls, writeback, and every business result. In service-host mode, the caller supplies both `serviceScope` and `serviceHost=true`; the component then presents only finite text/options dispatched through that exact scope.

`UModal` 有两种刻意分离的使用模式。受控模式中，显式提供的 `visible` 优先于迁移 `modelValue`；调用方拥有标题/正文、带标签控件、写回和全部业务结果。service host 模式中，调用方必须同时提供 `serviceScope` 与 `serviceHost=true`；组件随后只呈现由该精确 scope 派发的有限文字/options。

## Controlled mode / 受控模式

- `title`, `content`, and the default slot are caller-owned. `showTitle` may suppress the title. / `title`、`content` 与默认 slot 均由调用方拥有；`showTitle` 可抑制标题。
- `confirmText`/`cancelText` name the built-in controls; `showConfirmButton`/`showCancelButton` may suppress them. An optional `confirm-button` slot names only the controlled confirm control. / `confirmText`/`cancelText` 为内建控件命名；`showConfirmButton`/`showCancelButton` 可抑制它们。可选 `confirm-button` slot 只为受控确认控件命名。
- Normal confirm/cancel emits `update:modelValue(false)` before `confirm(rawEvent)` or `cancel(rawEvent)`. The component does not mutate either visibility prop. / 普通确认/取消会先 emit `update:modelValue(false)`，再 emit `confirm(rawEvent)` 或 `cancel(rawEvent)`；组件不修改任一可见性 prop。
- `asyncClose=true` keeps confirmation locally loading and emits `confirm` without requesting close. Component-ref `clearLoading()` only clears that projection; it does not finish a task. / `asyncClose=true` 会让确认进入局部 loading，并 emit `confirm` 而不请求关闭。组件 ref `clearLoading()` 只清除该投影，不完成任务。
- `maskCloseAble=true` permits mask cancellation and appends `{ source: 'controlled', reason: 'mask' }` as the second cancel argument. / `maskCloseAble=true` 允许遮罩取消，并把 `{ source: 'controlled', reason: 'mask' }` 作为 cancel 第二参数追加。

## Explicit service host / 显式 service host

Create one scope with `createUFeedbackScope()`, bind a controller with `useModal(scope)`, and mount one opted-in host with the same scope. Merely passing a scope does not register a host. Later registration replaces an earlier modal host in that scope; unmounting or disposing removes the current host deterministically.

使用 `createUFeedbackScope()` 创建一个 scope，以 `useModal(scope)` 绑定 controller，并用同一 scope 挂载一个显式 opt-in host。只传 scope 不会注册 host。同一 scope 中后注册的 modal host 会替代先前 host；卸载或 dispose 会确定性移除当前 host。

```vue
<script setup>
import { createUFeedbackScope, useModal } from '@hia-uview/ui/services';

const feedbackScope = createUFeedbackScope();
const modal = useModal(feedbackScope);

function showLocalDecision() {
  return modal.confirm({
    content: 'Continue this local action? / 是否继续此本地操作？',
    confirmText: 'Continue / 继续',
    cancelText: 'Cancel / 取消'
  });
}
</script>

<template>
  <UModal :service-scope="feedbackScope" :service-host="true" />
</template>
```

Service confirmation/cancellation emits the raw event first and finite `{ source: 'service', requestId, reason? }` metadata second. `asyncClose` may retain the service modal in loading until `modal.clearLoading(requestId)` or `modal.close(requestId)`. Controller results only prove synchronous host acceptance or a stable rejection; they do not prove user confirmation or business completion. See [explicit feedback services](feedback-services.md).

service 确认/取消保留原始事件为第一参数，并追加有限 `{ source: 'service', requestId, reason? }` metadata 为第二参数。`asyncClose` 可让 service modal 保持 loading，直到 `modal.clearLoading(requestId)` 或 `modal.close(requestId)`。controller 结果只证明同步 host 接收或稳定拒绝，不证明用户确认或业务完成。参见[显式反馈服务](feedback-services.md)。

## Boundaries / 边界

The component and controller discover no page, global singleton, router, network, identity, credential, storage, or business store. They execute no callback supplied in options. The implementation does not claim focus trap/restore, escape handling, scroll locking, native modal stacking, screen-reader, DevTools, physical-device, App, or complete cross-platform certification.

组件与 controller 不发现页面、全局 singleton、router、网络、身份、凭据、存储或业务 store，也不执行 options 中的 callback。实现不声明焦点陷阱/恢复、escape 处理、滚动锁定、原生 modal 层叠、读屏、DevTools、真机、App 或完整跨端认证。

The root namespace is `u-modal` and consumes `--u-comp-modal-*`.

根命名空间为 `u-modal`，消费 `--u-comp-modal-*`。
