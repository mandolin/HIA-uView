# Private runtime consumption / 私有运行时消费

`@hia-uview/ui` is private and unpublished. This page defines the current repository-local consumption boundary, not a versioned external package guarantee.

`@hia-uview/ui` 为私有且未发布的包。本文定义当前仓库内的消费边界，不构成版本化的外部包保证。

## Named component import / 命名组件导入

Use a named component import when an application registers only the components it needs.

应用只注册所需组件时，使用命名组件导入。

```js
import { UButton, UCell, UCheckbox, UCheckboxGroup, UEmpty, UField, UInput, UModal, UNavBar, UNotice, URadio, URadioGroup, UStack, UValidationMessage } from '@hia-uview/ui';
```

## Explicit plugin / 显式 plugin

Use `app.use(UView)` only when deliberate registration of every currently exported HIA component is appropriate. The current private collection is `u-button`, `u-cell`, `u-checkbox`, `u-checkbox-group`, `u-empty`, `u-field`, `u-input`, `u-modal`, `u-nav-bar`, `u-notice`, `u-radio`, `u-radio-group`, `u-stack`, and `u-validation-message`. Importing the module alone has no global registration or style side effect.

仅当适合有意注册当前所有已导出 HIA 组件时才使用 `app.use(UView)`。当前私有集合为 `u-button`、`u-cell`、`u-checkbox`、`u-checkbox-group`、`u-empty`、`u-field`、`u-input`、`u-modal`、`u-nav-bar`、`u-notice`、`u-radio`、`u-radio-group`、`u-stack` 和 `u-validation-message`。单独 import module 不会产生全局注册或样式副作用。

```js
import UView from '@hia-uview/ui';

app.use(UView);
```

## Explicit style entry / 显式样式入口

Import the HIA light-theme entry from application-owned global style setup. The runtime module and plugin never inject it automatically.

在应用自有的全局样式设置中导入 HIA 浅色主题入口。runtime module 与 plugin 绝不自动注入它。

```css
@import "@hia-uview/ui/style.css";
```

## Current limits / 当前限制

The entry supports only the private UniApp Vue 3 `mp-weixin` profile. It is not yet a release, auto-import, App/H5, device, accessibility-tree, or cross-platform support commitment. Runtime tests use jsdom and compiler tests produce `mp-weixin` output; neither replaces WeChat DevTools or physical-device evidence.

该入口仅支持私有 UniApp Vue 3 `mp-weixin` 配置。它尚不是发布、自动导入、App/H5、真机、无障碍树或跨端支持承诺。runtime 测试使用 jsdom，compiler 测试生成 `mp-weixin` 输出；两者都不能替代微信开发者工具或真机证据。
