# UNotice component contract / UNotice 组件契约

> Status / 状态：Private pre-implementation contract. `UNotice` is not yet a runtime export or a published package API.
> 私有的实现前契约。`UNotice` 尚不是 runtime 导出或已发布的包 API。

`UNotice` is a proposed controlled inline feedback display for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It shows caller-owned feedback text inside the current component tree. It is not a toast, global service, queue, timer, request result interpreter, or business notification center.

`UNotice` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的受控 inline feedback 展示组件候选。它在当前组件树内显示调用方自有反馈文字。它不是 toast、全局 service、队列、计时器、请求结果解释器或业务通知中心。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Caller-owned rendering state. Hidden notices render nothing and emit no dismiss intent. / 调用方自有的渲染状态。隐藏 notice 不渲染内容，也不触发 dismiss 意图。 |
| `tone` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Constrained presentation tone. Unsupported strings render as `info`; tone never infers a backend, validation, or business result. / 受限呈现语调。不支持的字符串按 `info` 渲染；tone 绝不推断后端、校验或业务结果。 |
| `message` | `string` | `''` | Caller-owned, already localized visible feedback text. It is not transformed, translated, cached, logged, or sent anywhere. / 调用方自有的、已本地化的可见反馈文字。它绝不被转换、翻译、缓存、记录或发送到任何位置。 |
| `dismissText` | `string` | `''` | Optional caller-owned visible label for a dismiss-intent control. Empty text renders no dismiss control. / dismiss 意图控件的可选调用方自有可见标签。空文字不会渲染 dismiss 控件。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `dismiss` | native platform event | Emits once only when `visible` is true and a non-empty `dismissText` control is activated. It never changes `visible`, starts a timer, or removes a notice from a queue. / 仅在 `visible` 为真且非空 `dismissText` 控件被激活时恰好触发一次。它绝不改变 `visible`、启动计时器或从队列移除 notice。 |

The first contract has no slots. It deliberately keeps message structure and feedback lifecycle explicit, rather than silently accepting arbitrary content or stateful service configuration.

首个契约没有插槽。它有意让消息结构和反馈生命周期保持明确，而不是静默接受任意内容或有状态的 service 配置。

## Tone, visibility, and lifecycle boundary / 语调、可见性与生命周期边界

The four tones are visual labels only. The planned implementation combines caller text, a non-color symbol marker, border treatment, and HIA-derived tokens; color alone never carries the tone. An unknown tone is normalized to `info` solely to retain a finite CSS class surface. It is not an error report or a mutation of the caller prop.

四种 tone 只是视觉标签。计划实现结合调用方文字、非颜色符号标记、边界样式和 HIA 派生 token；tone 绝不只由颜色表达。未知 tone 仅为保持有限 CSS 类表面而规范化为 `info`。它不是错误报告，也不修改调用方 prop。

`UNotice` never creates a global instance, teleports to a page root, chooses a duration, runs a timer, manages a queue, plays a transition, retries a request, reads data/identity, writes storage, or decides whether feedback should disappear. The application owns every lifecycle decision by changing props.

`UNotice` 绝不创建全局实例、teleport 到页面根、选择时长、运行计时器、管理队列、播放 transition、重试请求、读取数据/身份、写入存储或决定反馈是否应消失。应用通过改变 props 拥有每一个生命周期决定。

## Theme, locale, and customization / 主题、语言与定制

The root namespace is `u-notice`. The planned implementation consumes `--u-comp-notice-*` tokens for surface, foreground, marker, border, spacing, font size, and future focus treatment. Cobalt retains informational structure, cyan uses dark foreground for progress/success emphasis, and warning/error use visible symbols plus distinct boundary treatments without introducing an unapproved red semantic palette.

根命名空间为 `u-notice`。计划实现消费 `--u-comp-notice-*` token，用于表面、前景、标记、边界、间距、字号和后续焦点样式。钴蓝保留信息结构语义，清透青以深色前景承载进行/成功强调，warning/error 使用可见符号加不同边界样式，而不引入未审定的红色语义色板。

Runtime locale remains entirely caller-owned: no fallback messages, dismiss labels, translation keys, or automatic text are generated. Documentation and source annotations remain bilingual without prescribing application runtime language.

runtime 语言完全由调用方拥有：不生成回退消息、dismiss 标签、翻译 key 或自动文字。文档和源码注释保持中英双语，但不规定应用 runtime 语言。

## Accessibility and platform disclosure / 无障碍与平台披露

Every visible notice must have caller-provided text and a non-color tone marker/treatment. The contract makes no ARIA live-region, screen-reader announcement, accessibility-tree, keyboard, WeChat DevTools, physical-device, App, H5, animation, or cross-platform guarantee. WCAG 2.2 AA is an acceptance target for controllable visual behavior, not a platform certification.

每条可见 notice 都必须有调用方提供的文字和非颜色 tone 标记/样式。本文契约不承诺 ARIA live region、读屏播报、无障碍树、键盘、微信开发者工具、真机、App、H5、动画或跨端能力。WCAG 2.2 AA 是可控视觉行为的验收目标，而非平台认证。

## Required fixtures / 实现必需 fixture

Before implementation evidence is accepted, fixtures must cover hidden zero output/events, each supported tone with visible text and a non-color marker, unknown-tone normalization, optional dismiss intent, zero dismiss without control, long Chinese/English messages, and caller control of visibility. Static checks must confirm no timer, global service, queue, `Teleport`, request, storage, route, icon/font, or native `open-type` behavior.

在接受实现证据前，fixture 必须覆盖隐藏时零输出/零事件、每个支持 tone 的可见文字和非颜色标记、未知 tone 规范化、可选 dismiss 意图、缺失控件时零 dismiss、较长中英文消息和调用方对可见性的控制。静态检查必须确认不存在计时器、全局 service、队列、`Teleport`、请求、存储、路由、图标/字体或原生 `open-type` 行为。
