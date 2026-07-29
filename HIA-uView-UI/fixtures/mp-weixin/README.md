# mp-weixin 编译 fixture / mp-weixin compilation fixture

该目录是 HIA-uView 官方 UniApp CLI 编译证据的独立、最小应用。它直接导入本仓独立实现的 `UButton`、`UStack`、`UNavBar`、`UCell`、`UInput`、`UField`、`UValidationMessage`、`UModal`、`UNotice` 与 `UEmpty`，不复制 DCloud、uView 或其他上游工程的页面、配置、样式、资源或业务代码。

This directory is an independent, minimal application for official UniApp CLI compilation evidence in HIA-uView. It directly imports this repository's independent `UButton`, `UStack`, `UNavBar`, `UCell`, `UInput`, `UField`, `UValidationMessage`, `UModal`, `UNotice`, and `UEmpty` implementations and copies no pages, configuration, styles, assets, or business code from DCloud, uView, or any other upstream project.

运行 `npm run build:fixture:mp-weixin` 仅执行本地编译；不会启动开发服务器。生成目录为 `unpackage/`，已被 Git 忽略，且不构成真机、读屏、焦点、跨端或发布支持证据。

Running `npm run build:fixture:mp-weixin` performs local compilation only and starts no development server. The generated `unpackage/` directory is Git-ignored and is not evidence of device, screen-reader, focus, cross-platform, or release support.

页面内的本地“目录—查询—详情”组合使用固定、匿名、受版本控制的 mock 记录，验证调用方拥有 query、selected identifier、空态 reset、modal/notice visible 与后续流程。它不是 HIA-uView-Biz 模块、行业模板、服务器响应或后端 contract，不读取网络、身份、路由、storage、分页、loading、retry、计时器或资源。

The page-local “catalog — query — detail” composition uses fixed, anonymous, version-controlled mock records to verify caller ownership of query, selected identifier, empty-state reset, modal/notice visibility, and follow-up flow. It is not a HIA-uView-Biz module, industry template, server response, or backend contract and reads no network, identity, router, storage, paging, loading, retry, timer, or asset.
