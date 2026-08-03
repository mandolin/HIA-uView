# Manual migration guidance for uView-family applications / uView 系应用的人工迁移指引

HIA-uView deliberately keeps familiar `u-*` template names and `U*` exports for the components it currently implements. This lowers the reading and migration barrier for uView, uView2, uView-Pro, and uview-plus users, but it is **not** a fork with a complete upstream API surface and does not promise compatibility with any upstream release, plugin, theme, or application behavior.

HIA-uView 有意为当前已实现组件保留熟悉的 `u-*` 模板名称和 `U*` 导出。这会降低 uView、uView2、uView-Pro 与 uview-plus 使用者的阅读和迁移门槛，但它**不是**具备完整上游 API 面的 fork，也不承诺兼容任一上游 release、plugin、theme 或应用行为。

## Before changing code / 修改代码前

1. Read the [component index](components.md), each linked component contract, [runtime consumption](runtime-consumption.md), [compatibility profile](compatibility.md), and [upstream source-intake policy](upstream-source-intake.md).
2. Compare only the components your application actually owns. HIA-uView currently has 86 pre-release component contracts and does not implement automatic-import, global service, picker, request, storage, router, form-engine, or business-module compatibility layers; its list, scroll, popup, toast, tabbar, and pagination contracts remain caller-controlled local projections. `u-navbar` and `u-notice-bar` are new, distinct contracts rather than aliases of `u-nav-bar` and `u-notice`.
3. Keep the application responsible for data, routes, requests, identity, permissions, domain text, business validation, and lifecycle decisions. HIA-uView-Biz helpers, when they exist, belong in its separate `main-repo`.

1. 阅读 [component index](components.md)、每个关联组件契约、[runtime consumption](runtime-consumption.md)、[compatibility profile](compatibility.md) 及 [upstream source-intake policy](upstream-source-intake.md)。
2. 只比较应用实际拥有的组件。HIA-uView 当前有 86 个预发布组件契约，未实现 automatic-import、global service、picker、request、storage、router、form-engine 或业务模块兼容层；list、scroll、popup、toast、tabbar 和 pagination 仍是调用方受控的局部投影。`u-navbar` 与 `u-notice-bar` 是新建且独立的契约，不是 `u-nav-bar` 与 `u-notice` 的别名。
3. 应用仍负责数据、路由、请求、身份、权限、领域文字、业务校验和生命周期决定。未来 HIA-uView-Biz 的辅助工具也属于独立 `main-repo`。

## Manual migration steps / 人工迁移步骤

| Step / 步骤 | Do / 应做 | Do not infer / 不可推断 |
| --- | --- | --- |
| 1. Choose components / 选择组件 | Replace one documented component at a time using its explicit `U*` import or explicit `UView` plugin registration. / 逐个替换已有契约的组件，使用显式 `U*` import 或显式 `UView` plugin 注册。 | Do not globally replace every `u-*` tag or assume an unlisted component exists. / 不要全局替换所有 `u-*` tag，也不要假定未列组件存在。 |
| 2. Import styles / 导入样式 | Import `style.css` explicitly in application-owned global style setup. / 在应用拥有的全局样式设置中显式导入 `style.css`。 | Do not expect module import or plugin registration to inject theme/style automatically. / 不要期待 module import 或 plugin 注册自动注入 theme/style。 |
| 3. Own state / 保持状态所有权 | Bind props and handle emitted intent in application code; selection components remain controlled. / 在应用代码中绑定 props 并处理 emit 意图；选择组件始终受控。 | Do not expect components to mutate application state, run validation, fetch options, navigate, persist, or infer domain rules. / 不要期待组件修改应用状态、运行校验、获取 options、导航、持久化或推断领域规则。 |
| 4. Verify evidence / 验证证据 | Run repository-local checks appropriate to the documented profile and review declared compatibility evidence. / 运行适用于已记录 profile 的仓内检查，并复核声明的 compatibility evidence。 | Do not call jsdom/compiler output DevTools, device, accessibility, App/H5, cross-platform, or release proof. / 不要把 jsdom/compiler 输出称为 DevTools、真机、无障碍、App/H5、跨端或发布证明。 |

There is no codemod, source scanner, automatic import rewriter, or Tool `--write` mode. Keep a migration diff reviewable, make one component boundary change at a time, and verify the application on its own supported environments. A future Tool write feature needs separate authority, default dry-run behavior, safe-target allowlisting, overwrite refusal, and generated-code bilingual-comment checks.

不存在 codemod、源码扫描器、automatic import rewriter 或 Tool `--write` 模式。应让迁移 diff 保持可审阅、一次只改变一个组件边界，并在应用自身支持的环境中验证。未来任何 Tool 写入能力都需要独立授权、默认 dry-run、安全目标白名单、拒绝覆盖和生成代码双语注释检查。
