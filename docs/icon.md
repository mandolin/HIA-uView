# UIcon component contract / UIcon 组件契约

> Status / 状态：Private pre-release text/slot icon placeholder; no icon font or registry is included.
> 状态：私有预发布文字符号/slot 图标占位；不包含图标字体或 registry。

`UIcon` presents caller-provided text through `name` or the default slot. It does not translate names into glyphs, load assets, infer meaning, or navigate.

`UIcon` 通过 `name` 或默认 slot 呈现调用方文字。它不把名称转换为 glyph、不加载资产、不推断含义，也不导航。

Props are `name`, `label`, `size`, `tone`, and `disabled`; the optional `click` event carries local intent only. The root namespace is `u-icon` and consumes `--u-comp-icon-*` tokens. Use a visible label or caller-owned accessible description when the symbol is not self-explanatory.

属性包括 `name`、`label`、`size`、`tone` 和 `disabled`；可选 `click` 事件只携带本地意图。根命名空间为 `u-icon`，消费 `--u-comp-icon-*` token。符号无法自解释时，应由调用方提供可见标签或无障碍描述。
