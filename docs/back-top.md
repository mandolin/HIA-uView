# UBackTop component contract / UBackTop 组件契约

`UBackTop` renders a caller-controlled, labeled local intent control. `visible`, `label`, and `disabled` are caller-owned; a valid click emits `back-top`. It observes no scroll container and performs no scrolling.

`UBackTop` 呈现调用方控制、带文字的本地意图控件。`visible`、`label` 与 `disabled` 归调用方所有；有效点击 emit `back-top`。它不观察滚动容器，也不执行滚动。

An empty label renders no control. The component is not a fixed viewport control and does not promise device scrolling behavior.

空 label 不渲染控件。组件不是固定视口控件，也不承诺设备滚动行为。
