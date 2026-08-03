# UKeyboard component contract / UKeyboard 组件契约

`UKeyboard` is a caller-controlled local overlay composition for `number` or `car` key data. It forwards `input`, `backspace`, `confirm`, `phase-change`, and, when explicitly authorized through a closable local mask, `close` intent.

`UKeyboard` 是一个由调用方受控的局部 overlay 组合，用于 `number` 或 `car` 键数据。它转发 `input`、`backspace`、`confirm`、`phase-change`，并且仅在显式授权可关闭局部 mask 时转发 `close` 意图。

It is not a global keyboard service: it does not discover focus, invoke a system keyboard, own locale, change input values, submit forms, navigate, or create default title/action/key copy. The caller supplies the finite key data, all copy, visibility, mask permission, and follow-up state changes.

它不是全局键盘 service：不会发现焦点、调用系统键盘、拥有 locale、改变输入值、提交表单、导航或生成默认标题/操作/键文案。调用方提供有限键数据、全部文案、可见性、mask 权限和后续状态变化。
