# Development

## Prerequisites

- Node.js 22 or later
- npm 10 or later

## Commands

```bash
mise exec -- npm run check
mise exec -- npm test
mise exec -- npm run test:runtime
mise exec -- npm run docs:check
mise exec -- npm run tool:doctor
mise exec -- npm run tool:check
mise exec -- npm run tool:inspect:components
mise exec -- npm run tool:inspect:compatibility
mise exec -- npm run tool:inspect:api-compatibility
mise exec -- node HIA-uView-Tool/src/cli.mjs check adoption --config path/to/hia-uview.config.json
mise exec -- npm run build:fixture:mp-weixin
mise exec -- npm run build:fixture:h5
```

`npm run check` verifies required files, the UI/Tool package metadata, and the Documentation Sys gate. `npm test` runs the Node contracts and private Vue runtime tests; `npm run test:runtime` runs only the latter. The runtime tests use one-shot `vitest run` with jsdom and do not start a Vitest UI/API/browser/watch server. `npm run docs:check` runs the static bilingual JSDoc check, a real HIA JSDoc generation pass, and the generated-output privacy check. The five listed Tool scripts execute read-only checks/inspections under the repository's `mise` environment. `inspect components`, `inspect compatibility`, `inspect api-compatibility`, and `check adoption` read only declared JSON manifests; they neither scan source nor execute builds, scripts, packages, Git, network, an upstream checkout, or DevTools. `npm run build:fixture:mp-weixin` performs the local compiler fixture only. `npm run build:fixture:h5` provides bounded static-build smoke evidence and is not an H5 runtime/support claim. Generated output is ignored; neither build is a device or release claim. Do not add a root dependency tree for HIA-uView-Biz or any other workspace. Future UI and Tool dependencies must be installed and locked inside this repository after their license and compatibility reviews.

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

HIA-uView-Tool is development-only. Its implemented pre-release CLI, declarative configuration, output, and runtime-isolation rules are defined in the [Tool contract](tool.md). `scaffold component` and every Tool write action remain unavailable. The separate offline [API compatibility generator](api-compatibility.md#offline-regeneration--离线重新生成) is a repository-maintainer script with one fixed output and explicit `--write`; it is not a Tool runtime command. Do not substitute project scripts, executable configuration, a package install, source scanner, or Biz helper for the documented Tool contract. The bounded [adoption metadata contract](tool-adoption.md) is UI-only; business helpers remain in HIA-uView-Biz `main-repo`.
