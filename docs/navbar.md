# UNavbar component contract / UNavbar 组件契约

`UNavbar` renders caller-owned title, left/right text or slots, and emits `left-click`/`right-click` intent. Its default slot may replace only the central title projection; without that slot, the caller title remains visible. It does not inspect a page stack, read a system bar, or call router/UniApp navigation APIs.

`UNavbar` 渲染调用方拥有的标题、左右文字或插槽，并 emit `left-click`/`right-click` 意图。其默认 slot 只能替换中央标题投影；未提供该 slot 时调用方标题保持可见。它不检查页面栈、不读取系统栏，也不调用 router/UniApp 导航 API。

`UNavbar` coexists with the earlier `UNavBar`; their event names and contracts intentionally remain distinct rather than being aliases.

`UNavbar` 与既有 `UNavBar` 并存；两者事件名和契约刻意保持不同，而非互为 alias。
