# Local catalog composition / 本地目录组合示例

The `mp-weixin` fixture contains a deliberately small, local-only “catalog — query — detail” composition. It demonstrates how an application can combine the current private HIA-uView components while keeping data, state, and flow decisions outside the UI library.

`mp-weixin` fixture 包含一个刻意收敛、仅本地运行的“目录—查询—详情”组合。它演示应用如何组合当前私有 HIA-uView 组件，同时把数据、状态和流程决策保留在 UI 库之外。

## What the example contains / 示例包含什么

- A fixed, version-controlled mock collection with anonymous identifiers, titles, descriptions, and generic category labels.
- A caller-owned controlled query string and a synchronous, in-memory derived result set.
- A caller-owned selected identifier that switches between directory and detail projections without a route or URL.
- An empty-state reset intent, a controlled confirmation modal, and local notice visibility handled entirely by the page.

- 一个固定且受版本控制的 mock 集合，只有匿名标识、标题、说明和通用分类文字。
- 由调用方拥有的受控查询字符串，以及同步、内存内派生的结果集合。
- 由调用方拥有的 selected identifier，在没有 route 或 URL 的情况下切换目录与详情投影。
- 空态 reset 意图、受控确认 modal 与完全由页面处理的局部 notice 可见状态。

The fixture uses existing `UStack`, `UNavBar`, `UField`, `UInput`, `UCell`, `UValidationMessage`, `UEmpty`, `UModal`, `UNotice`, `UButton`, the P42 display components, and the P43 controlled overlay/feedback/navigation components. It adds no auto-registration, global service, timer, router, or style injection.

fixture 使用既有的 `UStack`、`UNavBar`、`UField`、`UInput`、`UCell`、`UValidationMessage`、`UEmpty`、`UModal`、`UNotice`、`UButton`、P42 展示组件和 P43 受控浮层/反馈/导航组件。它不新增自动注册、全局 service、timer、router 或样式注入。

## Caller ownership / 调用方职责

| Concern / 关注点 | Application owns / 应用拥有 | Component provides / 组件提供 |
| --- | --- | --- |
| Mock records / mock 记录 | The finite local collection and every display projection / 有限本地集合及每个展示投影 | No record model or data read / 不拥有记录模型或数据读取 |
| Query / 查询 | The controlled string and synchronous filtering rule / 受控字符串及同步筛选规则 | `UInput` renders the string and emits input intent / `UInput` 呈现字符串并 emit 输入意图 |
| Selection and detail / 选择与详情 | The selected identifier and view switch / selected identifier 与视图切换 | `UCell` renders caller text and emits click intent / `UCell` 呈现调用方文字并 emit click 意图 |
| Empty state / 空态 | The decision that a derived result is empty and the reset handler / 派生结果为空的决定及 reset handler | `UEmpty` renders caller copy and emits optional action / `UEmpty` 呈现调用方文字并 emit 可选 action |
| Confirmation and feedback / 确认与反馈 | Visibility, close timing, and what local intent means / 可见状态、关闭时机及本地意图含义 | `UModal` and `UNotice` present props and emit pure intents / `UModal` 与 `UNotice` 呈现 props 并 emit 纯意图 |

## Intentional limits / 有意保留的限制

This is not a HIA-uView-Biz module, an industry starter, a public data contract, or a backend adapter. The mock records are not customer, user, product, resource, or server-response data. The example has no network request, Directus integration, authentication, permission check, router, `uni.*` navigation, storage, cache, retry, virtualization, timer, queue, global service, image, icon, SVG, or font; P43 loading, pagination, and overlays remain explicitly page-controlled.

这不是 HIA-uView-Biz 模块、行业 starter、公开数据契约或后端 adapter。mock 记录不是客户、用户、产品、资源或服务器响应数据。该示例没有网络请求、Directus 集成、身份、权限检查、router、`uni.*` 导航、storage、cache、retry、虚拟化、timer、queue、全局 service、图片、图标、SVG 或字体；P43 的 loading、分页和浮层仅由页面显式控制。

The local query is a demonstration of page-owned synchronous projection only. It does not establish a search syntax, relevance rule, privacy policy, data-retention rule, caching policy, accessibility-tree behavior, or production interaction model.

本地查询只演示页面拥有的同步投影。它不确立查询语法、相关性规则、隐私政策、数据保留规则、缓存政策、无障碍树行为或生产交互模型。

## Evidence boundary / 证据边界

Run `npm run build:fixture:mp-weixin` to produce official UniApp CLI compiler evidence and `npm test` to run local Node and Vue/jsdom behavior checks. Those commands do not start a development server and do not prove WeChat DevTools, physical-device behavior, screen readers, focus, keyboard, overlay layering, animation, App, H5, other mini-program targets, or release readiness.

运行 `npm run build:fixture:mp-weixin` 可生成官方 UniApp CLI compiler 证据，运行 `npm test` 可执行本地 Node 与 Vue/jsdom 行为检查。这些命令不会启动开发服务器，也不能证明微信开发者工具、真机行为、读屏、焦点、键盘、弹层层叠、动画、App、H5、其他小程序平台或发布就绪性。
