# mp-weixin 编译 fixture / mp-weixin compilation fixture

该目录是 HIA-uView 官方 UniApp CLI 编译证据的独立、最小应用。它直接导入本仓独立实现的 `UButton`、`UStack`、`UNavBar`、`UCell`、`UInput`、`UField`、`UValidationMessage`、`UModal`、`UNotice` 与 `UEmpty`，不复制 DCloud、uView 或其他上游工程的页面、配置、样式、资源或业务代码。

This directory is an independent, minimal application for official UniApp CLI compilation evidence in HIA-uView. It directly imports this repository's independent `UButton`, `UStack`, `UNavBar`, `UCell`, `UInput`, `UField`, `UValidationMessage`, `UModal`, `UNotice`, and `UEmpty` implementations and copies no pages, configuration, styles, assets, or business code from DCloud, uView, or any other upstream project.

运行 `npm run build:fixture:mp-weixin` 仅执行本地编译；不会启动开发服务器。默认生成目录为 `dist/build/mp-weixin/`，已被 Git 忽略。该 fixture 自己显式声明锁定版本的 `@dcloudio/uni-mp-weixin` 开发依赖，确保 CLI 从此应用的 package metadata 装载微信小程序编译插件；它不成为 UI 包的运行时依赖，也不会被 UI 发布包携带。

Running `npm run build:fixture:mp-weixin` performs local compilation only and starts no development server. Its default output directory is `dist/build/mp-weixin/`, which is Git-ignored. This fixture explicitly declares the locked `@dcloudio/uni-mp-weixin` development dependency so the CLI loads the WeChat Mini Program compiler plugin from this application's package metadata; it is not a UI runtime dependency and is not carried by the UI publish package.

为使页面与被验证的同仓 UI 独立实现处于同一官方 compiler 输入树，fixture 的受控 build runner 将 `HIA-uView-UI/` 设为 `UNI_INPUT_DIR`，同时以 fixture 目录作为 cwd 保留其 package metadata 与最小 Vite 配置。UI 输入根额外的 `main.js`、`manifest.json` 和 `pages.json` 只服务该编译 adapter，已被 UI package 的 `.npmignore` 排除；它们不创建新的 UI API、应用模板或业务能力。

To place the page and the in-repository UI independent implementations in one official compiler input tree, the fixture's controlled build runner sets `HIA-uView-UI/` as `UNI_INPUT_DIR` while retaining the fixture directory as cwd for its package metadata and minimal Vite configuration. The UI input root's additional `main.js`, `manifest.json`, and `pages.json` serve only this compilation adapter and are excluded by the UI package's `.npmignore`; they create no new UI API, application template, or business capability.

当前 `manifest.json` 显式使用 compiler 生成的本地 `touristappid`，不绑定任何真实小程序、开发者身份、登录会话、云资源或上传权限。要进入某个指定项目，必须在后续已授权的使用方项目中单独配置其真实 AppID；本 fixture 不会代为读取、保存或变更它。

The current `manifest.json` explicitly uses the compiler-generated local `touristappid` and binds no real Mini Program, developer identity, login session, cloud resource, or upload permission. Entering a designated project requires a separately authorized consuming project to configure its real AppID later; this fixture neither reads, stores, nor changes it.

`npm run verify:fixture:mp-weixin` 在系统临时目录创建一次性输出，验证微信小程序必需的 `app.json`、`project.config.json` 与首页文件，然后无条件删除该临时目录。该命令可作为“可导入微信开发者工具”的本地前置检查，但它本身不打开开发者工具，也不构成真实导入、模拟器运行、真机、读屏、焦点、跨端或发布支持证据。已知编译器循环依赖 `finally` warning 会原样显示并记入内部候选披露。

`npm run verify:fixture:mp-weixin` creates a one-use output in the system temporary directory, verifies generated `app.json`, `project.config.json`, and home-page files, then unconditionally removes that temporary directory. It is a local prerequisite for an import into WeChat DevTools, but does not open DevTools and does not constitute evidence of actual import, simulator runtime, device, screen-reader, focus, cross-platform, or release support. The known compiler circular-dependency `finally` warning is displayed unchanged and recorded in the internal-candidate disclosure.

页面内的本地“目录—查询—详情”组合使用固定、匿名、受版本控制的 mock 记录，验证调用方拥有 query、selected identifier、空态 reset、modal/notice visible 与后续流程。它不是 HIA-uView-Biz 模块、行业模板、服务器响应或后端 contract，不读取网络、身份、路由、storage、分页、loading、retry、计时器或资源。

The page-local “catalog — query — detail” composition uses fixed, anonymous, version-controlled mock records to verify caller ownership of query, selected identifier, empty-state reset, modal/notice visibility, and follow-up flow. It is not a HIA-uView-Biz module, industry template, server response, or backend contract and reads no network, identity, router, storage, paging, loading, retry, timer, or asset.
