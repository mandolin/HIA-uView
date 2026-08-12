# UMask component contract / UMask 组件契约

`UMask` projects caller-owned `visible`, bounded opacity/layer, an optional default slot, and optional click intent. An explicitly supplied `visible` wins; otherwise the migration `show` alias controls the local surface.

`UMask` 投影调用方拥有的 `visible`、受边界保护的 opacity/layer、可选默认 slot 与可选点击意图。显式提供的 `visible` 优先；否则由迁移别名 `show` 控制局部表面。

`click` is emitted only while the mask is visible and `clickable` is true. The component never changes visibility, closes an enclosing surface, locks scrolling, manages focus, moves across roots, or interprets slot content.

只有遮罩可见且 `clickable` 为真时才 emit `click`。组件绝不改变可见性、不关闭外围表面、不锁定滚动、不管理焦点、不跨根移动，也不解释 slot 内容。
