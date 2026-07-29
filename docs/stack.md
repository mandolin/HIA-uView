# UStack component contract / UStack 组件契约

> Status / 状态：Private pre-release contract. No published package, device, accessibility-tree, or cross-platform support claim is made.
> 私有预发布契约。尚不构成已发布 npm 包、真机、无障碍树或跨端支持声明。

`UStack` is the first generic layout primitive for the private UniApp Vue 3 and WeChat Mini Program (`mp-weixin`) profile. It arranges its default-slot children with a constrained flex layout; it does not own page structure, business data, scrolling, navigation, or child semantics.

`UStack` 是首个面向私有 UniApp Vue 3 与微信小程序（`mp-weixin`）配置的通用布局原语。它以受限 flex 布局排列默认插槽子项；不拥有页面结构、业务数据、滚动、导航或子项语义。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Selects the flex main axis. / 选择 flex 主轴。 |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Selects one documented spacing token; arbitrary values are excluded. / 选择一个已文档化间距 token；不允许任意值。 |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Maps to the cross-axis alignment. / 映射到交叉轴对齐。 |
| `justify` | `'start' \| 'center' \| 'end' \| 'between'` | `'start'` | Maps to main-axis distribution. / 映射到主轴分布。 |
| `wrap` | `boolean` | `false` | Enables flex wrapping without changing child order or meaning. / 启用 flex 换行，不改变子项顺序或含义。 |

The default slot is the only content surface. `UStack` emits no events, adds no text, and must not infer child roles, order, or interaction policies.

默认插槽是唯一内容入口。`UStack` 不触发事件、不生成文字，也不得推断子项角色、顺序或交互策略。

## Theme and customization / 主题与定制

The root namespace is `u-stack`. It consumes only these component tokens:

根命名空间为 `u-stack`，且只消费以下组件 token：

| Token / Token | Purpose / 用途 |
| --- | --- |
| `--u-comp-stack-gap-sm` | Small documented gap. / 小间距。 |
| `--u-comp-stack-gap-md` | Default documented gap. / 默认间距。 |
| `--u-comp-stack-gap-lg` | Large documented gap. / 大间距。 |

Consumers use props rather than deep selectors or arbitrary inline layout values. A theme may change token values but not slot order or flex semantics.

使用者应通过 props，而不是深层选择器或任意内联布局值进行定制。主题可以改变 token 值，但不能改变插槽顺序或 flex 语义。

## Accessibility and platform disclosure / 无障碍与平台披露

`UStack` adds no interactive behavior or accessible name. Children retain their own labels and interaction responsibilities. The current `mp-weixin` fixture can prove compilation only; it does not prove keyboard focus, screen-reader traversal, accessibility-tree semantics, App, H5, or other platform behavior.

`UStack` 不新增交互行为或可访问名称。子项保留自身标签和交互职责。当前 `mp-weixin` fixture 只能证明编译，不能证明键盘焦点、读屏遍历、无障碍树、App、H5 或其他平台行为。

## Required fixtures / 实现必需 fixture

Before release, fixtures must cover vertical and horizontal directions, every documented gap, cross/main-axis alignment, wrapping, nested text-bearing children, and long bilingual child content. No fixture may claim that layout compilation proves child accessibility.

发布前，fixture 必须覆盖纵向和横向方向、每个已文档化间距、交叉/主轴对齐、换行、嵌套含文本子项和较长的中英文子项内容。任何 fixture 均不得将布局编译表述为子项无障碍证明。
