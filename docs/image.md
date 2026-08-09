# UImage component contract / UImage 组件契约

> Status / 状态：Private pre-release caller-owned native image projection.
> 状态：私有预发布调用方拥有的原生图片投影。

`UImage` presents `src`, finite native `mode`, `shape`, `size`, optional `fluid`, and `alt`/error copy. It reports `load`, `error`, and local `click` intent but performs no request client, cache, upload, download, preview, navigation, or bundled fallback asset.

`UImage` 呈现 `src`、有限原生 `mode`、`shape`、`size`、可选 `fluid` 以及 `alt`/错误文字。它回传 `load`、`error` 和本地 `click` 意图，但不实现请求客户端、缓存、上传、下载、预览、导航或内置 fallback 资产。

`fluid=false` retains the selected fixed size. `fluid=true` makes the root fill the parent’s explicit width and height. The caller must own that bounded parent geometry; `UImage` does not measure the viewport, infer an aspect ratio, or accept arbitrary style values.

`fluid=false` 保留所选固定尺寸。`fluid=true` 使根节点填满父容器的显式宽高。受限父级几何必须由调用方拥有；`UImage` 不测量 viewport、不推断宽高比，也不接受任意样式值。

`click(event)` forwards the original local event unchanged. The caller owns whether a click has any meaning and any following state transition.

`click(event)` 原样转发本地事件。点击是否具有含义以及其后的任何状态转换均由调用方拥有。

The root namespace is `u-image`; the caller owns the source trust decision and must provide meaningful alternative text. Platform image loading, DevTools behavior, device behavior, and remote-source policy are not certified by this contract.

根命名空间为 `u-image`；源的可信决策和有意义的替代文字由调用方拥有。本文不认证平台图片加载、开发者工具、真机或远程源策略。
