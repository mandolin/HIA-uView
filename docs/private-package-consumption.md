# Private package consumption / 私有包消费

`@hia-uview/ui` is private and remains unpublished. This page describes a local pre-release package boundary that can be verified from a checkout or a locally packed tarball; it is not a registry-release, semantic-versioning, or complete upstream-compatibility promise.

`@hia-uview/ui` 为私有且未发布的包。本文描述可从检出目录或本地打包 tarball 验证的预发布包边界；它不是 registry 发布、语义版本或完整上游兼容性承诺。

## Explicit entries / 显式入口

The package exposes only these entries:

该包只暴露以下入口：

| Entry | Boundary / 边界 |
| --- | --- |
| `@hia-uview/ui` | Named runtime imports and explicit `UView` plugin. Importing it registers nothing and injects no style. / 命名 runtime import 和显式 `UView` plugin；导入时不注册任何组件，也不注入样式。 |
| `@hia-uview/ui/services` | Pure `createUFeedbackScope`, `useToast`, and `useModal` entry. Importing it creates no scope, host, global listener, or component barrel dependency. / 纯 `createUFeedbackScope`、`useToast` 与 `useModal` 入口；导入时不创建 scope、host、全局监听，也不依赖组件 barrel。 |
| `@hia-uview/ui/style.css` | Explicit full style entry. The consumer owns global style setup. / 显式完整样式入口；消费者拥有全局样式设置。 |
| `@hia-uview/ui/theme/hia-light.css` | Explicit default-light token entry. / 显式默认浅色 token 入口。 |
| `@hia-uview/ui/global` | Optional TypeScript-only Vue template augmentation. It has a zero-side-effect runtime placeholder and registers nothing. / 可选、仅 TypeScript 的 Vue template 增强；它有零副作用 runtime 占位模块，不注册任何组件。 |
| `@hia-uview/ui/easycom/mp-weixin.json` | Static `mp-weixin` Easycom fragment for the package trial. It must be copied into consumer-owned `pages.json`; it is not runtime auto-registration. / 用于包试用的静态 `mp-weixin` Easycom 片段；必须复制到消费者自有的 `pages.json`，不是 runtime 自动注册。 |

The package has a Vue peer range of `>=3.4.0 <4.0.0` and declares no UI runtime dependency. The TypeScript compiler is a root development-only tool used to verify declarations; it is not packaged as a runtime dependency.

该包的 Vue peer range 为 `>=3.4.0 <4.0.0`，且不声明 UI runtime dependency。TypeScript compiler 是用于验证声明的根开发期工具；它不会作为 runtime dependency 打入包内。

## Types / 类型

`@hia-uview/ui` owns its `types/index.d.ts` entry and declares every current runtime component name. Precise public types now cover the audited choice/switch, picker/calendar/select, dropdown, numeric, controlled-upload, form/input, and ten overlay/feedback/navigation surfaces (`UActionSheet`, `UMask`, `UModal`, `UNavbar`, `UNoticeBar`, `UPopup`, `UTabbar`, `UTabs`, `UToast`, and `UTransition`). They include exact component-ref methods, event metadata, the nominal feedback scope, finite service options/controllers, and discriminated command results; callback, URL, invalid enum, missing-scope, and invalid-expose calls have compile-time negative fixtures. Other component declarations intentionally use a generic component baseline. This is a discoverability and type-resolution guarantee, not a claim that every remaining prop, event payload, slot prop, expose signature, parent-child context, or global-bus interaction is fully typed or compatible with an upstream library.

`@hia-uview/ui` 自己提供 `types/index.d.ts` 入口，并声明每个当前 runtime 组件名称。精确公开类型现已覆盖受审 choice/switch、picker/calendar/select、dropdown、numeric、controlled-upload、form/input，以及十个 overlay/feedback/navigation 表面（`UActionSheet`、`UMask`、`UModal`、`UNavbar`、`UNoticeBar`、`UPopup`、`UTabbar`、`UTabs`、`UToast` 与 `UTransition`）。这些类型包含精确组件 ref 方法、事件 metadata、nominal feedback scope、有限 service options/controller 和可判别命令结果；callback、URL、非法枚举、缺 scope 与错误 expose 调用均有编译期反例。其他组件声明刻意采用通用组件基线。这保证可发现性和类型解析，但不声称其余每项 prop、event payload、slot prop、expose signature、父子 context 或 global-bus interaction 都已完整类型化或与上游库兼容。

Use the optional template augmentation only where its limited declared names are desired:

只在需要其有限声明名称的地方使用可选 template augmentation：

```ts
import '@hia-uview/ui/global';
```

It currently covers `UActionSheet`, `UAlertTips`, `UCalendar`, `UCheckbox`, `UCheckboxGroup`, `UDropdown`, `UDropdownItem`, `UField`, `UForm`, `UFormItem`, `UInput`, `UMask`, `UModal`, `UNavbar`, `UNoticeBar`, `UNumberBox`, `UPicker`, `UPopup`, `URadio`, `URadioGroup`, `URate`, `USearch`, `USelect`, `USlider`, `USwitch`, `UTabbar`, `UTabs`, `UTag`, `UTextarea`, `UToast`, `UTransition`, and `UUpload`. It is not a runtime install, an all-component global declaration, or an Easycom substitute.

它当前覆盖 `UActionSheet`、`UAlertTips`、`UCalendar`、`UCheckbox`、`UCheckboxGroup`、`UDropdown`、`UDropdownItem`、`UField`、`UForm`、`UFormItem`、`UInput`、`UMask`、`UModal`、`UNavbar`、`UNoticeBar`、`UNumberBox`、`UPicker`、`UPopup`、`URadio`、`URadioGroup`、`URate`、`USearch`、`USelect`、`USlider`、`USwitch`、`UTabbar`、`UTabs`、`UTag`、`UTextarea`、`UToast`、`UTransition` 与 `UUpload`。它不是 runtime install、全量组件 global declaration 或 Easycom 替代品。

## Static Easycom fragment / 静态 Easycom 片段

The package fragment is intentionally static:

该包片段刻意保持静态：

```json
{
  "easycom": {
    "autoscan": false,
    "custom": {
      "^u-(.*)": "@/node_modules/@hia-uview/ui/src/components/u-$1/u-$1.vue"
    }
  }
}
```

Merge the `easycom` object into the consumer's own `pages.json`; do not replace unrelated consumer configuration. The consumer owns its compiler configuration, package install location, Mini Program domain setup, and platform verification. This fragment does not scan the source tree, run scripts, fetch packages, or register global components at runtime.

把 `easycom` 对象合并到消费者自己的 `pages.json`；不要替换无关的消费者配置。消费者拥有其 compiler configuration、包安装位置、小程序域名设置和平台验证。本片段不扫描 source tree、不运行脚本、不拉取包，也不在 runtime 注册全局组件。

## Local trial and rollback / 本地试用与回退

The supported pre-release verification path is local: pack the UI workspace, install that tarball into a disposable consumer fixture, import style explicitly, merge the static Easycom fragment, and compile. Do not publish the tarball, alter a package registry, or treat one local compiler result as device or cross-platform support evidence.

支持的预发布验证路径是本地：打包 UI workspace、把 tarball 安装到一次性 consumer fixture、显式导入 style、合并静态 Easycom 片段并进行编译。不要发布 tarball、改变 package registry，也不要把一次本地 compiler 结果当作设备或跨端支持证据。

Run the repeatable repository check with `mise exec -- npm run verify:package:trial`. It packs with scripts disabled, installs only the tarball in offline mode with scripts disabled, verifies the root and pure `./services` runtime/type exports without a source-path alias, reuses the repository-locked local compiler toolchain through one-use temporary directory links, compiles the static Easycom page, and deletes the one-use temporary directory in all outcomes.

使用 `mise exec -- npm run verify:package:trial` 运行可重复的仓内检查。它会在禁用脚本的条件下打包，只在离线且禁用脚本的条件下安装 tarball，在没有 source-path alias 的情况下验证根入口与纯 `./services` runtime/type export，通过一次性临时目录链接复用仓内锁定的本地 compiler toolchain，编译静态 Easycom 页面，并在所有结果下删除一次性临时目录。

Rollback is simply removal of the consumer-owned tarball dependency and its copied Easycom mapping, followed by restoring the consumer's previous lockfile/configuration. The UI package has no install-time script, runtime global registration, storage, network, or application mutation to undo.

回退只需移除消费者自有的 tarball dependency 及其复制的 Easycom mapping，然后恢复消费者之前的 lockfile/configuration。UI 包没有 install-time script、runtime global registration、storage、network 或 application mutation 需要撤销。
