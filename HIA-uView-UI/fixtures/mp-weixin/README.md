# mp-weixin 编译 fixture / mp-weixin compilation fixture

该目录是 HIA-uView 官方 UniApp CLI 编译证据的独立、最小应用。它直接导入本仓独立实现的 `UButton`、`UStack`、`UNavBar`、`UCell`、`UInput`、`UField` 与 `UValidationMessage`，不复制 DCloud、uView 或其他上游工程的页面、配置、样式、资源或业务代码。

This directory is an independent, minimal application for official UniApp CLI compilation evidence in HIA-uView. It directly imports this repository's independent `UButton`, `UStack`, `UNavBar`, `UCell`, `UInput`, `UField`, and `UValidationMessage` implementations and copies no pages, configuration, styles, assets, or business code from DCloud, uView, or any other upstream project.

运行 `npm run build:fixture:mp-weixin` 仅执行本地编译；不会启动开发服务器。生成目录为 `unpackage/`，已被 Git 忽略，且不构成真机、读屏、焦点、跨端或发布支持证据。

Running `npm run build:fixture:mp-weixin` performs local compilation only and starts no development server. The generated `unpackage/` directory is Git-ignored and is not evidence of device, screen-reader, focus, cross-platform, or release support.
