# URate component contract / URate 组件契约

`URate` renders a finite integer level with caller-owned text symbols. It does not submit reviews, calculate scores, load icon/font/image assets, or assign business meaning.

`URate` 使用调用方拥有的文字符号渲染有限整数级别。它不提交评价、不计算分数、不加载图标/字体/图片资产，也不赋予业务含义。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `number` | `0` | Controlled value when `current` is omitted. / 省略 `current` 时的受控值。 |
| `current` | `number` | `undefined` | Explicit presentation alias; even `0` or an invalid number takes precedence over `modelValue`. / 显式呈现 alias；即使为 `0` 或非法 number，也优先于 `modelValue`。 |
| `count` | `number` | `5` | Positive finite input is floored; every other value produces one symbol. / 正有限输入向下取整；其他值均生成一个符号。 |
| `disabled` | `boolean` | `false` | Blocks selection. / 阻止选择。 |
| `activeSymbol` / `inactiveSymbol` | `string` | `★` / `☆` | Caller-owned visible symbols. / 调用方拥有的可见符号。 |

Presentation floors a finite selected value and clamps it to `0..count`. An explicitly invalid `current` presents `0` and never falls back to `modelValue`; out-of-range input produces no corrective event. This is an integer-only contract and includes no half-level behavior.

呈现时会把有限选中值向下取整，并 clamp 到 `0..count`。显式非法 `current` 呈现为 `0`，绝不回退到 `modelValue`；越界输入不会产生修正事件。本契约只提供整数级别，不包含半级行为。

Selecting an enabled position emits `update:modelValue(value)`, then `input(value)`, then `change(value)`. `current` itself is never mutated. A deliberate selection emits even when the position equals the current model; disabled interaction emits nothing.

选择 enabled 位置时会依次 emit `update:modelValue(value)`、`input(value)` 与 `change(value)`。`current` 本身绝不被修改。即使位置等于当前 model，显式选择仍会 emit；disabled 交互不 emit 事件。

The root namespace is `u-rate` and consumes `--u-comp-rate-*`. WCAG 2.2 AA visual distinction is the target; screen-reader announcement, device behavior, and cross-platform support remain unverified.

根命名空间为 `u-rate`，消费 `--u-comp-rate-*`。WCAG 2.2 AA 视觉区分是目标；读屏播报、真机行为和跨端支持仍未验证。
