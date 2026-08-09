# UPopup component contract / UPopup 组件契约

> Status / 状态：Private pre-release controlled local overlay.
> 状态：私有预发布受控局部浮层。

`UPopup` renders caller-owned `visible`, finite `placement`, optional title/close text, and a default slot. It also accepts migration `modelValue` and `show`: an explicitly supplied `visible` wins; otherwise either migration value can make the local surface visible. Do not combine conflicting migration aliases. An eligible close first emits `update:modelValue(false)` and then `close`; the caller owns whether any value is actually written back. It does not auto-close, animate, trap focus, lock scrolling, mutate the page root, navigate, or create a global service.

`UPopup` 呈现调用方拥有的 `visible`、有限 `placement`、可选标题/关闭文字和默认 slot。它还接受迁移 `modelValue` 和 `show`：显式提供的 `visible` 优先；否则任一迁移值都可令局部表面可见。不要混用冲突的迁移别名。符合条件的关闭会先 emit `update:modelValue(false)`，再 emit `close`；调用方决定是否实际写回任何值。它不自动关闭、不动画、不管理焦点、不锁定滚动、不修改页面根节点、不导航，也不创建全局服务。

The root namespace is `u-popup` and consumes `--u-comp-popup-*`. Mask closing is opt-in through `maskClosable`; platform overlay and accessibility behavior are not certified by this contract.

根命名空间为 `u-popup`，消费 `--u-comp-popup-*`。遮罩关闭必须通过 `maskClosable` 显式开启；本文不认证平台浮层和无障碍行为。
