# Explicit feedback services / 显式反馈服务

HIA-uView exposes `createUFeedbackScope`, `useToast`, and `useModal` from both the package root and the pure `@hia-uview/ui/services` subpath. Importing either entry creates no scope, host, global property, event listener, or side effect.

HIA-uView 从包根与纯 `@hia-uview/ui/services` 子路径同时导出 `createUFeedbackScope`、`useToast` 与 `useModal`。导入任一入口都不会创建 scope、host、全局属性、事件监听或副作用。

## Ownership model / 所有权模型

1. The application creates and retains a scope. / 应用创建并持有 scope。
2. Controllers bind only to that explicit scope. / controller 只绑定该显式 scope。
3. A `UToast` or `UModal` registers only when both the same `serviceScope` and `serviceHost=true` are supplied. / 只有同时提供同一 `serviceScope` 与 `serviceHost=true` 时，`UToast` 或 `UModal` 才注册。
4. Each scope keeps at most one current host per kind. A later host replaces and safely releases the earlier one; a stale unregister cannot remove its replacement. / 每个 scope 的每种 kind 至多保留一个当前 host。后注册 host 会替代并安全释放先前 host；陈旧 unregister 不能移除替代者。
5. `scope.dispose()` is idempotent and permanent. It releases current hosts and makes later operations return `scope-disposed`. / `scope.dispose()` 幂等且永久；它释放当前 host，并使后续操作返回 `scope-disposed`。

Separate scopes are isolated. There is no implicit process-wide default, page discovery, `getCurrentPages`, global event bus, router, network, storage, identity, or business-store dependency.

不同 scope 相互隔离。不存在隐式进程级默认值、页面发现、`getCurrentPages`、全局事件总线、router、网络、存储、身份或业务 store 依赖。

## Command result / 命令结果

All controller operations return a synchronous discriminated result:

全部 controller 操作返回同步可判别结果：

```ts
type UFeedbackCommandResult =
  | { readonly accepted: true; readonly requestId: number }
  | {
      readonly accepted: false;
      readonly reason:
        | 'invalid-scope'
        | 'host-unavailable'
        | 'scope-disposed'
        | 'stale-request'
        | 'invalid-options';
    };
```

`accepted: true` means only that the current synchronous host accepted the command. It does not promise that a platform painted it, a user saw or confirmed it, or application work completed. A missing host is not queued for later. Invalid options, hostile Proxy/getter input, and host exceptions are contained as stable results rather than leaked exceptions.

`accepted: true` 只表示当前同步 host 接受了命令；它不承诺平台已绘制、用户已看到或确认，也不表示应用工作完成。缺失 host 的命令不会排队等待以后执行。非法 options、恶意 Proxy/getter 输入和 host 异常会被收束为稳定结果，而非泄漏异常。

## Concurrency and lifecycle / 并发与生命周期

Request IDs are monotonically allocated inside one scope across toast and modal. A new show replaces the active request of the same kind. Passing an expected request ID to `close` or modal `clearLoading` prevents a stale asynchronous path from acting on a newer request. Component unmount and host replacement release local presentation without executing callbacks or navigation.

request ID 在一个 scope 内跨 toast 与 modal 单调分配。同 kind 的新 show 会替代当前活动 request。向 `close` 或 modal `clearLoading` 传入 expected request ID，可阻止陈旧异步路径作用于新 request。组件卸载与 host 替换会释放局部呈现，不执行 callback 或导航。

This contract has repository-local runtime, H5-build, `mp-weixin` compiler, type-consumer, and offline-tarball evidence only where explicitly reported. It is not a DevTools, physical-device, screen-reader, App, or complete cross-platform certification.

只有在明确报告处，本契约才具备仓内 runtime、H5 build、`mp-weixin` compiler、类型 consumer 与离线 tarball 证据；它不是 DevTools、真机、读屏、App 或完整跨端认证。
