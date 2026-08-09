# UTextarea component contract / UTextarea 组件契约

> Status / 状态：Private pre-release contract for the `mp-weixin` profile. The implementation is independent and controlled by the caller.
> `mp-weixin` profile 的私有预发布契约。实现为独立实现，状态由调用方控制。

`UTextarea` renders a caller-owned multiline string through the native `textarea` surface and reports local input, focus, blur, and confirm intent. It does not validate, submit, persist, request, or format the value.

`UTextarea` 通过原生 `textarea` 呈现调用方拥有的多行字符串，并回传输入、聚焦、失焦和确认意图。它不校验、提交、持久化、请求或格式化值。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Controlled visible text; the caller writes back after `update:modelValue`. / 受控可见文字；调用方在 `update:modelValue` 后写回。 |
| `placeholder` | `string` | `''` | Caller-owned hint, not a replacement for a visible label. / 调用方拥有的提示文字，不能替代可见标签。 |
| `disabled` / `readonly` | `boolean` | `false` | Native availability plus defensive event suppression for editing intent. / 原生可用性及对编辑意图的防御性事件抑制。 |
| `maxlength` | `number` | `140` | Native presentation constraint only; the component does not truncate. / 仅为原生呈现约束，组件不截断。 |
| `autoHeight` / `focus` / `showCount` | `boolean` | `false` | Caller-selected native presentation options. / 调用方选择的原生呈现选项。 |

Events are `update:modelValue`, `input`, `change`, `focus`, `blur`, `confirm`, and `click`. The first three carry the same unmodified string; focus/blur/confirm/click carry local intent and never mean validation or submission.

事件包括 `update:modelValue`、`input`、`change`、`focus`、`blur`、`confirm` 和 `click`。前三个事件携带同一未修改字符串；聚焦/失焦/确认/点击只携带本地意图，不表示校验或提交。

## Boundaries, theme, and accessibility / 边界、主题与无障碍

The root namespace is `u-textarea` and the component consumes `--u-comp-textarea-*` tokens. Compose it with `UField` for a visible label. WCAG 2.2 AA is the visual acceptance target; keyboard, screen-reader, accessibility-tree, DevTools, device, App, and H5 behavior are not independently certified.

根命名空间为 `u-textarea`，组件消费 `--u-comp-textarea-*` token。应与 `UField` 组合以提供可见标签。WCAG 2.2 AA 是视觉验收目标；键盘、读屏、无障碍树、开发者工具、真机、App 和 H5 行为尚未独立认证。
