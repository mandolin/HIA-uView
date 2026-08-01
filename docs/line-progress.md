# ULineProgress component contract / ULineProgress 组件契约

> Status / 状态：Private pre-release static bounded progress projection.
> 状态：私有预发布静态受边界保护进度投影。

`ULineProgress` clamps caller `percent` to 0–100 and presents a finite tone, size, stripe, and optional percentage label. It does not animate, read task state, connect to upload/download, or call a backend.

`ULineProgress` 将调用方 `percent` 限制在 0–100，并呈现有限 tone、size、条纹和可选百分比标签。它不动画、不读取任务状态、不连接上传/下载，也不调用后端。

The root namespace is `u-line-progress` and consumes `--u-comp-line-progress-*`. WCAG 2.2 AA visual distinction is the target; text and surrounding context should not rely on color alone.

根命名空间为 `u-line-progress`，消费 `--u-comp-line-progress-*`。WCAG 2.2 AA 视觉区分是目标；文字和周围上下文不应只依赖颜色。
