# UAvatar component contract / UAvatar 组件契约

> Status / 状态：Private pre-release image-or-initials placeholder.
> 状态：私有预发布图片或 initials 占位。

`UAvatar` uses caller `src` when available and falls back to at most two caller-provided text characters. It creates no base64 image, identity lookup, sex/level decoration, upload, or persistence.

`UAvatar` 在有 `src` 时使用调用方图片，否则回退到最多两个调用方文字字符。它不生成 base64 图片、不查身份、不添加性别/等级装饰，也不上传或持久化。

Props are `src`, `text`, `alt`, `shape`, `size`, and `disabled`; `click` is local intent only. The root namespace is `u-avatar` and consumes `--u-comp-avatar-*` tokens.

属性包括 `src`、`text`、`alt`、`shape`、`size` 和 `disabled`；`click` 只表示本地意图。根命名空间为 `u-avatar`，消费 `--u-comp-avatar-*` token。
