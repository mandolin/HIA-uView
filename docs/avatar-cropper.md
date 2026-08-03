# UAvatarCropper component contract / UAvatarCropper 组件契约

`UAvatarCropper` projects a caller image source with caller-owned proportional crop geometry and finite caller-labeled adjustments. It emits `select`, `crop-change`, and `confirm` intent, returning only bounded `{ x, y, width, height }` geometry.

`UAvatarCropper` 投影调用方图片源、调用方拥有的比例裁剪几何以及有限的调用方标签化调整项。它 emit `select`、`crop-change` 与 `confirm` 意图，并且只返回受限的 `{ x, y, width, height }` 几何。

It never opens an image chooser, reads image bytes, tracks gestures, uses Canvas, crops pixels, generates a file, or uploads. A source is rendered only together with caller-supplied alternative text; applications own image selection, actual crop processing, and all resulting files.

它绝不打开图片 chooser、不读取图片字节、不追踪手势、不使用 Canvas、不裁剪像素、不生成文件，也不上传。图片源只有与调用方提供的替代文字一起才会渲染；应用拥有图片选择、实际裁剪处理和所有结果文件。
