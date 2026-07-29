# Development

## Prerequisites

- Node.js 22 or later
- npm 10 or later

## Commands

```bash
npm run check
npm test
npm run test:runtime
npm run docs:check
npm run tool:doctor
npm run tool:check
node HIA-uView-Tool/src/cli.mjs inspect components
node HIA-uView-Tool/src/cli.mjs inspect compatibility
node HIA-uView-Tool/src/cli.mjs check adoption --config path/to/hia-uview.config.json
npm run build:fixture:mp-weixin
```

`npm run check` verifies required files, the UI/Tool package metadata, and the Documentation Sys gate. `npm test` runs the Node contracts and private Vue runtime tests; `npm run test:runtime` runs only the latter. The runtime tests use one-shot `vitest run` with jsdom and do not start a Vitest UI/API/browser/watch server. `npm run docs:check` runs the static bilingual JSDoc check, a real HIA JSDoc generation pass, and the generated-output privacy check. `npm run tool:doctor` and `npm run tool:check` execute the default read-only Tool checks. `inspect components`, `inspect compatibility`, and `check adoption` read only declared JSON manifests; they neither scan application source nor execute builds, scripts, packages, Git, network, or DevTools. `npm run build:fixture:mp-weixin` performs the local compiler fixture only; its generated output is ignored and is not a device or release claim. Do not add a root dependency tree for HIA-uView-Biz or any other workspace. Future UI and Tool dependencies must be installed and locked inside this repository after their license and compatibility reviews.

## Development toolchain risk

The official UniApp/Vue compilation chain is accepted for a deliberately narrow, trusted local development scope. It has known upstream security findings and is not approved for a dev server, untrusted input, external CI execution, package release, or production use. Read and explicitly accept the boundaries, known facts, and progressive remediation triggers in [development toolchain risk disclosure](development-toolchain-risk.md) before installing or running the compile fixture.

## Local integration

Before published package names and compatibility contracts are approved, cross-repository experiments must use a documented local link or dedicated fixture. They must not rely on an undeclared absolute path or a shared parent lockfile.

## Compatibility scope

The only active compatibility profile is UniApp Vue 3 for `mp-weixin`. Do not claim App, H5, or other mini-program compatibility without an explicit profile, fixture, and validation record. See [compatibility](compatibility.md).

## Design-system boundary

Before adding a component, review the [design-system contract](design-system.md). Component implementations must use documented token, style, localization, and accessibility boundaries; they must not add fonts, icons, themes, or i18n runtimes without a separate source and license review.

## Documentation Sys

All new code must follow [the Documentation Sys contract](documentation.md). Documentation generation is a development-only workflow, writes only to Git-ignored `temp/documentation/`, and must not embed source fragments or absolute paths.

## Tool boundary

HIA-uView-Tool is development-only. Its implemented pre-release CLI, declarative configuration, output, and runtime-isolation rules are defined in the [Tool contract](tool.md). `scaffold component` and every write action remain unavailable. Do not substitute project scripts, executable configuration, a package install, source scanner, or Biz helper for the documented contract. The bounded [adoption metadata contract](tool-adoption.md) is UI-only; business helpers remain in HIA-uView-Biz `main-repo`.
