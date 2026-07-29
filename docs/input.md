# UInput component contract / UInput 组件契约

> Status / 状态：Private pre-implementation contract. `UInput` is not yet a runtime export or a published package API.
> 私有的实现前契约。`UInput` 尚不是 runtime 导出或已发布的包 API。

`UInput` is a proposed controlled single-line text input for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It renders caller-owned text state and reports local input intent back to the caller. It does not own a form model, validation rule, asynchronous work, submission, navigation, persistence, or analytics.

`UInput` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的受控单行文本输入组件候选。它渲染调用方自有的文字状态，并将本地输入意图回传给调用方。它不拥有表单模型、校验规则、异步工作、提交、导航、持久化或分析行为。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Controlled visible value. The caller updates it after receiving an event; the component never mutates, trims, formats, stores, or validates it. / 受控的可见值。调用方在接收事件后更新它；组件绝不修改、裁剪、格式化、存储或校验它。 |
| `placeholder` | `string` | `''` | Caller-owned native input hint. It is not a replacement for a visible field label. / 调用方自有的原生输入提示；它不能替代可见字段标签。 |
| `disabled` | `boolean` | `false` | Makes the native input unavailable and defensively suppresses all component input/focus/blur emissions. / 使原生输入不可用，并防御性地抑制所有组件的输入、聚焦和失焦事件。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `update:modelValue` | `value: string` | Emits the unmodified next text value once for each enabled native input event. / 每次启用状态的原生输入事件恰好触发一次未经修改的下一文字值。 |
| `input` | `value: string` | Emits the same unmodified value after `update:modelValue`, so callers may observe intent without treating the component as a validator. / 在 `update:modelValue` 后触发相同的未修改值，使调用方能够观察意图而不把组件当作校验器。 |
| `focus` | native platform event | Emits once for an enabled focus event. / 对一次启用状态的聚焦事件恰好触发一次。 |
| `blur` | native platform event | Emits once for an enabled blur event. / 对一次启用状态的失焦事件恰好触发一次。 |

The component expects a string `modelValue`. Callers that use nullable, numeric, masked, or domain-specific values must adapt those values outside the component and own the resulting validation and error semantics.

组件期望 `modelValue` 为字符串。使用可空、数字、掩码或领域专属值的调用方必须在组件外完成适配，并自行拥有相应的校验和错误语义。

## Controlled-value and interaction boundary / 受控值与交互边界

The rendered value always comes from the latest `modelValue` prop. A native input event reports a candidate string, but does not update the display permanently unless the caller supplies the new prop value. This deliberately avoids hidden form state and keeps asynchronous validation, rollback, and submission policy in the application.

渲染值始终来自最新的 `modelValue` prop。原生输入事件只报告候选字符串；除非调用方提供新的 prop 值，否则它不会永久更新显示。该设计有意避免隐藏表单状态，并将异步校验、回滚和提交策略保留在应用中。

When `disabled` is true, the native control is disabled and the component emits none of the four documented events, including when a test or non-native caller invokes a handler directly. `UInput` does not create a `change` abstraction, automatic focus, debounce, throttle, maximum-length policy, password/payment mode, multiline mode, or native form capability proxy.

当 `disabled` 为真时，原生控件被禁用，并且组件不触发四个已文档化事件中的任何一个，包括测试或非原生调用方直接调用 handler 的情形。`UInput` 不创建 `change` 抽象、自动聚焦、防抖、节流、最大长度策略、密码/支付模式、多行模式或原生表单能力代理。

## Theme and customization / 主题与定制

The root namespace is `u-input`. The planned implementation consumes the following component-token family and does not expose raw colors, arbitrary inline styles, deep-selector customization, or an upstream `type` compatibility layer.

根命名空间为 `u-input`。计划实现消费下列组件 token 族，不暴露原始颜色、任意内联样式、深层选择器定制或上游 `type` 兼容层。

| Token family / Token 族 | Purpose / 用途 |
| --- | --- |
| `--u-comp-input-surface`, `--u-comp-input-foreground`, `--u-comp-input-placeholder-foreground` | Visible text-input surface and text hierarchy. / 可见文本输入表面与文字层级。 |
| `--u-comp-input-border`, `--u-comp-input-disabled-border` | Resting and disabled boundary treatment. / 静止与禁用边界样式。 |
| `--u-comp-input-disabled-foreground`, `--u-comp-input-disabled-opacity` | Non-color disabled differentiation. / 非颜色的禁用区分。 |
| `--u-comp-input-min-height`, `--u-comp-input-inline-padding`, `--u-comp-input-block-padding`, `--u-comp-input-radius`, `--u-comp-input-font-size` | Density and readable touch/typing geometry. / 密度以及可读的触控/输入几何。 |
| `--u-comp-input-focus-ring` | Future focus treatment only where the platform exposes a verifiable focus state. / 仅在平台暴露可验证焦点状态时使用的后续焦点样式。 |

## Accessibility and platform disclosure / 无障碍与平台披露

The caller must provide a visible label, normally by composing `UInput` inside `UField`; placeholder text alone is not an accessible label. Disabled treatment must remain distinguishable without color alone. WCAG 2.2 AA is the acceptance target for controllable visual behavior, not a device or mini-program conformance certification.

调用方必须提供可见标签，通常通过将 `UInput` 组合在 `UField` 内实现；placeholder 文字本身不是无障碍标签。禁用样式必须不只依靠颜色仍可区分。WCAG 2.2 AA 是可控视觉行为的验收目标，不是设备或小程序符合性认证。

The initial `mp-weixin` evidence will cover component compilation and Vue runtime behavior only. Keyboard focus, screen-reader semantics, accessibility-tree linkage, native IME behavior, WeChat DevTools, physical devices, App, H5, and other mini-program targets are not independently verified and are not promised by this contract.

初始 `mp-weixin` 证据只覆盖组件编译和 Vue runtime 行为。键盘焦点、读屏语义、无障碍树关联、原生输入法行为、微信开发者工具、真机、App、H5 和其他小程序目标尚未独立验证，本文不作相关承诺。

## Required fixtures / 实现必需 fixture

Before implementation evidence is accepted, fixtures must cover a caller-controlled initial value, a next-value event pair in documented order, disabled zero events, focus/blur intent, an empty and a long Chinese/English placeholder, and composition with a visible `UField` label. Static checks must confirm that the component contains no validator, submit, request, storage, route, native `open-type`, or value-logging behavior.

在接受实现证据前，fixture 必须覆盖调用方受控的初始值、按文档顺序触发的下一值事件对、禁用时零事件、聚焦/失焦意图、空及较长的中英文 placeholder，以及与可见 `UField` 标签的组合。静态检查必须确认组件不包含 validator、submit、请求、存储、路由、原生 `open-type` 或值日志行为。
