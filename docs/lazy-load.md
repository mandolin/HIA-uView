# ULazyLoad component contract / ULazyLoad 组件契约

> Status / 状态：Private pre-release caller-controlled deferred image projection.
> 状态：私有预发布调用方受控延迟图片投影。

`ULazyLoad` creates its native image only when caller `active` is true and `src` is non-empty. Caller slots or explicit text provide placeholder/error presentation; `load` and `error` only forward native image events.

`ULazyLoad` 仅在调用方 `active` 为真且 `src` 非空时创建原生图片。调用方 slot 或显式文字提供 placeholder/error 呈现；`load` 与 `error` 只转发原生图片事件。

The root namespace is `u-lazy-load` and consumes `--u-comp-lazy-load-*`. It does not observe a viewport, prefetch, cache, retry, or manage a network resource.

根命名空间为 `u-lazy-load`，消费 `--u-comp-lazy-load-*`。它不观察 viewport、不预取、不缓存、不重试，也不管理网络资源。
