# UCell component contract / UCell 组件契约

> Status / 状态：Private pre-release contract. `UCell` is a generic information row, not a link, navigation command, form field, or business record.
> 私有预发布契约。`UCell` 是通用信息行，不是链接、导航命令、表单字段或业务记录。

`UCell` displays caller-owned label, description, and value text for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. A caller may opt into a generic `click` intent, but the component never accepts a destination or executes navigation.

`UCell` 为私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置展示调用方自有的标签、说明和值文字。调用方可以选择通用 `click` 意图，但组件绝不接受目标地址或执行导航。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Caller-owned primary visible label; applications supply a meaningful non-empty label. / 调用方自有的主要可见标签；应用必须提供有意义的非空标签。 |
| `description` | `string` | `''` | Optional secondary visible text below the label. / 标签下方的可选次级可见文字。 |
| `value` | `string` | `''` | Optional right-side visible value. / 可选右侧可见值。 |
| `clickable` | `boolean` | `false` | Enables generic click intent without creating a destination or link affordance. / 启用通用点击意图，但不创建目标地址或链接提示。 |
| `disabled` | `boolean` | `false` | Suppresses click intent and adds a non-color unavailable treatment when the row is clickable. / 可点击行时抑制点击意图并增加非颜色不可用样式。 |

| Event / 事件 | Contract / 约定 |
| --- | --- |
| `click(event)` | Emits once only when `clickable` is true and `disabled` is false. / 仅在 `clickable` 为真且 `disabled` 为假时恰好触发一次。 |

The initial contract excludes slots, icons, arrows, `open-type`, routes, URLs, arbitrary styles, form values, selection controls, business fields, requests, and backend behavior.

初始契约不包含插槽、图标、箭头、`open-type`、路由、URL、任意样式、表单值、选择控件、业务字段、请求或后端行为。

## Theme and customization / 主题与定制

The root namespace is `u-cell`. The component consumes `--u-comp-cell-*` tokens for surface, primary/secondary/value text, border, padding, minimum height, gap, clickable treatment, disabled treatment, and future focus treatment. Consumers change semantic treatment through documented props and tokens, not deep selectors.

根命名空间为 `u-cell`。组件消费 `--u-comp-cell-*` token，以定义表面、主要/次要/值文字、边框、内边距、最小高度、间距、可点击处理、禁用处理和后续焦点处理。使用者应通过已文档化 props 和 token 改变语义处理，而不是深层选择器。

## Accessibility and platform disclosure / 无障碍与平台披露

The label is required as visible text. Disabled state adds a dashed boundary and reduced-opacity text; color alone does not convey it. A clickable row currently uses the platform view click event and makes no keyboard, ARIA, screen-reader, accessibility-tree, or device-interaction guarantee. Applications must not treat `click` as navigation proof.

标签必须是可见文字。禁用状态增加虚线边界和降低透明度文字，不能仅依赖颜色表达。可点击行当前使用平台 view click 事件，不对键盘、ARIA、读屏、无障碍树或真机交互作保证。应用不得将 `click` 视为导航证明。

## Required fixtures / 实现必需 fixture

Before release, fixtures must cover label-only, description/value, enabled clickable, disabled clickable, non-clickable, one enabled `click`, zero disabled/non-clickable events, and long Chinese/English text. They must disclose the current absence of a native navigation or link capability.

发布前，fixture 必须覆盖仅标签、说明/值、启用可点击、禁用可点击、不可点击、一次启用 `click`、禁用/不可点击零事件以及较长的中英文文字；还必须披露当前没有原生导航或链接能力。
