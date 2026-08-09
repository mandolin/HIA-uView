# UNoticeBar component contract / UNoticeBar 组件契约

`UNoticeBar` displays caller-owned visible text, finite tone, and optional labeled `click`/`close` intents. `show` retains the familiar boolean default `true`; the existing HIA `visible` alias wins only when explicitly provided. It never scrolls, rotates, times, auto-dismisses, navigates, or operates a feedback queue.

`UNoticeBar` 显示调用方拥有的可见文字、有限 tone 和可选带文字的 `click`/`close` 意图。`show` 保留熟悉的布尔默认值 `true`；既有 HIA `visible` alias 仅在显式提供时优先。它绝不滚动、轮播、计时、自动消失、导航或操作反馈队列。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Boundary / 边界 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | Local display request only / 仅为局部显示请求 |
| `visible` | `boolean` | `undefined` | Explicit HIA alias that overrides `show` / 显式 HIA alias，覆盖 `show` |
| `text` | `string` | `''` | Caller-provided localized body / 调用方提供的本地化正文 |
| `tone` | finite string / 有限字符串 | `info` | Presentation token only / 仅为呈现 token |
| `closeText` | `string` | `''` | Creates the optional labeled close control / 创建可选带文字的关闭控件 |

`click` returns the local platform click observation from the banner text; it does not provide the upstream scrolling-list index. `close` returns the local close intent. Both events are mapped migration aids rather than a claim of full upstream notice-bar behavior.

`click` 返回横幅文字的本地平台点击观察，不提供上游滚动列表索引；`close` 返回本地关闭意图。两个事件均是迁移辅助映射，不代表完整上游 notice-bar 行为。

It is a banner surface that coexists with inline `UNotice`; callers own all localized copy and feedback outcomes.

它是与 inline `UNotice` 并存的横幅表面；调用方拥有全部本地化文案与反馈结果。
