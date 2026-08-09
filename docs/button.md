# UButton component contract / UButton 组件契约

> Status / 状态：The first independent implementation and `mp-weixin` compile fixture exist. `UButton` remains private and has no published package export, device, or assistive-technology support claim.
> 首个独立实现及 `mp-weixin` 编译 fixture 已存在。`UButton` 仍为私有实现，尚无已发布的 npm 包导出、真机或辅助技术支持声明。

`UButton` is the first proposed generic action component for the initial UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It represents a local user action; it is not a navigation, identity, payment, form-submission, or business-capability wrapper.

`UButton` 是首个面向 UniApp Vue 3 与微信小程序（`mp-weixin`）初始兼容性配置的通用操作组件候选。它表示本地用户操作；不是导航、身份、支付、表单提交或业务能力的封装。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'text'` | `'primary'` | Selects the semantic action treatment. `variant` is deliberately independent from upstream `type` APIs. / 选择语义化操作样式；有意不沿用上游的 `type` API。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Selects the documented density and touch-target profile. / 选择已文档化的密度和触控目标配置。 |
| `block` | `boolean` | `false` | Makes the root occupy the available inline width. It does not change the action meaning. / 使根节点占用可用行内宽度，不改变操作语义。 |
| `disabled` | `boolean` | `false` | Makes the action unavailable and suppresses activation. / 使操作不可用并抑制激活。 |
| `loading` | `boolean` | `false` | Shows progress, suppresses activation, and keeps the action label available. / 显示进行中状态、抑制激活，并保持操作标签可用。 |
| `loadingText` | `string` | Component message `component.button.loading` | Replaces the visible label while loading. The first runtime locale plan covers `zh-Hans` and `en`. / 加载时替换可见标签；首个运行时语言计划覆盖 `zh-Hans` 与 `en`。 |
| `label` | `string` | `''` | Primary HIA visible text label. It takes precedence over migration `text` when the default slot is absent. / HIA 的主要可见文字标签。默认插槽缺失时，它优先于迁移 `text`。 |
| `text` | `string` | `''` | Migration text entry for uView-family callers. It supplies the visible text label only when `label` and the default slot are absent. / 面向 uView 系列调用方的迁移文字入口。仅在 `label` 与默认插槽均缺失时提供可见文字标签。 |

The default slot is a text-label slot. When present, it supplies the visible label instead of `label` or `text`; it must resolve to visible text. Icon-only and arbitrary-layout button content are not part of this first contract.

默认插槽是文字标签插槽。存在时，它替代 `label` 或 `text` 提供可见标签，且必须解析为可见文字。首个契约不支持纯图标按钮或任意布局的按钮内容。

The optional named `leading` slot provides one decorative visual before the visible text. It renders only when `label`, `text`, or the default text slot also supplies an action name, and it is hidden from the accessibility tree. The component performs no icon registry lookup and does not infer action meaning from the decoration.

可选的具名 `leading` slot 在可见文字之前提供一项装饰视觉。只有 `label`、`text` 或默认文字 slot 同时提供操作名称时才会呈现，并从无障碍树隐藏。组件不查找图标 registry，也不从装饰推断操作含义。

`UButton` emits only `click(event)`. A normal enabled, non-loading activation emits one `click` with the platform event. Disabled and loading states emit none. The component does not add debounce, throttle, navigation, backend, or business idempotency behavior; callers own those policies.

`UButton` 仅触发 `click(event)`。正常的、启用且非加载状态的激活恰好触发一次并携带平台事件；禁用和加载状态不触发事件。组件不增加防抖、节流、导航、后端或业务幂等逻辑；这些策略由调用方负责。

## States and interaction / 状态与交互

| State / 状态 | Visible result / 可见结果 | Activation / 激活 |
| --- | --- | --- |
| Resting / 静止 | Selected semantic variant and text label. / 对应语义变体与文字标签。 | Emits one `click`. / 触发一次 `click`。 |
| Pressed / 按下 | Variant-specific pressed treatment, without conveying state by color alone. / 变体专属按下效果，且不单靠颜色传达状态。 | Follows the platform press lifecycle. / 遵循平台按压生命周期。 |
| Disabled / 禁用 | Distinct unavailable treatment and retained label. / 明确的不可用样式且保留标签。 | Emits no `click`. / 不触发 `click`。 |
| Loading / 加载 | Progress indicator plus `loadingText` or localized loading text. / 进度指示加 `loadingText` 或本地化加载文本。 | Emits no `click`. / 不触发 `click`。 |

The component does not expose raw colors, gradients, arbitrary inline styles, native `open-type`, native form behavior, or native button capability switches in this profile. Such capabilities need a separate, explicitly validated platform adapter or component contract.

在此配置中，组件不暴露原始色值、渐变、任意内联样式、原生 `open-type`、原生表单行为或原生按钮能力开关。这类能力需要独立且经过明确验证的平台适配器或组件契约。

## Theme and customization / 主题与定制

The component root namespace is `u-button`. Implementations consume component tokens rather than hard-coded colors. The first token family is:

组件根命名空间为 `u-button`。实现必须消费组件 token，而非硬编码颜色。首个 token 族为：

| Token family / Token 族 | Purpose / 用途 |
| --- | --- |
| `--u-comp-button-primary-*` | Primary background, foreground, pressed, and disabled treatments. / 主操作的背景、前景、按下和禁用样式。 |
| `--u-comp-button-secondary-*` | Secondary semantic action treatments. / 次要语义操作样式。 |
| `--u-comp-button-text-*` | Text-action treatments. / 文字操作样式。 |
| `--u-comp-button-min-height` | Minimum touch-target dimension or documented equivalent spacing. / 最小触控目标尺寸或等效的已文档化间距。 |
| `--u-comp-button-inline-padding` | Inline label spacing. / 标签的行内间距。 |
| `--u-comp-button-gap` | Label and progress-indicator spacing. / 标签与进度指示器间距。 |
| `--u-comp-button-focus-ring` | Future focus treatment where the platform exposes a verifiable focus state. / 平台暴露可验证焦点状态时使用的后续焦点样式。 |

The primary treatment maps to the documented HIA cobalt semantic action color. A solid cyan treatment must keep the documented dark foreground; it must not use white by default. The first concrete values are implemented in the HIA light theme: primary is cobalt/white, secondary is white with cobalt border and deep-navy foreground, and text is transparent with cobalt foreground. Disabled variants use neutral-50 surfaces or a secondary-text foreground plus a dashed border; loading keeps a visible localized label plus the native loading indicator and dashed border. The documented sizes have minimum heights of 40px (`sm`), 44px (`md`), and 48px (`lg`); `md` is the baseline touch target.

主操作样式映射到已文档化的 HIA 钴蓝语义操作色。实底清透青样式必须使用已文档化的深色前景，默认不得使用白色。HIA 浅色主题已经实现首轮具体值：主操作为钴蓝/白色，次要操作为白底、钴蓝边框和深海军蓝前景，文字操作为透明背景和钴蓝前景。禁用变体使用 neutral-50 表面或次要文字前景并配合虚线边框；加载状态保留可见本地化文字、原生 loading 指示器和虚线边框。已文档化的尺寸最小高度为 `sm` 40px、`md` 44px、`lg` 48px；`md` 是基础触控目标。

The native button root inherits the application font so its label remains consistent with surrounding caller-owned text. This inheritance is a composition rule, not a font theme API: `UButton` bundles no font and declares no component or system font token.

原生 button 根节点继承应用字体，使按钮标签与周围由调用方拥有的文字保持一致。该继承是组合规则，而不是字体主题 API：`UButton` 不捆绑字体，也不声明组件级或系统级字体 token。

主操作样式映射到已文档化的 HIA 钴蓝语义操作色。实底清透青样式必须使用已文档化的深色前景，默认不得使用白色。具体组件 token 值以及所有状态的对比度组合，均须在发布前由实现 fixture 验证。

## Accessibility and platform disclosure / 无障碍与平台披露

HIA-uView uses WCAG 2.2 AA as an acceptance target for controllable component behavior; this is not a product or mini-program conformance certification.

HIA-uView 将 WCAG 2.2 AA 用作可控组件行为的验收目标；这不是产品或小程序的平台符合性认证。

- The first profile requires a visible text label, non-color state signals, documented contrast pairs, and a verified touch-target size or spacing. / 首个配置要求可见文字标签、非颜色状态信号、已文档化的对比度组合，以及已验证的触控目标尺寸或间距。
- For `mp-weixin`, visual labels and touch behavior are within the planned fixture scope. Keyboard focus, screen-reader semantics, and platform accessibility-tree behavior are not independently verified yet, so this contract makes no ARIA or assistive-technology guarantee. / 对 `mp-weixin`，可见标签和触控行为属于计划 fixture 范围；键盘焦点、读屏语义和平台无障碍树尚未独立验证，因此本文不作 ARIA 或辅助技术保证。
- App, H5, and other mini-program targets are outside this contract. / App、H5 和其他小程序目标不在本文契约范围内。

## Required implementation fixtures / 实现必需 fixture

Before an implementation is released, its fixture suite must cover the following observable results:

实现发布前，其 fixture 套件必须覆盖以下可观察结果：

1. Primary, secondary, and text variants in resting and pressed states. / 主、次要和文字变体的静止与按下状态。
2. Disabled and loading states with visible non-color differentiation. / 具有可见非颜色区分的禁用与加载状态。
3. Exactly-one `click` for enabled activation, and zero `click` events while disabled or loading. / 启用激活恰好一次 `click`；禁用或加载期间零次 `click`。
4. `label`/`text` precedence, default-slot text rendering, a leading decoration paired with visible text, suppression of decoration without text, and long `zh-Hans` and English labels. / `label`/`text` 优先级、默认插槽文字渲染、与可见文字配对的前置装饰、无文字时抑制装饰，以及较长的 `zh-Hans` 与英文标签。
5. Contrast checks for every released foreground/background state pair, including the HIA cobalt primary pair and any cyan treatment. / 每个发布的前景/背景状态组合的对比度检查，包括 HIA 钴蓝主操作组合和任何清透青样式。
6. The documented minimum touch target or equivalent spacing, plus a recorded `mp-weixin` capability observation. / 已文档化的最小触控目标或等效间距，以及一份记录在案的 `mp-weixin` 能力观察。

The initial fixture compiles the states above with the locked local official CLI. It does not yet prove a WeChat DevTools, device, screen-reader, keyboard-focus, or automated pressed-state observation.

首个 fixture 使用锁定的本地官方 CLI 编译上述状态。它尚未证明微信开发者工具、真机、读屏、键盘焦点或自动化按下状态观察。

## Deliberate exclusions / 有意排除项

This initial contract does not create an icon button, a form submit/reset wrapper, `open-type` capability proxy, raw-style escape hatch, business command, network request, or upstream compatibility layer. Each would widen the platform or business boundary and needs its own reviewed contract.

此初始契约不创建图标按钮、表单提交/重置封装、`open-type` 能力代理、原始样式逃生口、业务命令、网络请求或上游兼容层。上述任一能力都会扩大平台或业务边界，必须各自拥有经过审阅的契约。
