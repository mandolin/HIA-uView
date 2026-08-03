# UNumberKeyboard component contract / UNumberKeyboard 组件契约

`UNumberKeyboard` renders a caller-owned, finite collection of readable keys and optional caller-labeled backspace and confirm controls. It emits `input`, `backspace`, and `confirm` intent but never concatenates or writes an input value itself.

`UNumberKeyboard` 渲染调用方拥有的有限可读键集合，以及可选的调用方标签化删除和确认 control。它 emit `input`、`backspace` 与 `confirm` 意图，但绝不自行拼接或写入输入值。

No key, action label, numeric format, money rule, ID rule, icon, long-press behavior, timer, or system-keyboard ownership is built in. Applications provide keys and all localized copy, then decide what each reported value means.

组件不内置键、操作标签、数值格式、金额规则、证件规则、图标、长按行为、计时器或系统键盘所有权。应用提供键和全部本地化文案，并决定每个已报告值的含义。
