# URadio component contract / URadio 组件契约

> Status / 状态：Private pre-release contract. The first implementation will target the private UniApp Vue 3 `mp-weixin` profile only.
> 私有预发布契约。首个实现只面向私有 UniApp Vue 3 `mp-weixin` 配置。

`URadio` presents one caller-owned option. It never stores selection, cancels an already selected radio, generates a label, opens a picker, or interprets a value as a route, business object, or backend field.

`URadio` 呈现一个调用方拥有的选项。它绝不存储选择、取消已选 radio、生成 label、打开 picker，或把 value 解释为 route、业务对象或后端字段。

## API / API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Caller-local option key; it is emitted unchanged. / 调用方本地选项键，原样 emit。 |
| `label` | `string` | `''` | Caller-owned visible text; empty label creates no fallback copy. / 调用方可见文字；空值不生成回退文案。 |
| `checked` | `boolean` | `false` | Independent controlled presentation state. Group context takes precedence when present. / 独立受控呈现状态；存在 group context 时由 group 优先。 |
| `disabled` | `boolean` | `false` | Suppresses local select intent. / 抑制本地 select 意图。 |

`URadio` emits `select(value)` only while enabled and not already selected. The parent decides writeback, validation, submit, close, navigation, request, and all follow-up flow.

`URadio` 仅在启用且未选中时 emit `select(value)`。父级决定写回、校验、提交、关闭、导航、请求及全部后续流程。

## Group composition / group 组合

Inside `URadioGroup`, `checked` derives from the caller-owned group `modelValue`, and `disabled` is effective when either the child or group is disabled. A child emits a pure select intent to the group; it does not mutate the group prop.

在 `URadioGroup` 内，`checked` 从调用方拥有的 group `modelValue` 派生；子项或 group 任一 disabled 时均为有效 disabled。子项向 group emit 纯 select 意图，不修改 group prop。

## Limits / 限制

No native picker, popup, keyboard claim, form rule, async validation, option data source, icon/image/font, accessibility-tree, DevTools, device, App, H5, or cross-platform guarantee is made. Visible label and non-color selected/disabled treatment are caller/component presentation concerns; WCAG 2.2 AA remains an acceptance target, not platform certification.

不提供 native picker、popup、键盘声明、表单规则、异步校验、选项数据源、图标/图片/字体、无障碍树、DevTools、真机、App、H5 或跨端保证。可见 label 及非颜色 selected/disabled 呈现属于调用方/组件的展示关注点；WCAG 2.2 AA 仍是验收目标，而非平台认证。
