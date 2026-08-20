# UActionSheet component contract / UActionSheet 组件契约

> Status / 状态：Private pre-release caller-controlled local action sheet. / 私有预发布调用方受控局部操作 sheet。

`UActionSheet` renders caller-owned `visible` or migration `modelValue`, optional title/default-slot content, finite `items`, optional selected-state copy, and optional cancel text. An explicitly supplied `visible` wins. Each item keeps only a visible `label`/`text`, transparent `value`, `disabled`, and `selected` state; callback, URL, command, and business fields are never executed.

`UActionSheet` 呈现调用方拥有的 `visible` 或迁移 `modelValue`、可选标题/默认 slot 内容、有限 `items`、可选选中状态文案与可选取消文字。显式提供的 `visible` 优先。每个 item 只保留可见 `label`/`text`、透明 `value`、`disabled` 与 `selected` 状态；绝不执行 callback、URL、command 或业务字段。

`selected: true` is accepted only from an own Boolean data property. If several safely rendered items declare it, only the first is projected as current; later declarations remain ordinary enabled or disabled items. The current native button uses `aria-pressed="true"`, an independent visible check, selected styling, and caller-provided `selectedText` when nonempty. Other item buttons use `aria-pressed="false"`. The check and status copy never enter the item label, value, or event payload, and no `aria-selected` attribute is placed on a button.

`selected: true` 只接受自有 Boolean data property。多个可安全渲染的 item 同时声明时，仅首项投影为当前项；后续声明仍是普通 enabled 或 disabled item。当前原生按钮使用 `aria-pressed="true"`、独立可见勾选、选中样式，并在非空时呈现调用方提供的 `selectedText`；其他 item 按钮使用 `aria-pressed="false"`。勾选与状态文案不会进入 item label、value 或事件 payload，也不会在 button 上放置 `aria-selected`。

An eligible item emits `select({ value, index })` and then migration `click(index)` without closing the sheet. An eligible cancel, opt-in mask close, or component-ref `close()` emits `update:modelValue(false)` and then `close(rawEvent, reason)`, where `reason` is `cancel`, `mask`, or `programmatic`. The caller owns every writeback and follow-up action.

符合条件的 item 会依次 emit `select({ value, index })` 与迁移事件 `click(index)`，但不会关闭 sheet。符合条件的取消、显式开启的遮罩关闭或组件 ref `close()` 会依次 emit `update:modelValue(false)` 与 `close(rawEvent, reason)`；`reason` 为 `cancel`、`mask` 或 `programmatic`。全部写回和后续 action 都由调用方拥有。

The component creates no portal, router, permission check, async provider, command executor, or global service. The root namespace is `u-action-sheet` and consumes `--u-comp-action-sheet-*`.

组件不创建 portal、router、权限判断、异步 provider、命令执行器或全局服务。根命名空间为 `u-action-sheet`，消费 `--u-comp-action-sheet-*`。

The tokenized bottom panel has rounded upper corners, a bounded viewport height, a native vertical scroll region for the finite slot/items, and CSS safe-area bottom padding. Its default modal layer is above persistent local tab surfaces while remaining below higher feedback/portal layers. The title, cancel control, and safe-area padding remain outside item scrolling. Native item and cancel buttons inherit the caller's font family.

Token 化底部 panel 具有顶部圆角、受限视口高度、承载有限 slot/items 的原生纵向滚动区以及 CSS 底部安全区 padding。默认 modal 层高于持久局部 tab 表面，同时低于更高的 feedback/portal 层。标题、取消 control 与安全区 padding 不随 item 滚动。原生 item 与 cancel button 继承调用方字体族。

This bounded presentation does not provide a portal, focus trap or restoration, Escape handling, page-scroll locking, device-inset measurement, or certified screen-reader/platform support. CSS safe-area and scroll behavior still require validation on each claimed target; `aria-pressed` supplements, rather than replaces, the visible check and status copy.

该受限呈现不提供 portal、焦点圈定或恢复、Escape 处理、页面滚动锁、设备 inset 测量，也不宣称已经获得读屏或平台支持认证。CSS 安全区与滚动行为仍须在各目标端验证；`aria-pressed` 只是可见勾选与状态文案的补充，而不是替代。

Disabled items retain the native `disabled` attribute and mirror the same normalized Boolean state through an internal `u-action-sheet__item--disabled` class. The class replaces an attribute-selector styling dependency for Mini Program compiler compatibility; it adds no public prop, event, or behavioral difference.

禁用条目保留原生 `disabled` attribute，并通过内部 `u-action-sheet__item--disabled` 类镜像同一规范化 Boolean 状态。该类替代 attribute selector 样式依赖以兼容小程序编译器；它不增加公开 prop、事件或行为差异。

An own data `value` remains transparent even when it is explicitly `undefined`, `null`, or an opaque object. A genuinely absent or accessor-backed `value` falls back to the readable label without executing a getter. Selection still emits the normalized visible index and never closes the sheet automatically.

自有 data `value` 即使显式为 `undefined`、`null` 或不透明对象也保持透明。真正缺失或由 accessor 提供的 `value` 会在不执行 getter 的前提下回退到可读 label。选择仍发出规范化可见索引，也不会自动关闭 sheet。
