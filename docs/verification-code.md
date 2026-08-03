# UVerificationCode component contract / UVerificationCode 组件契约

`UVerificationCode` displays caller-owned status and remaining-copy snapshots and emits a `request` intent only when the caller explicitly enables a labeled request control. The event returns the current bounded remaining-seconds snapshot for transparent application handling.

`UVerificationCode` 显示调用方拥有的状态和剩余时间文字快照，并且仅当调用方显式启用带标签的请求 control 时 emit `request` 意图。事件返回当前受限剩余秒数快照，供应用透明处理。

It does not send a code, start or decrement a countdown, read/write storage, call a network endpoint, inspect identity, or infer cooldown eligibility from a number. The caller owns all localized copy, request eligibility, sending, timers, feedback, and persistence.

它不发送验证码、不启动或递减倒计时、不读写 storage、不调用网络 endpoint、不检查身份，也不从数字推断冷却资格。调用方拥有全部本地化文案、请求资格、发送、计时器、反馈和持久化。
