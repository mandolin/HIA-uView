# UMask component contract / UMask 组件契约

`UMask` projects caller-owned `visible`, bounded opacity/layer, and optional click intent. It never changes `visible`, locks scrolling, or manages focus.

`UMask` 投影调用方拥有的 `visible`、受边界保护的 opacity/layer 和可选点击意图。它绝不修改 `visible`、锁定滚动或管理焦点。

The component is a local overlay primitive; callers must provide the surrounding dialog/flow and close decision.

组件是本地遮罩原语；调用方必须提供外围 dialog/flow 与关闭决定。
