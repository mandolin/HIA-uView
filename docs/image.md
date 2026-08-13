# UImage component contract / UImage 组件契约

> Status / 状态：Private pre-release caller-owned native-image projection with runtime-tested source recovery and click forwarding, plus package-owned precise types. / 私有预发布调用方自有原生图片投影；来源恢复与 click 转发已有 runtime 测试，并具备 package 自有精确类型。

`UImage` projects a caller-provided source through a bounded native image surface. It owns only local presentation and the current instance's error flag; it performs no request-client work, cache, retry, upload, download, preview, navigation, source allowlisting, or bundled fallback asset.

`UImage` 通过受限原生图片表面投影调用方提供的来源。它只拥有局部呈现和当前实例的错误标记；不实现请求客户端、缓存、重试、上传、下载、预览、导航、来源 allowlist 或内置 fallback 资产。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `src` | `string` | `''` | Caller-owned source passed unchanged to the native image. Changing the string recreates the native projection and clears local error presentation. / 原样传给原生 image 的调用方自有来源。字符串变化会重建原生投影并清除局部错误呈现。 |
| `alt` | `string` | `''` | Caller-provided alternative copy used to name the local root. / 调用方提供、用于命名局部根节点的替代文字。 |
| `mode` | `UImageMode` | `'aspectFill'` | One of `scaleToFill`, `aspectFit`, `aspectFill`, `widthFix`, `heightFix`, `top`, `bottom`, `center`, `left`, or `right`; runtime unknowns fall back to `aspectFill`. / 十项有限原生 mode 之一；runtime 未知值回退到 `aspectFill`。 |
| `shape` | `'square' \| 'rounded' \| 'circle'` | `'square'` | Finite tokenized shape. / 有限 token 化形状。 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Finite fixed geometry. / 有限固定几何。 |
| `fluid` | `boolean` | `false` | Fills the parent's explicitly bounded width and height; it does not measure layout or infer ratio. / 填满父级显式限定的宽高；不测量布局、不推断比例。 |
| `lazyLoad` | `boolean` | `true` | Forwarded only to the native image node. / 只透传给原生 image 节点。 |
| `showError` | `boolean` | `true` | Replaces the currently errored image with local text fallback. / 以局部文字 fallback 替代当前出错图片。 |
| `errorText` | `string` | `'图片不可用 / Image unavailable'` | Caller-overridable visible fallback copy. / 调用方可覆盖的可见 fallback 文字。 |

| Event / 事件 | Payload / 载荷 | Contract / 契约 |
| --- | --- | --- |
| `load` | original native event / 原始原生事件 | Clears current local error presentation, then forwards the event. / 清除当前局部错误呈现，再转发事件。 |
| `error` | original native event / 原始原生事件 | Sets current local error presentation, then forwards the event. / 设置当前局部错误呈现，再转发事件。 |
| `click` | original platform event / 原始平台事件 | Reports local intent only. / 只报告本地意图。 |

The local `click` intent never implies preview, download, navigation, retry, or source trust.

本地 `click` 意图绝不表示预览、下载、导航、重试或来源可信。

## Source and recovery rules / 来源与恢复规则

An error belongs to the current `src` value. A different `src` clears that error and keys a new native image node; assigning the same string does not create an implicit retry. The caller owns source trust, any remote-domain policy, retry timing, replacement source, and all business state.

错误属于当前 `src` 值。不同的 `src` 会清除错误并以 key 重建原生 image 节点；再次赋同一字符串不会产生隐式重试。来源信任、任何远程域策略、重试时机、替代来源和全部业务状态均由调用方拥有。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`src` is the reviewed compatible input. `mode`, `shape`, `lazyLoad`, `showError`, `load`, and `error` are bounded mappings and require call-site review. Upstream `click` has no payload; HIA intentionally forwards the platform event. Width/height, radius, fade/duration, loading/error icons or slots, WebP, long-press menu, raw color, and raw-style inputs are unsupported.

`src` 是已复核的 compatible 输入。`mode`、`shape`、`lazyLoad`、`showError`、`load` 与 `error` 是受限 mapping，必须复核调用点。上游 `click` 无 payload；HIA 有意转发平台事件。width/height、radius、fade/duration、loading/error 图标或 slot、WebP、长按菜单、原始颜色与原始样式输入均未支持。

## Examples / 示例

```vue
<u-image
  src="/static/venue.jpg"
  alt="Reading room / 阅览室"
  mode="aspectFill"
  shape="rounded"
  size="large"
  @error="replaceSource"
  @click="openCallerOwnedDetails"
/>
```

```vue
<!-- Incorrect: the component does not retry, preview, cache, or create a fallback asset. -->
<!-- 错误：组件不会重试、预览、缓存或创建 fallback 资产。 -->
<u-image src="https://example.test/photo.jpg" error-icon="reload" @click="previewAutomatically" />
```

## Limits and evidence / 限制与证据

Vue runtime tests cover original click identity, error fallback, load recovery, and recovery after a changed source. Native network loading, late events from an old source, caching, DevTools, device behavior, accessibility-tree output, remote-domain policy, App/H5 runtime, and cross-platform behavior are not certified. H5 and `mp-weixin` fixtures remain compiler evidence only.

Vue runtime 测试覆盖原始 click identity、错误 fallback、load 恢复，以及来源变化后的恢复。原生网络加载、旧来源迟到事件、缓存、开发者工具、真机行为、无障碍树输出、远程域策略、App/H5 runtime 与跨端行为均未认证。H5 与 `mp-weixin` fixture 仍只提供 compiler 证据。
