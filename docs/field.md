# UField component contract / UField 组件契约

> Status / 状态：Private pre-release contract. Independent implementation, Vue runtime behavior tests, and an `mp-weixin` compile fixture exist; `UField` remains a private, unpublished package API.
> 私有的预发布契约。独立实现、Vue runtime 行为测试和 `mp-weixin` 编译 fixture 已存在；`UField` 仍是私有、未发布的包 API。

`UField` is a proposed presentational field structure for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It presents caller-owned label, required indication, help text, and validation display around a default-slot control. It does not own a form model, validation rule, validator lifecycle, submission, identity, backend, or business field definition.

`UField` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的展示型字段结构组件候选。它围绕默认插槽中的控件展示调用方自有的标签、必填提示、帮助文字和校验显示。它不拥有表单模型、校验规则、validator 生命周期、提交、身份、后端或业务字段定义。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Caller-owned visible field label. Applications must supply a meaningful non-empty label for every input control. / 调用方自有的可见字段标签。应用必须为每个输入控件提供有意义的非空标签。 |
| `required` | `boolean` | `false` | Adds a visible required marker only. It does not create native form semantics or execute a required-value rule. / 仅增加可见必填标记；它不创建原生表单语义或执行必填值规则。 |
| `helpText` | `string` | `''` | Optional caller-owned guidance shown below the control context. / 显示在控件上下文下方的可选调用方自有指引。 |
| `validationState` | `'idle' \| 'validating' \| 'error'` | `'idle'` | Caller-declared presentation state passed to `UValidationMessage`; it is not a validation engine state machine. / 传递给 `UValidationMessage` 的调用方声明式呈现状态；它不是校验引擎状态机。 |
| `validationMessage` | `string` | `''` | Caller-owned localized validation text. It is shown only with a non-idle validation state. / 调用方自有的本地化校验文字；仅在非 idle 校验状态下显示。 |

`UField` has one default slot for the application-owned control, such as `UInput`. The slot remains responsible for its own value, disabled state, native attributes, and events. `UField` emits no events and does not intercept or transform the slotted control's events.

`UField` 有一个用于应用自有控件（例如 `UInput`）的默认插槽。该插槽仍自行负责其值、禁用状态、原生属性和事件。`UField` 不触发事件，也不拦截或转换插槽控件的事件。

The `label` and `required` props are presentation-compatible with their recorded upstream names only. They do not turn `UField` into a controlled input, forward `disabled` or `readonly`, or expose upstream input/confirm/click events.

`label` 和 `required` 属性仅在呈现意义上与已记录的上游名称兼容。它们不会将 `UField` 变成受控输入、转发 `disabled` 或 `readonly`，也不会暴露上游的输入/确认/点击事件。

## Composition and validation boundary / 组合与校验边界

The proposed structure renders the visible label and optional required marker before the default slot, retains optional help text, and composes `UValidationMessage` below it. A validation message is visible only when `validationState` is `validating` or `error` and `validationMessage` is non-empty. The application chooses whether and when to change these props, including all asynchronous validation, cancellation, retry, submission, and error-recovery behavior.

计划中的结构会在默认插槽前渲染可见标签和可选必填标记，保留可选帮助文字，并在其下组合 `UValidationMessage`。仅当 `validationState` 为 `validating` 或 `error` 且 `validationMessage` 非空时，校验消息才可见。应用自行选择是否以及何时改变这些 prop，并拥有全部异步校验、取消、重试、提交和错误恢复行为。

The component never evaluates rules, accepts validator functions, serializes slot values, performs a submit/reset action, invokes a request, reads identity, creates a route, or writes storage. A visible required marker is informative presentation, not proof that a submission would be rejected.

该组件绝不执行规则、接受 validator 函数、序列化插槽值、执行 submit/reset 操作、发起请求、读取身份、创建路由或写入存储。可见必填标记属于提示性呈现，而不是提交必定被拒绝的证明。

## Theme and customization / 主题与定制

The root namespace is `u-field`. The planned implementation consumes `--u-comp-field-*` tokens for label, required marker, help text, vertical spacing, and future focus context. Validation-message colors and state treatment remain in the independent `--u-comp-validation-message-*` token family. Consumers must not rely on deep selectors or raw status colors.

根命名空间为 `u-field`。计划实现消费 `--u-comp-field-*` token，用于标签、必填标记、帮助文字、纵向间距和后续焦点上下文。校验消息的颜色与状态样式仍属于独立的 `--u-comp-validation-message-*` token 族。使用者不得依赖深层选择器或原始状态颜色。

## Accessibility and platform disclosure / 无障碍与平台披露

The field label, required mark, help text, and validation message are visible text; required and validation states must not rely only on color. The initial component does not claim native `for`/`id` linkage, ARIA behavior, screen-reader announcement, keyboard traversal, accessibility-tree linkage, WeChat DevTools, or device validation. Applications remain responsible for meaningful labels and for platform-specific semantics outside this contract.

字段标签、必填标记、帮助文字和校验消息均为可见文字；必填和校验状态不能只依靠颜色表达。初始组件不承诺原生 `for`/`id` 关联、ARIA 行为、读屏播报、键盘遍历、无障碍树关联、微信开发者工具或真机验证。应用仍需负责有意义的标签以及本文契约外的平台专属语义。

## Required fixtures / 实现必需 fixture

Before release, fixtures must expand to cover label-only structure, required indication, help text, a slotted controlled input, idle/no-message output, validating/message output, error/message output, empty-message suppression, long Chinese/English labels/messages, and the absence of events, rule execution, submission, storage, request, or backend behavior.

发布前，fixture 必须扩展覆盖仅标签结构、必填提示、帮助文字、插槽化受控输入、idle/无消息输出、validating/消息输出、error/消息输出、空消息抑制、较长的中英文标签/消息，以及不存在事件、规则执行、提交、存储、请求或后端行为。
