# UNoticeBar component contract / UNoticeBar 组件契约

`UNoticeBar` displays caller-owned text, finite tone, and optional labeled click/close intents. `show` defaults to true, while an explicitly supplied HIA `visible` alias wins. A nonempty migration `list` takes priority over `text`; `current` selects its finite index, with invalid values deterministically falling back to the first item.

`UNoticeBar` 显示调用方拥有的文字、有限 tone 与可选带标签 click/close 意图。`show` 默认值为 true，而显式提供的 HIA `visible` 别名优先。非空迁移 `list` 优先于 `text`；`current` 选择其有限索引，无效值确定性回退到首项。

`click` returns the local platform click observation as its first argument and appends the projected index as its second. `close` preserves the raw event. Neither event writes visibility, advances `current`, navigates, or changes a queue.

`click` 保留原始平台事件为第一参数，并追加当前投影索引为第二参数。`close` 保留原始事件。两个事件都不写入可见性、不推进 `current`、不导航，也不修改队列。

The banner never scrolls, rotates, times, auto-dismisses, loads notifications, or operates a global feedback service. It coexists with the separate inline `UNotice` contract.

横幅绝不滚动、轮播、计时、自动消失、加载通知或操作全局反馈服务。它与独立 inline `UNotice` 契约并存。
