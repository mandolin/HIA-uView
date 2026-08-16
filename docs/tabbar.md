# UTabbar component contract / UTabbar 组件契约

> Status / 状态：Private pre-release local bottom-tab projection. / 私有预发布局部底部标签投影。

`UTabbar` presents controlled `modelValue` over caller-declared finite tab data. `items` has priority; migration `list` is used only when `items` is empty. `show` defaults to true, while an explicitly supplied HIA `visible` alias wins. An item may supply string `icon` and `activeIcon` locators; the selected locator falls back to `icon`, and the visible label remains the complete accessible name.

`UTabbar` 在调用方声明的有限 tab 数据上呈现受控 `modelValue`。`items` 优先；只有 `items` 为空时才使用迁移 `list`。`show` 默认值为 true，而显式提供的 HIA `visible` 别名优先。item 可提供 string `icon` 与 `activeIcon` locator；选中图缺省时回退 `icon`，可见 label 始终承担完整无障碍名称。

An eligible non-current item emits `update:modelValue(value)` and then `change(value)`. Disabled, malformed, and already-current items emit nothing. Labels, values, and image locators remain caller-owned; non-string or blank locators are discarded. The component performs no routing, permission check, native-tab configuration, safe-area calculation, badge lookup, icon registry/font loading, asset provenance decision, or global navigation. A remote locator can cause the host image element to request it, so network policy and licensing remain caller responsibilities.

符合条件且非当前的 item 会依次 emit `update:modelValue(value)` 与 `change(value)`。disabled、格式无效或已经活动的 item 不触发事件。标签、值与图片 locator 均由调用方拥有；非 string 或空 locator 会被丢弃。组件不执行路由、权限判断、原生 tab 配置、安全区计算、徽标查询、图标 registry/font 加载、资产来源判断或全局导航。远端 locator 可能使宿主 image 发起请求，因此网络策略与许可证仍由调用方负责。

The default light contract uses a white surface, one-pixel neutral top divider, four equal caller-composed items, inherited typography, 13 px labels, and optional 27 px images. It owns neither fixed positioning nor safe-area padding; an application wrapper must provide both when using the component as H5 primary chrome.

默认浅色契约使用白色表面、1px 中性上边线、四个由调用方组合的等分 item、继承字体、13px label 与可选 27px 图片。组件不拥有 fixed 定位或安全区 padding；应用把它作为 H5 主 chrome 时必须由外层 wrapper 提供二者。

For persistent WeChat primary navigation, the application should use the official custom tabBar and own `switchTab` itself. `UTabbar` remains a local in-page projection, not a platform-tab replacement.

对于微信常驻主导航，应用应使用官方 custom tabBar 并自行拥有 `switchTab`。`UTabbar` 仍是页面内局部投影，不替代平台 tab。

```vue
<u-tabbar
  :model-value="currentPrimaryPage"
  :items="[
    { value: 'home', label: 'Home', icon: homeIcon, activeIcon: homeActiveIcon },
    { value: 'profile', label: 'Profile', icon: profileIcon, activeIcon: profileActiveIcon }
  ]"
  @change="openPrimaryPage"
/>
```
