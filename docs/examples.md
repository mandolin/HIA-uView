# Examples and verification fixtures / 示例与验证 fixture

HIA-uView has one intentionally small public-in-repository example: the local “catalog — query — detail” composition under `HIA-uView-UI/fixtures/mp-weixin`. It is a compile/runtime verification fixture, not an application starter, business module, industry template, backend contract, or a release-ready mini-program.

HIA-uView 当前只有一个刻意收敛、在仓内公开的示例：位于 `HIA-uView-UI/fixtures/mp-weixin` 的本地“目录—查询—详情”组合。它是 compiler/runtime 验证 fixture，不是应用 starter、业务模块、行业模板、后端契约或可发布小程序。

## What it demonstrates / 它演示什么

- Explicit local imports of the current UI runtime and explicit application-owned state.
- Version-controlled anonymous mock records, synchronous query projection, local detail selection, controlled feedback and confirmation intent.
- Compiler input for the `mp-weixin` profile and Vue/jsdom-compatible runtime composition coverage.

- 当前 UI runtime 的显式本地导入，以及由应用拥有的显式状态。
- 受版本控制的匿名 mock 记录、同步查询投影、本地详情选择、受控反馈和确认意图。
- `mp-weixin` profile 的 compiler 输入，以及与 Vue/jsdom 兼容的 runtime 组合覆盖。

Read the full [local composition contract](local-composition.md) before reusing any pattern. The fixture contains no network, Directus, authentication, router, storage, global service, business schema, arbitrary options source, native picker/popup, image, icon, font, or package-release behavior.

在复用任何模式前，请阅读完整的 [local composition contract](local-composition.md)。fixture 不包含 network、Directus、身份、router、storage、global service、业务 schema、任意 options source、native picker/popup、图片、图标、字体或包发布行为。

## Evidence boundary / 证据边界

`npm run build:fixture:mp-weixin` provides only local compiler evidence. `npm test` runs Node contracts and Vue/jsdom runtime checks. Neither command starts a development server or repeats the separate limited local DevTools fixture observation recorded in the compatibility profile. Neither command proves physical devices, screen readers, focus/keyboard behavior, production AppID, App/H5/other mini-program targets, package publication, or release readiness. The declared evidence is also available through `npm run tool:inspect:compatibility`.

`npm run build:fixture:mp-weixin` 只提供本地 compiler 证据。`npm test` 运行 Node 契约与 Vue/jsdom runtime 检查。两个命令都不会启动开发服务器，也不会重复 compatibility profile 中另行记录的受限本机 DevTools fixture 观察。它们均不能证明真机、读屏、焦点/键盘行为、真实 AppID、App/H5/其他小程序目标、包发布或发布就绪性。已声明 evidence 还可通过 `npm run tool:inspect:compatibility` 查看。
