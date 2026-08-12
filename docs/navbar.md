# UNavbar component contract / UNavbar 组件契约

`UNavbar` renders caller-owned visibility, title, side text, and slots, and emits only `left-click(rawEvent)` or `right-click(rawEvent)` intent. `leftText` has priority; migration `backText` is used only when `leftText` is empty. `isBack` controls only the built-in left text control and never suppresses an explicitly supplied `left` slot.

`UNavbar` 呈现调用方拥有的可见性、标题、两侧文字与 slot，并且只 emit `left-click(rawEvent)` 或 `right-click(rawEvent)` 意图。`leftText` 优先；只有它为空时才使用迁移 `backText`。`isBack` 只控制内建左侧文字控件，绝不抑制显式提供的 `left` slot。

The default slot replaces the central title projection. `left` and `right` slots remain caller-owned. `disabled` suppresses built-in controls only. The component does not inspect a page stack, read system-bar geometry, add safe-area padding, or call router/UniApp navigation APIs.

默认 slot 替换中央标题投影；`left` 与 `right` slot 始终由调用方拥有。`disabled` 只抑制内建控件。组件不检查页面栈、不读取系统栏几何、不添加安全区 padding，也不调用 router/UniApp 导航 API。

`UNavbar` coexists with the earlier `UNavBar`; their contracts intentionally remain distinct rather than being aliases.

`UNavbar` 与既有 `UNavBar` 并存；两者契约刻意保持不同，而非互为 alias。
