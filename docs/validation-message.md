# UValidationMessage component contract / UValidationMessage 组件契约

> Status / 状态：Private pre-implementation contract. `UValidationMessage` is not yet a runtime export or a published package API.
> 私有的实现前契约。`UValidationMessage` 尚不是 runtime 导出或已发布的包 API。

`UValidationMessage` is a proposed independent validation-status display for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It presents an application-declared state and application-owned message. It does not infer validity, execute a validator, generate a default message, initiate asynchronous work, or submit data.

`UValidationMessage` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的独立校验状态展示组件候选。它呈现应用声明的状态和应用自有消息。它不推断有效性、不执行 validator、不生成默认消息、不发起异步工作，也不提交数据。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `state` | `'idle' \| 'validating' \| 'error'` | `'idle'` | Caller-declared visual state. `idle` means no validation message is rendered; it does not prove that a value is valid. / 调用方声明的视觉状态。`idle` 表示不渲染校验消息；它不证明某个值有效。 |
| `message` | `string` | `''` | Caller-owned, already localized visible message. It is never transformed, translated, cached, logged, or sent anywhere. / 调用方自有的、已本地化的可见消息。它绝不被转换、翻译、缓存、记录或发送到任何位置。 |

The component has no events and no slots in this first contract. It renders only when `state` is `validating` or `error` and `message` is non-empty. This intentionally requires the caller to make every visible validation statement explicit.

首个契约中组件没有事件和插槽。仅当 `state` 为 `validating` 或 `error` 且 `message` 非空时才渲染。该设计有意要求调用方明确提供每一条可见校验陈述。

## State boundary / 状态边界

| State / 状态 | Rendering / 渲染 | Meaning / 含义 |
| --- | --- | --- |
| `idle` | Renders nothing, even if a caller accidentally supplies `message`. / 即使调用方误传 `message` 也不渲染。 | No active display request; not a validity assertion. / 没有活动的展示请求；不是有效性断言。 |
| `validating` | Renders the caller-provided `message` with validating treatment. / 以 validating 样式渲染调用方提供的 `message`。 | The application reports an in-progress validation state; the component does no asynchronous work. / 应用报告校验进行中状态；组件不执行异步工作。 |
| `error` | Renders the caller-provided `message` with error treatment. / 以 error 样式渲染调用方提供的 `message`。 | The application reports a validation error; the component does not classify or recover from it. / 应用报告校验错误；组件不分类或恢复错误。 |

The first contract deliberately has no `success`, `warning`, or generic notification state. It does not model validator promises, cancellation, timing, retries, field values, error codes, backend responses, or a form lifecycle.

首个契约有意不包含 `success`、`warning` 或通用通知状态。它不建模 validator promise、取消、时序、重试、字段值、错误码、后端响应或表单生命周期。

## Theme, locale, and customization / 主题、语言与定制

The root namespace is `u-validation-message`. The planned implementation consumes `--u-comp-validation-message-*` tokens for validating/error foreground, non-color state marker, spacing, font size, and future focus context. It does not expose raw colors, arbitrary inline styles, deep-selector customization, or a component-owned translation key.

根命名空间为 `u-validation-message`。计划实现消费 `--u-comp-validation-message-*` token，用于 validating/error 前景色、非颜色状态标记、间距、字号和后续焦点上下文。它不暴露原始颜色、任意内联样式、深层选择器定制或组件自有翻译 key。

Runtime locale is intentionally caller-owned in this first contract: the component creates no fallback text such as “validating” or “invalid.” Documentation and source annotations remain bilingual, while visible runtime text remains the application's responsibility.

首个契约有意让 runtime 语言由调用方拥有：组件不生成诸如“校验中”或“无效”的回退文字。文档和源码注释保持中英双语，而可见 runtime 文字仍由应用负责。

## Accessibility and platform disclosure / 无障碍与平台披露

Each non-idle visible state must include caller-provided text and a non-color marker/treatment; color alone must not convey the state. The contract makes no ARIA live-region, screen-reader announcement, accessibility-tree, keyboard, WeChat DevTools, physical-device, App, H5, or cross-platform guarantee. WCAG 2.2 AA remains an acceptance target for controllable visual behavior rather than a platform certification.

每个非 idle 的可见状态都必须包含调用方提供的文字和非颜色标记/样式；状态不能只由颜色表达。本文契约不承诺 ARIA live region、读屏播报、无障碍树、键盘、微信开发者工具、真机、App、H5 或跨端能力。WCAG 2.2 AA 仍是可控视觉行为的验收目标，而非平台认证。

## Required fixtures / 实现必需 fixture

Before implementation evidence is accepted, fixtures must cover idle suppression with and without a message, validating and error messages, state-specific non-color treatment, long Chinese/English messages, composition inside `UField`, zero events, and static confirmation that no rule, validator, request, storage, logging, navigation, or backend behavior is present.

在接受实现证据前，fixture 必须覆盖有/无消息时的 idle 抑制、validating 与 error 消息、状态专属的非颜色样式、较长的中英文消息、在 `UField` 内组合、零事件，以及静态确认不存在 rule、validator、请求、存储、日志、导航或后端行为。
