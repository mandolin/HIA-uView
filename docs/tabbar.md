# UTabbar component contract / UTabbar 组件契约

> Status / 状态：Private pre-release local bottom-tab projection. / 私有预发布局部底部标签投影。

`UTabbar` presents controlled `modelValue` over caller-declared finite tab data. `items` has priority; migration `list` is used only when `items` is empty. `show` defaults to true, while an explicitly supplied HIA `visible` alias wins.

`UTabbar` 在调用方声明的有限 tab 数据上呈现受控 `modelValue`。`items` 优先；只有 `items` 为空时才使用迁移 `list`。`show` 默认值为 true，而显式提供的 HIA `visible` 别名优先。

An eligible non-current item emits `update:modelValue(value)` and then `change(value)`. Disabled, malformed, and already-current items emit nothing. Labels and values remain caller-owned; the component performs no routing, permission check, native-tab configuration, safe-area calculation, badge lookup, icon-font loading, or global navigation.

符合条件且非当前的 item 会依次 emit `update:modelValue(value)` 与 `change(value)`。disabled、格式无效或已经活动的 item 不触发事件。标签和值仍由调用方拥有；组件不执行路由、权限判断、原生 tab 配置、安全区计算、徽标查询、图标字体加载或全局导航。

For persistent WeChat primary navigation, the application should use the official custom tabBar and own `switchTab` itself. `UTabbar` remains a local in-page projection, not a platform-tab replacement.

对于微信常驻主导航，应用应使用官方 custom tabBar 并自行拥有 `switchTab`。`UTabbar` 仍是页面内局部投影，不替代平台 tab。
