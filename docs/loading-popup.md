# ULoadingPopup component contract / ULoadingPopup 组件契约

`ULoadingPopup` composes local `UMask` and `ULoading` from caller-owned `visible`, label, size, and finite mask settings. When `maskClosable` is explicit, a mask click emits `close`; the caller owns the writeback.

`ULoadingPopup` 根据调用方拥有的 `visible`、label、size 与有限遮罩设置组合本地 `UMask`/`ULoading`。显式 `maskClosable` 时，遮罩点击 emit `close`；调用方拥有状态写回。

It is not a global loading service and does not infer, cancel, or complete a task.

它不是全局 loading 服务，也不推断、取消或完成任务。
