# UMessageInput component contract / UMessageInput 组件契约

`UMessageInput` projects a caller-controlled string into one to eight cells behind an accessible native input. It emits `update:modelValue`, `input`, `focus`, and `blur` intent only while an application-supplied input label is present and the input is enabled.

`UMessageInput` 将调用方受控字符串投影为一至八个单元格，并保留带无障碍标签的原生输入入口。仅当应用提供输入标签且输入启用时，它才 emit `update:modelValue`、`input`、`focus` 与 `blur` 意图。

Masked display changes only the visible character projection. The component does not validate a code, send a message, start a countdown, manage platform keyboards, retain input state, authenticate an identity, or create default user-facing copy.

masked 显示只改变可见字符投影。组件不校验代码、不发送消息、不启动倒计时、不管理平台键盘、不保留输入状态、不认证身份，也不生成默认用户可见文案。
