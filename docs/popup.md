# UPopup component contract / UPopup 组件契约

> Status / 状态：Private pre-release controlled local overlay. / 私有预发布受控局部浮层。

`UPopup` renders caller-owned content with finite `placement`, optional title/close text, and a local mask. An explicitly supplied `visible` wins; otherwise migration `modelValue` and `show` are combined as `modelValue || show`. These aliases are intentionally bounded and must not be supplied with conflicting meanings.

`UPopup` 使用有限 `placement`、可选标题/关闭文字和局部遮罩呈现调用方内容。显式提供的 `visible` 优先；否则由 `modelValue || show` 控制呈现。这些迁移别名刻意受限，不应以冲突含义同时提供。

An eligible control, mask, or component-ref `close()` call emits `update:modelValue(false)` first and then `close(rawEvent, reason)`. `reason` is one of `control`, `mask`, or `programmatic`; the programmatic path has no raw event. The caller still owns all prop writeback. `open` reports only a mounted false-to-true transition, not the initial visible render.

符合条件的关闭控件、遮罩或组件 ref `close()` 调用会先 emit `update:modelValue(false)`，再 emit `close(rawEvent, reason)`。`reason` 只可能是 `control`、`mask` 或 `programmatic`；命令式路径没有原始事件。全部 prop 写回仍由调用方拥有。`open` 只报告挂载后的 false-to-true 转换，不报告初始可见渲染。

Mask closing is opt-in through `maskClosable`. The component does not auto-write props, trap or restore focus, lock scrolling, move content to another root, navigate, or create a global service. The root namespace is `u-popup` and consumes `--u-comp-popup-*`.

遮罩关闭必须通过 `maskClosable` 显式开启。组件不自动写入 prop、不管理焦点陷阱或恢复、不锁定滚动、不把内容移动到其他根、不导航，也不创建全局服务。根命名空间为 `u-popup`，消费 `--u-comp-popup-*`。
