# Changelog

All notable user-visible changes to HIA-uView will be recorded in this file.

## Unreleased

- Repository baseline initialized; no runtime implementation or published package exists yet.
- Added an explicit UI/Tool package-contract gate and a Node.js built-in contract test.
- Documented the initial UniApp Vue 3 and WeChat Mini Program compatibility profile; no component API is published yet.
- Documented token, style-isolation, accessibility, and localization boundaries without publishing a visual theme or component API.
- Added a development-only HIA Documentation Sys integration with bilingual JSDoc and privacy checks; no UI runtime dependency was added.
- Added the validated HIA default light-theme foundation tokens; no component API, font, icon, or dark-theme profile is published.
- Published the pre-release bilingual `UButton` contract, including independent API boundaries, state behavior, token families, localization, accessibility disclosure, and required release fixtures; no runtime implementation was added.
- Renamed the private runtime component namespace from `hia-*` to `u-*` before publication; the HIA-uView repository, package, CLI, and configuration identities remain unchanged.
- Published pre-release contracts for `UStack`, `UNavBar`, and `UCell`; the contracts keep layout, navigation intent, and generic information display outside business, routing, system-bar, icon, font, and backend boundaries.
- Published the pre-release HIA-uView-Tool contract for a development-only CLI, declarative configuration, stable diagnostics, write safety, privacy, and UI/runtime isolation; no Tool command was added.
