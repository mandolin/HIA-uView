# 开发构建链风险披露 / Development toolchain risk disclosure

状态 / Status：已接受的受控开发期例外 / accepted controlled development-time exception

生效日期 / Effective date：2026-07-29
复核责任 / Review owner：HIA-uView maintainers

## 决定 / Decision

HIA-uView 当前接受官方 UniApp/Vue 编译依赖及私有 Vue runtime 测试链中已知的安全告警，以便为本仓、受信任的本地开发建立真实的 `mp-weixin` 编译和组件行为证据。此决定是对风险的透明接受，不是“无风险”或“已修复”的声明。

HIA-uView currently accepts known security advisories in its official UniApp/Vue compilation dependencies and private Vue runtime-test chain so that trusted local development of this repository can obtain real `mp-weixin` compilation and component-behavior evidence. This is a transparent acceptance of risk; it is not a claim that the dependencies are risk-free or remediated.

## 已知事实 / Known facts

- 2026-07-29 的官方 registry 审计结果为 44 项：14 low、12 moderate、18 high、0 critical。告警包含 Vite、UniApp CLI 传递链、Vue Test Utils 的传递链及其依赖；`npm audit fix --dry-run --package-lock-only` 不产生可安全变更，建议的替换会要求不兼容或不受当前验证支持的版本变化。
- The official registry audit on 2026-07-29 reported 44 findings: 14 low, 12 moderate, 18 high, and 0 critical. Findings include Vite, the transitive UniApp CLI chain, the Vue Test Utils transitive chain, and their dependencies; `npm audit fix --dry-run --package-lock-only` produces no safe change, while suggested replacements require incompatible or currently unverified version changes.

- 598 个唯一传递 package 的清单未发现 GPL、AGPL、LGPL、SSPL 或 BSL，但三个传递包缺少 package manifest 的许可证元数据；这不是“许可证已完全澄清”的声明。
- The inventory of 598 unique transitive packages found no GPL, AGPL, LGPL, SSPL, or BSL metadata, but three transitive packages lack license metadata in their package manifests; this is not a claim that licensing has been fully clarified.

- 精确版本、完整性、审计细节和官方构建链来源记录在私有维护账本中；公开的直接依赖 notice 见 [third-party notices](../THIRD_PARTY_NOTICES.md)。
- Exact versions, integrity values, audit details, and official toolchain provenance are retained in the private maintenance ledger; public direct-dependency notices are in [third-party notices](../THIRD_PARTY_NOTICES.md).

## 当前允许范围 / Allowed scope now

该例外仅适用于此仓受信任内容的本地开发期编译和验证，包括 `vitest run` 的私有组件行为测试；依赖只存在于根 `devDependencies`，不是 UI 或 Tool 的运行时依赖，也不得作为发布包的 bundled dependency。

This exception applies only to local development-time compilation and validation of trusted content in this repository, including private component-behavior tests run with `vitest run`. The dependencies exist only in root `devDependencies`, are not UI or Tool runtime dependencies, and must not become bundled dependencies of a published package.

在该范围内，可以运行锁定的本地 compiler 完成 `mp-weixin` fixture build、静态检查、私有 `vitest run`、文档检查和包内容检查。不得把 compile-only 或 jsdom-only 结果表述为真机、读屏、焦点、跨端或生产安全证据。

Within this scope, the locked local compiler may run an `mp-weixin` fixture build, static checks, private `vitest run`, documentation checks, and package-content checks. Compile-only or jsdom-only results must not be represented as evidence for devices, screen readers, focus behavior, cross-platform support, or production security.

## 明确禁止 / Explicitly prohibited

- 不启动 Vite/UniApp 开发服务器，不向其提供不受信任的项目、路径、素材或网络输入。
- Do not start a Vite/UniApp development server or provide it with untrusted projects, paths, assets, or network input.

- 不启动 Vitest UI、API、browser 或 watch server；只允许一次性、本地、无网络的 `vitest run`。
- Do not start a Vitest UI, API, browser, or watch server; only one-shot, local, network-free `vitest run` is allowed.

- 不将这些开发依赖暴露为 Tool 命令、CI 中来自不受信任 fork/贡献的执行面，或任何面向外部用户的托管服务。
- Do not expose these development dependencies through a Tool command, an execution surface for untrusted forks/contributions in CI, or any externally hosted service.

- 不以该例外发布 UI/Tool runtime、npm 包或生产构建产物；不得通过 `npm audit fix --force` 或未审计的替代包绕过版本/兼容性审查。
- Do not use this exception to release UI/Tool runtime, an npm package, or production build artifacts; do not bypass version and compatibility review with `npm audit fix --force` or an unaudited replacement package.

## 开发者告知与选择 / Developer notice and choice

在安装依赖或运行 compile fixture 前，开发者必须阅读本页，并仅在接受上述本地受控范围后继续。若不能接受，应只运行不涉及编译器的静态检查，或等待维护者提供经复核的替代构建链。

Before installing dependencies or running the compile fixture, a developer must read this page and proceed only if they accept the controlled local scope above. If they cannot accept it, they should run only checks that do not involve the compiler or wait for a maintainer-reviewed alternative toolchain.

维护者必须在拉取请求、变更记录或发布说明中保留该例外的链接，直至例外被关闭；不得用“仅开发依赖”弱化已知风险。

Maintainers must retain a link to this exception in pull requests, change records, or release notes until it is closed; known risk must not be minimized by calling it “only a development dependency.”

## 逐步降险 / Progressive risk reduction

风险不以一次性阻断为默认策略，而是随使用范围扩大逐步收敛。每次满足下列触发条件时，必须重新审计、记录结果，并收紧或移除例外。

Risk is not managed by default through a one-time block. It is reduced progressively as the scope of use expands. When any trigger below is met, maintainers must re-audit, record the result, and narrow or remove the exception.

| 触发条件 / Trigger | 必须动作 / Required action |
| --- | --- |
| C2/P3 收尾、DCloud/Vite/Vue/Vitest/Test Utils/jsdom 升级或 lockfile 大幅变化 / C2/P3 closeout, DCloud/Vite/Vue/Vitest/Test Utils/jsdom upgrade, or material lockfile change | 重新运行安全、许可证、编译、runtime test 和包内容审计；仅在兼容性证据充分时升级。 / Re-run security, license, compilation, runtime-test, and package-content audits; upgrade only with sufficient compatibility evidence. |
| 需要启动开发服务器、处理不受信任输入、使用外部 CI 或扩大协作者范围 / A dev server, untrusted input, external CI, or a broader contributor scope is needed | 先做专门威胁建模与隔离设计；未获新决定前不扩大使用范围。 / First perform dedicated threat modeling and isolation design; do not expand scope without a new decision. |
| 准备发布 npm 包、生产构建或公开可复用 starter / Preparing an npm release, production build, or public reusable starter | 将此例外提升为发布门禁：修复、替换或以经过审计的官方组合消除不接受的风险，并更新公告。 / Promote this exception to a release gate: remediate, replace, or use an audited official combination to eliminate unacceptable risk, then update the notice. |
| 上游提供兼容的修复版本或官方公告 / Upstream provides a compatible fixed version or official advisory | 复现审计和 fixture build；通过后升级并降低或关闭例外。 / Repeat the audit and fixture build; upgrade and reduce or close the exception after they pass. |

## 非结论 / Non-conclusions

本页不授予 App、H5、其他小程序平台、真机、可访问性辅助技术或生产环境的支持声明。兼容性范围仍以 [compatibility](compatibility.md) 和每个后续验证记录为准。

This page grants no support claim for App, H5, other mini-program platforms, physical devices, assistive technology, or production environments. Compatibility remains governed by [compatibility](compatibility.md) and each subsequent validation record.
