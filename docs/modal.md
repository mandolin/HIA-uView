# UModal component contract / UModal 组件契约

> Status / 状态：Private pre-release contract. Independent implementation, Vue runtime behavior tests, and an `mp-weixin` compile fixture exist; `UModal` remains a private, unpublished package API.
> 私有的预发布契约。独立实现、Vue runtime 行为测试和 `mp-weixin` 编译 fixture 已存在；`UModal` 仍是私有、未发布的包 API。

`UModal` is a proposed controlled local modal for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. An application owns whether it is visible, what it says, and what happens after any intent. The component renders local mask/panel presentation and reports only confirm or cancel intent; it does not close itself or manage an application dialog lifecycle.

`UModal` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的受控局部 modal 组件候选。应用拥有其是否可见、显示何种文字以及任一意图后的处理。组件只渲染局部 mask/panel 呈现并报告 confirm 或 cancel 意图；它不自行关闭，也不管理应用的对话框生命周期。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Caller-owned rendering state. It controls whether the local modal surface exists; events never mutate it. / 调用方自有的渲染状态。它控制局部 modal 表面是否存在；事件绝不修改它。 |
| `title` | `string` | `''` | Optional caller-owned visible title. Applications must provide meaningful title text whenever dialog context needs one. / 可选的调用方自有可见标题。对话框上下文需要标题时，应用必须提供有意义的文字。 |
| `confirmText` | `string` | `''` | Optional caller-owned visible label for the confirm control. Empty text renders no confirm control. / confirm 控件的可选调用方自有可见标签。空文字不会渲染 confirm 控件。 |
| `cancelText` | `string` | `''` | Optional caller-owned visible label for the cancel control. Empty text renders no cancel control. / cancel 控件的可选调用方自有可见标签。空文字不会渲染 cancel 控件。 |

`UModal` has one default slot for caller-owned panel content. The slot is responsible for its own values, nested component events, and business semantics. There are no header, footer, mask, or arbitrary-layout slots in this first contract.

`UModal` 有一个用于调用方自有 panel 内容的默认插槽。该插槽自行负责其值、嵌套组件事件和业务语义。首个契约不提供 header、footer、mask 或任意布局插槽。

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `confirm` | native platform event | Emits once only when `visible` is true and a non-empty `confirmText` control is activated. It never changes `visible`. / 仅在 `visible` 为真且非空 `confirmText` 控件被激活时恰好触发一次；绝不改变 `visible`。 |
| `cancel` | native platform event | Emits once only when `visible` is true and a non-empty `cancelText` control is activated. It never changes `visible`. / 仅在 `visible` 为真且非空 `cancelText` 控件被激活时恰好触发一次；绝不改变 `visible`。 |

## Visibility and interaction boundary / 可见性与交互边界

When `visible` is false, `UModal` renders no modal surface and emits neither event, including if a test or non-native caller invokes a handler directly. When it is true, the component may render caller-provided controls, but application code remains responsible for writing a subsequent `visible` prop, handling a request, routing, focus, retry, error recovery, or any other result.

当 `visible` 为假时，`UModal` 不渲染 modal 表面，也不触发任一事件，包括测试或非原生调用方直接调用 handler 的情形。当它为真时，组件可以渲染调用方提供的控件，但应用代码仍负责写入后续 `visible` prop、处理请求、路由、焦点、重试、错误恢复或任何其他结果。

The first contract deliberately excludes mask-click and escape dismissal, automatic close, native modal/popup APIs, `Teleport`/portal behavior, focus trap/restore, keyboard behavior, scroll locking, z-index configuration, global dialog services, queues, timers, transitions, routes, `open-type`, form behavior, network, storage, identity, and business commands.

首个契约有意排除 mask-click 和 escape 关闭、自动关闭、原生 modal/popup API、`Teleport`/portal 行为、焦点陷阱/恢复、键盘行为、滚动锁定、z-index 配置、全局 dialog service、队列、计时器、transition、路由、`open-type`、表单行为、网络、存储、身份和业务命令。

## Theme and customization / 主题与定制

The root namespace is `u-modal`. The planned implementation consumes `--u-comp-modal-*` tokens for mask, panel surface, title, border, padding, constrained panel geometry, internal layer value, action gap, and future focus treatment. Consumers must use documented text props, slots, and tokens rather than raw colors, arbitrary inline styles, deep selectors, or an externally configurable layer stack.

根命名空间为 `u-modal`。计划实现消费 `--u-comp-modal-*` token，用于 mask、panel 表面、标题、边界、内边距、受限 panel 几何、内部层级值、操作间距和后续焦点样式。使用者必须使用已文档化文字 prop、插槽和 token，而不是原始颜色、任意内联样式、深层选择器或外部可配置的层叠栈。

## Accessibility and platform disclosure / 无障碍与平台披露

Visible title, default-slot text, and confirm/cancel labels are caller-owned text. Modal state must not rely on mask color alone. WCAG 2.2 AA remains the acceptance target for controllable visual behavior, not a product or mini-program conformance certification.

可见标题、默认插槽文字和 confirm/cancel 标签都是调用方自有文字。modal 状态不能只依赖 mask 颜色表达。WCAG 2.2 AA 仍是可控视觉行为的验收目标，不是产品或小程序符合性认证。

The initial profile makes no claim about ARIA dialog semantics, focus trap or restoration, keyboard escape handling, screen-reader announcement, accessibility-tree behavior, true modal stacking, WeChat DevTools, physical devices, App, H5, or other mini-program targets.

初始配置不承诺 ARIA dialog 语义、焦点陷阱或恢复、键盘 escape 处理、读屏播报、无障碍树行为、真实 modal 层叠、微信开发者工具、真机、App、H5 或其他小程序目标。

## Required fixtures / 实现必需 fixture

Before release, fixtures must expand to cover hidden zero output/events, visible title/slot content, confirm-only, cancel-only, both controls, zero events for missing controls, long Chinese/English text, and explicit caller control of `visible`. Static checks must confirm the absence of native popup, `Teleport`, timer, global-service, focus/scroll, route, request, storage, or native `open-type` behavior.

发布前，fixture 必须扩展覆盖隐藏时零输出/零事件、可见标题/插槽内容、仅 confirm、仅 cancel、双控件、缺失控件时零事件、较长中英文文字以及调用方对 `visible` 的显式控制。静态检查必须确认不存在原生 popup、`Teleport`、计时器、全局 service、焦点/滚动、路由、请求、存储或原生 `open-type` 行为。
