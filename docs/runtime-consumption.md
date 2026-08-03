# Private runtime consumption / 私有运行时消费

`@hia-uview/ui` is private and unpublished. This page defines the current repository-local consumption boundary, not a versioned external package guarantee.

`@hia-uview/ui` 为私有且未发布的包。本文定义当前仓库内的消费边界，不构成版本化的外部包保证。

## MP static component resolution / MP 静态组件解析

For the current private UniApp Vue 3 `mp-weixin` profile, resolve `u-*` tags through a bounded `pages.json` `easycom` table. This makes the UniApp compiler emit each referenced component's Mini Program JS, JSON, WXML, and WXSS files. It is compile-time resolution only: it does not fetch packages, scan arbitrary directories, execute application code, or globally register components at runtime.

当前私有 UniApp Vue 3 `mp-weixin` 配置应通过受限的 `pages.json` `easycom` 表解析 `u-*` 标签。这样 UniApp compiler 会为每个被引用组件输出微信小程序所需的 JS、JSON、WXML 与 WXSS 文件。这仅是编译期解析：不拉取包、不扫描任意目录、不执行应用代码，也不在运行时全局注册组件。

```json
{
  "easycom": {
    "autoscan": false,
    "custom": {
      "^u-(.*)": "@/src/components/u-$1/u-$1.vue"
    }
  }
}
```

The path above is the repository-local source-root form used by the compile fixture. A future published package may expose a different stable path; this document makes no external package-path guarantee before that release decision.

上面的路径是编译 fixture 使用的仓内 source-root 形式。未来发布的包可能暴露不同的稳定路径；在发布决策前，本文不对外部包路径作保证。

## Named import and explicit plugin boundary / 命名导入与显式 plugin 边界

Named imports and `app.use(UView)` remain runtime APIs for repository H5 and jsdom contract usage. They are not the current `mp-weixin` consumption mechanism and must not replace the static `easycom` mapping above, because a public barrel can hide leaf SFC dependencies from the Mini Program compiler.

命名导入和 `app.use(UView)` 仍是仓内 H5 与 jsdom 契约使用的 runtime API。它们不是当前 `mp-weixin` 的消费机制，不能替代上面的静态 `easycom` 映射；公共 barrel 可能向小程序 compiler 隐藏叶级 SFC 依赖。

```js
import { UButton, UCheckbox, UCheckboxGroup, URadio, URadioGroup } from '@hia-uview/ui';

// H5/jsdom repository runtime usage only.
// 仅限仓内 H5/jsdom runtime 使用。
void [UButton, UCheckbox, UCheckboxGroup, URadio, URadioGroup];
```

## Explicit style entry / 显式样式入口

Import the HIA complete style entry from application-owned global style setup. It contains the default light-theme tokens and current component rules, including the global rules required by the WeChat Mini Program compilation path. The runtime module and plugin never inject it automatically.

在应用自有的全局样式设置中导入 HIA 完整样式入口。它包含默认浅色主题 token 和当前组件规则，其中也包含微信小程序编译路径所需的全局规则。runtime module 与 plugin 绝不自动注入它。

```css
@import "@hia-uview/ui/style.css";
```

## Default-light literal fallbacks / 默认浅色字面值回退

Every current component stylesheet also carries generated literal values from the default light theme immediately before the corresponding `var(--u-*)` declaration. This preserves component-local WXSS rendering on the current `mp-weixin` path when custom properties are not resolved, while capable runtimes still let the original token declaration win. It is a bounded default-light compatibility layer, not a multi-theme or runtime theme-switching promise.

每个当前组件样式表还会在对应 `var(--u-*)` 声明前携带由默认浅色主题生成的字面值。这样当当前 `mp-weixin` 路径不解析 custom property 时，组件局部 WXSS 仍可渲染；具备该能力的 runtime 则仍以后面的原 token 声明为准。这是受限的默认浅色兼容层，不构成多主题或运行时切换主题承诺。

After changing a default-light token or a component declaration that consumes one, run `npm run theme:sync`; `npm run theme:check` rejects stale generated fallback blocks. The generator reads only the repository-controlled default theme and component stylesheets, and it does not choose business colors or process application-owned CSS.

变更默认浅色 token 或消费 token 的组件声明后，运行 `npm run theme:sync`；`npm run theme:check` 会拒绝过期的生成回退区块。生成器仅读取仓库受控的默认主题和组件样式表，不选择业务颜色，也不处理应用自有 CSS。

## Current limits / 当前限制

The entry supports only the private UniApp Vue 3 `mp-weixin` profile. Its bounded `easycom` table is not a general auto-import feature or a package-release promise. It is not yet an App/H5, device, accessibility-tree, or cross-platform support commitment. Runtime tests use jsdom and compiler tests produce `mp-weixin` output; neither replaces WeChat DevTools or physical-device evidence.

该入口仅支持私有 UniApp Vue 3 `mp-weixin` 配置。它的受限 `easycom` 表不是通用自动导入功能，也不是包发布承诺。它尚不是 App/H5、真机、无障碍树或跨端支持承诺。runtime 测试使用 jsdom，compiler 测试生成 `mp-weixin` 输出；两者都不能替代微信开发者工具或真机证据。
