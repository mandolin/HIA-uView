# UCarKeyboard component contract / UCarKeyboard 组件契约

`UCarKeyboard` projects up to four caller-owned rows of readable keys and optional caller-controlled phase switching. It reports `input`, `backspace`, `confirm`, and `phase-change` intent without changing a phase or input model.

`UCarKeyboard` 投影最多四行调用方拥有的可读键，并支持可选的调用方受控 phase 切换。它报告 `input`、`backspace`、`confirm` 与 `phase-change` 意图，但不改变 phase 或输入模型。

Its migration-oriented name does not add province/region keys, vehicle rules, identity fields, randomization, long-press deletion, timers, icons, or default user-facing copy. The application owns rows, phases, labels, formatting, and all follow-up behavior.

面向迁移的名称不增加省份/地区键、车辆规则、身份字段、随机化、长按删除、计时器、图标或默认用户可见文案。应用拥有键行、phase、标签、格式化和全部后续行为。
