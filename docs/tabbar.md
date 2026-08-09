# UTabbar component contract / UTabbar 组件契约

> Status / 状态：Private pre-release local bottom-tab projection.
> 状态：私有预发布局部底部标签投影。

`UTabbar` presents caller-declared finite `items` and controlled `modelValue`, emitting local `change` intent. `show` retains the familiar boolean default `true`; the existing HIA `visible` alias wins only when explicitly provided. Labels remain caller-owned; no router, permission, identity, global navigation service, icon font, badge source, native-tab-bar hiding, or safe-area promise is included.

`UTabbar` 呈现调用方声明的有限 `items` 和受控 `modelValue`，并 emit 本地 `change` 意图。`show` 保留熟悉的布尔默认值 `true`；既有 HIA `visible` alias 仅在显式提供时优先。标签文字仍由调用方拥有；不包含 router、权限、身份、全局导航服务、图标字体、徽标来源、原生 tabBar 隐藏或安全区承诺。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Boundary / 边界 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | Controls this local component only / 只控制当前局部组件 |
| `visible` | `boolean` | `undefined` | Explicit HIA alias that overrides `show` / 显式 HIA alias，覆盖 `show` |
| `modelValue` | `string \| number` | `0` | Local selected key, never a route / 局部选中键，绝不代表路由 |
| `items` | `unknown[]` | `[]` | Caller-owned finite labels and keys / 调用方拥有的有限标签和键 |

When WeChat requires persistent primary navigation, use the official custom tabBar and let its application adapter own `switchTab` and lifecycle. `UTabbar` remains suitable for local in-page tabs or visual contracts, not as a substitute for that platform mechanism.

当微信需要常驻主导航时，应使用官方 custom tabBar，并由应用 adapter 拥有 `switchTab` 与生命周期。`UTabbar` 仍适用于页面内局部标签或视觉契约，不替代该平台机制。

The root namespace is `u-tabbar` and consumes `--u-comp-tabbar-*`.

根命名空间为 `u-tabbar`，消费 `--u-comp-tabbar-*`。
