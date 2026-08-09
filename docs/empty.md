# UEmpty component contract / UEmpty 组件契约

> Status / 状态：Private pre-release contract. Independent implementation, Vue runtime behavior tests, and an `mp-weixin` compile fixture exist; `UEmpty` remains a private, unpublished package API.
> 私有的预发布契约。独立实现、Vue runtime 行为测试和 `mp-weixin` 编译 fixture 已存在；`UEmpty` 仍是私有、未发布的包 API。

`UEmpty` is a proposed static empty-data presentation for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It displays caller-owned title, description, optional caller-approved image source, and optional action intent where an application decides there is no relevant data. It does not inspect data, infer loading completion, fetch, retry, paginate, scroll, virtualize, or generate an illustration.

`UEmpty` 是面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的静态空数据展示组件候选。它在应用决定没有相关数据的位置显示调用方自有标题、说明、可选的调用方已批准图片来源和可选 action 意图。它不检查数据、不推断加载完成、不请求、不重试、不分页、不滚动、不虚拟化，也不生成插图。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Caller-owned primary visible empty-state text. Applications must provide meaningful non-empty title text when rendering an empty state. / 调用方自有的主要可见空态文字。渲染空态时，应用必须提供有意义的非空标题文字。 |
| `description` | `string` | `''` | Optional caller-owned secondary visible guidance. It is not a component-generated loading/error explanation. / 可选的调用方自有次级可见指引。它不是组件生成的 loading/error 解释。 |
| `show` | `boolean` | `true` | Controls only whether this empty-state instance projects. It does not decide data, loading, or page state. / 仅控制该空态实例是否投影；不决定数据、loading 或页面状态。 |
| `src` | `string` | `''` | Optional caller-approved image source passed to `UImage`. Empty source renders no image. It creates no source trust, cache, request, download, or fallback-asset behavior. / 可选的、传给 `UImage` 的调用方已批准图片来源。空来源不渲染图片；它不产生来源信任、缓存、请求、下载或 fallback 资产行为。 |
| `text` | `string` | `''` | Migration secondary copy for uView-family callers. It renders only when `description` is empty, so `description` keeps precedence. / 面向 uView 系列调用方的迁移次级文字。仅当 `description` 为空时显示，因此 `description` 保持优先级。 |
| `actionText` | `string` | `''` | Optional caller-owned visible action label. Empty text renders no action control. / 可选的调用方自有可见操作标签。空文字不会渲染 action 控件。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `action` | native platform event | Emits once only when a non-empty `actionText` control is activated. It does not fetch, retry, navigate, mutate data, or decide the next empty state. / 仅在非空 `actionText` 控件被激活时恰好触发一次。它不请求、不重试、不导航、不修改数据，也不决定下一空态。 |

The contract has no slots, data-array prop, component-generated illustration, loading prop, pagination prop, or scroll/virtualization option. Parent code decides data facts and all data-state transitions; `show` only controls this component projection.

该契约没有插槽、数据数组 prop、组件生成的插图、loading prop、分页 prop 或 scroll/virtualization 选项。父级代码决定数据事实并拥有全部数据状态转换；`show` 仅控制该组件投影。

## Data-state and interaction boundary / 数据状态与交互边界

`UEmpty` is presentation only. A visible empty state is not evidence that a query finished, a request failed, a list is exhausted, a user is authorized, or retry is possible. The application decides those facts and may render `UEmpty` with different caller-owned text. The optional `action` is a pure intent that stays outside data, request, route, and business workflows.

`UEmpty` 仅用于呈现。可见空态不是查询已完成、请求失败、列表耗尽、用户已授权或可重试的证据。应用决定这些事实，并可使用不同的调用方自有文字渲染 `UEmpty`。可选 `action` 是纯意图，始终位于数据、请求、路由和业务流程之外。

The component deliberately excludes default empty copy, loading/error/success state interpretation, data arrays, item rendering, list click handling, pagination, infinite scroll, virtualization, native scrolling, pull-to-refresh, request/retry logic, timers, storage, identity, backend integration, routes, `open-type`, icon registries, generated illustration, SVG, and fonts. A non-empty caller-owned `src` is only a bounded native-image projection through `UImage`.

组件有意排除默认空态文案、loading/error/success 状态解释、数据数组、item 渲染、列表点击处理、分页、无限滚动、虚拟化、原生滚动、下拉刷新、请求/重试逻辑、计时器、存储、身份、后端集成、路由、`open-type`、图标 registry、生成插图、SVG 和字体。非空的调用方自有 `src` 只经由 `UImage` 作受限原生图片投影。

## Theme and customization / 主题与定制

The root namespace is `u-empty`. The implementation consumes `--u-comp-empty-*` tokens for subtle surface, border, title/description text, constrained spacing, panel geometry, action gap, and future focus treatment. A non-empty caller `src` may appear through the independently bounded `UImage`; it adds no built-in image or icon asset. Consumers must not rely on arbitrary inline styles, deep selectors, or component-level data/loading flags.

根命名空间为 `u-empty`。实现消费 `--u-comp-empty-*` token，用于柔和表面、边界、标题/说明文字、受限间距、panel 几何、action 间距和后续焦点样式。非空的调用方 `src` 可以通过独立受限的 `UImage` 出现，但不添加内置图片或图标资产。使用者不得依赖任意内联样式、深层选择器或组件级数据/loading 标记。

## Accessibility and platform disclosure / 无障碍与平台披露

Title, description, and action label are visible caller-owned text; the empty state must not rely only on neutral color or border treatment. The contract makes no screen-reader, accessibility-tree, keyboard, device, App, H5, list scrolling, loading, paging, or cross-platform guarantee. WCAG 2.2 AA remains a controllable-visual-behavior target rather than a mini-program certification.

标题、说明和 action 标签均为可见调用方自有文字；空态不能只依靠中性色或边界样式表达。本文契约不承诺读屏、无障碍树、键盘、真机、App、H5、列表滚动、loading、分页或跨端能力。WCAG 2.2 AA 仍是可控视觉行为目标，而不是小程序认证。

## Required fixtures / 实现必需 fixture

Before release, fixtures must cover title-only, title/description, `description`/`text` precedence, `show=false`, caller-owned non-empty and empty `src`, optional action intent, zero action without control, long Chinese/English text, a parent-controlled conditional render, and composition beside existing `UStack`/`UCell` without treating either as a data list. Static checks must confirm no data array, loading/paging/scroll/virtualization, request, retry, timer, storage, route, image/icon registry/font, or native `open-type` behavior.

发布前，fixture 必须覆盖仅标题、标题/说明、`description`/`text` 优先级、`show=false`、调用方自有的非空与空 `src`、可选 action 意图、缺失控件时零 action、较长中英文文字、父级受控条件渲染，以及与现有 `UStack`/`UCell` 并列组合但不把任一者当作数据列表。静态检查必须确认不存在数据数组、loading/paging/scroll/virtualization、请求、重试、计时器、存储、路由、图片/图标 registry/字体或原生 `open-type` 行为。
