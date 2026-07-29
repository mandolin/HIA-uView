# UNavBar component contract / UNavBar 组件契约

> Status / 状态：Private pre-release contract. `UNavBar` is a presentation component and not a router or system-bar adapter.
> 私有预发布契约。`UNavBar` 是展示组件，不是路由或系统栏适配器。

`UNavBar` renders a visible page title and optional text controls for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It emits intent only: the application owns route choice, `uni.navigate*`, permissions, page lifecycle, status-bar treatment, and error handling.

`UNavBar` 为私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置渲染可见页面标题及可选文字控制项。它只触发意图事件：路由选择、`uni.navigate*`、权限、页面生命周期、系统栏处理和错误处置均由应用负责。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Supplies the visible central title. Applications provide meaningful page copy. / 提供居中可见标题；应用负责有意义的页面文案。 |
| `showBack` | `boolean` | `false` | Renders the built-in back text control only when `backText` is non-empty and the `left` slot is absent. / 仅在 `backText` 非空且没有 `left` 插槽时渲染内建返回文字控制项。 |
| `backText` | `string` | `''` | Caller-owned visible back label; required when the built-in back control is shown. / 调用方自有的可见返回标签；显示内建返回控制项时必填。 |
| `actionText` | `string` | `''` | Caller-owned visible right-action label; an empty value renders no built-in action control. / 调用方自有的右侧操作标签；空值不渲染内建操作控制项。 |

| Slot / 插槽 | Contract / 约定 |
| --- | --- |
| `left` | Replaces the built-in back control. The caller owns visible text and interaction semantics. / 替代内建返回控制项；调用方负责可见文字和交互语义。 |
| `right` | Replaces the built-in action control. The caller owns visible text and interaction semantics. / 替代内建操作控制项；调用方负责可见文字和交互语义。 |

| Event / 事件 | Contract / 约定 |
| --- | --- |
| `back(event)` | Emits only when the rendered built-in back control is activated. It never navigates. / 仅在激活已渲染的内建返回控制项时触发；绝不导航。 |
| `action(event)` | Emits only when the rendered built-in action control is activated. It never navigates. / 仅在激活已渲染的内建操作控制项时触发；绝不导航。 |

`UNavBar` does not accept paths, routes, `open-type`, native-navigation options, status-bar measurements, icons, images, fonts, or business commands.

`UNavBar` 不接受路径、路由、`open-type`、原生导航选项、系统栏尺寸、图标、图片、字体或业务命令。

## Localization and accessibility / 国际化与无障碍

The component owns no default copy and therefore has no component message ID in this profile. `title`, `backText`, `actionText`, and slot content are application-owned and must tolerate Chinese and English expansion. Built-in controls use native text-bearing buttons; callers replacing them through a slot must keep an equally visible label.

本组件不生成默认文案，因此当前配置没有组件 message ID。`title`、`backText`、`actionText` 与插槽内容均由应用负责，且必须容纳中英文长度扩展。内建控制项使用带文字的原生按钮；调用方通过插槽替代时必须保留同等可见标签。

For `mp-weixin`, compilation can verify the declared template only. Keyboard focus, screen-reader semantics, accessibility-tree behavior, system-bar behavior, and actual navigation are not verified or promised.

对 `mp-weixin`，编译只能验证已声明模板。键盘焦点、读屏语义、无障碍树、系统栏行为和实际导航均未验证也不作承诺。

## Theme and customization / 主题与定制

The root namespace is `u-nav-bar`. The component consumes `--u-comp-nav-bar-*` tokens for surface, foreground, border, minimum height, padding, title typography, control color, and future focus treatment. Consumers customize through documented props, slots, and tokens; deep selectors must not alter the routing boundary.

根命名空间为 `u-nav-bar`。组件消费 `--u-comp-nav-bar-*` token，以定义表面、前景、边框、最小高度、内边距、标题排版、控制项颜色和后续焦点处理。使用者应通过已文档化 props、插槽和 token 定制；深层选择器不得改变路由边界。

## Required fixtures / 实现必需 fixture

Before release, fixtures must cover a title-only bar, built-in back/action labels, both slots, one `back` and one `action` emission, empty-control suppression, and long Chinese/English labels. They must also demonstrate that no `uni.navigate*`, route, status-bar, icon, or font capability enters the component source.

发布前，fixture 必须覆盖仅标题栏、内建返回/操作标签、两个插槽、一次 `back` 和一次 `action` 触发、空控制项抑制以及较长的中英文标签；还必须证明组件源码未引入 `uni.navigate*`、路由、系统栏、图标或字体能力。
