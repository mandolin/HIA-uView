# UTabbar component contract / UTabbar 组件契约

> Status / 状态：Private pre-release local bottom-tab projection.
> 状态：私有预发布局部底部标签投影。

`UTabbar` presents caller-declared finite `items` and controlled `modelValue`, emitting local `change` intent. Labels remain caller-owned; no router, permission, identity, global navigation service, icon font, badge source, or safe-area promise is included.

`UTabbar` 呈现调用方声明的有限 `items` 和受控 `modelValue`，并 emit 本地 `change` 意图。标签文字仍由调用方拥有；不包含 router、权限、身份、全局导航服务、图标字体、徽标来源或安全区承诺。

The root namespace is `u-tabbar` and consumes `--u-comp-tabbar-*`.

根命名空间为 `u-tabbar`，消费 `--u-comp-tabbar-*`。
