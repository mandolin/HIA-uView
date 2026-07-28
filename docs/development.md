# Development

## Prerequisites

- Node.js 22 or later
- npm 10 or later

## Commands

```bash
npm run check
npm test
npm run docs:check
```

`npm run check` verifies required files, the UI/Tool package metadata, and the Documentation Sys gate. `npm test` verifies the package and bilingual-documentation contracts with the Node.js built-in test runner. `npm run docs:check` runs the static bilingual JSDoc check, a real HIA JSDoc generation pass, and the generated-output privacy check. Do not add a root dependency tree for HIA-uView-Biz or any other workspace. Future UI and Tool dependencies must be installed and locked inside this repository after their license and compatibility reviews.

## Local integration

Before published package names and compatibility contracts are approved, cross-repository experiments must use a documented local link or dedicated fixture. They must not rely on an undeclared absolute path or a shared parent lockfile.

## Compatibility scope

The only active compatibility profile is UniApp Vue 3 for `mp-weixin`. Do not claim App, H5, or other mini-program compatibility without an explicit profile, fixture, and validation record. See [compatibility](compatibility.md).

## Design-system boundary

Before adding a component, review the [design-system contract](design-system.md). Component implementations must use documented token, style, localization, and accessibility boundaries; they must not add fonts, icons, themes, or i18n runtimes without a separate source and license review.

## Documentation Sys

All new code must follow [the Documentation Sys contract](documentation.md). Documentation generation is a development-only workflow, writes only to Git-ignored `temp/documentation/`, and must not embed source fragments or absolute paths.
