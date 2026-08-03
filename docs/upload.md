# UUpload component contract / UUpload 组件契约

`UUpload` renders a finite caller-owned list of file-state records and emits `select`, `preview`, `remove`, or `retry` intent for the current record. It exposes no file chooser, binary data, upload request, cache, progress engine, download, or deletion operation.

`UUpload` 渲染有限的调用方拥有文件状态记录列表，并针对当前记录 emit `select`、`preview`、`remove` 或 `retry` 意图。它不暴露文件 chooser、二进制数据、上传请求、缓存、进度引擎、下载或删除操作。

The caller provides labels, descriptions, status copy, action copy, maximum display slots, and every async follow-up. Status is presentation-only; it is not a network or file-system conclusion.

调用方提供标签、说明、状态文字、操作文字、最大显示槽位和全部异步后续处理。status 仅用于呈现；它不是网络或文件系统结论。
