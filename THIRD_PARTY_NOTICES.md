# Third-party notices

## Development documentation dependencies

| Package | Version / integrity | License | Purpose and distribution boundary |
| --- | --- | --- | --- |
| `@mandolin/jsdoc-plugin-hia-sys` | `0.1.2`; `sha512-FO8Go6tNb3WCDEqnm78BiLdj07eSbTtH3EvzUWUj9PiMzXoLJTqV2VEOZ2BKm7f0Y2GGgqCNtFSdS6bfqw8J2w==` | MIT | HIA JSDoc metadata, bilingual-documentation and integration output plugin; development only, never a UI runtime dependency. |
| `@mandolin/jsdoc-theme-hia` | `0.1.1`; `sha512-6wGuEH28N3ms91nI+b/sgn5gAdBqdpQjICMVxkPoJWmKWoAncEHVdmHcpwd0ot+62hvTKKaEjQ9uf6VutS0WGQ==` | MIT | HIA JSDoc HTML theme; development-only generated documentation. It does not bundle font files. |
| `jsdoc` | `4.0.5`; `sha512-P4C6MWP9yIlMiK8nwoZvxN84vb6MsnXcHuy7XzVOvQoCizWX5JFCBsWIIWKXBltpoRZXddUOVQmCTOZt9yDj9g==` | Apache-2.0 | JSDoc generator required by the HIA documentation integration; development only. |

## Development compilation dependencies

The dependencies in this section are accepted only for the controlled local development scope described in [development toolchain risk disclosure](docs/development-toolchain-risk.md). They are root development dependencies, never UI or Tool runtime dependencies, and must not be bundled in a published package.

| Package | Version / integrity | License | Purpose and distribution boundary |
| --- | --- | --- | --- |
| `@dcloudio/types` | `3.4.31`; `sha512-YAqOfJpcAwMs4Fagv2oP+iRHSCJOJoN8JUYyoRD6gwfANhsI9QaYj4/j22FzSopfHkqjX50B7YkG/VRAyz9OnA==` | Apache-2.0 | UniApp peer type support for the local compile fixture; development only. |
| `@dcloudio/uni-app` | `3.0.0-5010520260709002`; `sha512-yMfuGjj52VIgdG1VJ/YpQus3TyVnlc1JYt7rcqGfsSG+pPI7M/kTKSEIsXZ2acEPKH6hHYX/DC3k4wPdwf18Ag==` | Apache-2.0 | UniApp local fixture runtime/compiler support; development only. |
| `@dcloudio/uni-mp-weixin` | `3.0.0-5010520260709002`; `sha512-Nmd8Gst6BnMbhouoc7JWZaYA8xCU9Wp+vu1/QTjn0f0nTUHKLXvQMV/itC9X9CLQiebLUpZ4BcsDaRIPHiFVhg==` | Apache-2.0 | UniApp `mp-weixin` compiler target; development only. |
| `@dcloudio/vite-plugin-uni` | `3.0.0-5010520260709002`; `sha512-HynSNsicIj8KJ9OztI3hVcU7inFw/vzQGauqfzlLV+yBNRhAGqxx9WKN/NZiN6HVpOc8xTyICr0x4XlI7r7f7A==` | Apache-2.0 | Official UniApp Vite compiler plugin for the local fixture; development only. |
| `vite` | `5.2.8`; `sha512-OyZR+c1CE8yeHw5V5t59aXsUPPVTHMDjEZz8MgguLL/Q7NblxhZUlTu9xSPqlsUO/y+X7dlU05jdhvyycD55DA==` | MIT | Exact Vite peer aligned with the recorded official compiler fixture; development only. |
| `vue` | `3.4.21`; `sha512-5hjyV/jLEIKD/jYl4cavMcnzKwjMKohureP8ejn3hhEjwhWIhWeuzL2kJAjzl/WyVsgPY56Sy4Z40C3lVshxXA==` | MIT | Exact Vue compiler version aligned with the recorded official fixture; development only. |
| `typescript` | `5.7.3`; `sha512-84MVSjMEHP+FQRPy3pX9sTVV/INIex71s9TL2Gm5FG/WG1SqXeKyZ0k7/blY/4FdOzI12CBy1vGc4og/eus0fw==` | Apache-2.0 | Verifies the private package-owned declaration entry and disposable local-consumer fixture; root development only and never a UI/Tool runtime dependency or published bundle requirement. |

## Development runtime-test dependencies

The dependencies in this section are accepted only for the controlled local development scope described in [development toolchain risk disclosure](docs/development-toolchain-risk.md). They support one-shot private component behavior tests only; they must not start a Vitest UI/API/browser/watch server, become UI/Tool runtime dependencies, or be bundled in a published package.

| Package | Version / integrity | License | Purpose and distribution boundary |
| --- | --- | --- | --- |
| `@vitejs/plugin-vue` | `5.2.4`; `sha512-7Yx/SXSOcQq5HiiV3orevHUFn+pmMB4cgbEkDYgnkUWb0WfeQ/wa2yFv6D5ICiCQOVpjA7vYDXrC7AGO8yjDHA==` | MIT | Vue SFC transform for the private Vitest chain; development only. |
| `@vue/test-utils` | `2.4.0`; `sha512-BKB9aj1yky63/I3IwSr1FjUeHYsKXI7D6S9F378AHt7a5vC0dLkOBtSsFXoRGC/7BfHmiB9HRhT+i9xrUHoAKw==` | MIT | Private Vue component mounting and interaction assertions; development only. |
| `jsdom` | `26.1.0`; `sha512-Cvc9WUhxSMEo4McES3P7oK3QaXldCfNWp7pl2NNeiIFlCoLr3kfq9kb1fxftiwk1FLV7CvpvDfonxtzUDeSOPg==` | MIT | Local DOM environment for one-shot component tests; development only. |
| `vitest` | `3.2.7`; `sha512-KrxIJ62Fd89gfysR4WotlgZABiz2dqFPgqGzX7s+CwsqLFomRH7777ZcrOD6+WVAh7khPQP41A+BKbpcJFrdEg==` | MIT | One-shot private runtime-test runner; development only, no UI/API/browser/watch server. |

No third-party UI source code, UI runtime dependency, asset, font, icon, theme resource, or locale resource has been incorporated into HIA-uView as of 2026-07-28.

Before any reviewed upstream source is adopted, add a per-item entry here following [the source-intake policy](docs/upstream-source-intake.md). The entry must identify the source repository, package version, immutable commit, exact source path, license/notice, HIA target path, change summary and verification evidence.

Third-party notices are additive: do not remove an existing notice merely because HIA later modifies the adopted code.

## Reviewed MIT component derivations

The following components are independently rewritten after reviewing the named files from `anyup/uView-Pro`, `uview-pro@0.6.13`, immutable commit `3bc1948d8f7c5d2bcb1ba3434cede1e709391a62`. The source files are covered by the repository MIT License. No upstream `$u` runtime, TypeScript props/types, assets, images, fonts, icons, brand material, networking, router, platform-system access, or generated output is incorporated. Each target is verified by the repository component contract tests, runtime tests where applicable, and H5/`mp-weixin` fixtures before release.

| Upstream source path | HIA target | Adoption form |
| --- | --- | --- |
| `src/uni_modules/uview-pro/components/u-navbar/u-navbar.vue` | `HIA-uView-UI/src/components/u-navbar/u-navbar.vue` | Materially derived, independently rewritten controlled title/side-intent surface. |
| `src/uni_modules/uview-pro/components/u-status-bar/u-status-bar.vue` | `HIA-uView-UI/src/components/u-status-bar/u-status-bar.vue` | Materially derived, independently rewritten caller-height spacer. |
| `src/uni_modules/uview-pro/components/u-safe-bottom/u-safe-bottom.vue` | `HIA-uView-UI/src/components/u-safe-bottom/u-safe-bottom.vue` | Materially derived, independently rewritten caller-height spacer. |
| `src/uni_modules/uview-pro/components/u-back-top/u-back-top.vue` | `HIA-uView-UI/src/components/u-back-top/u-back-top.vue` | Materially derived, independently rewritten click-intent surface without scroll observation. |
| `src/uni_modules/uview-pro/components/u-cell-item/u-cell-item.vue` | `HIA-uView-UI/src/components/u-cell-item/u-cell-item.vue` | Materially derived, independently rewritten local information row. |
| `src/uni_modules/uview-pro/components/u-loading/u-loading.vue` | `HIA-uView-UI/src/components/u-loading/u-loading.vue` | Materially derived, independently rewritten static indicator. |
| `src/uni_modules/uview-pro/components/u-loading-popup/u-loading-popup.vue` | `HIA-uView-UI/src/components/u-loading-popup/u-loading-popup.vue` | Materially derived, independently rewritten local overlay composition. |
| `src/uni_modules/uview-pro/components/u-mask/u-mask.vue` | `HIA-uView-UI/src/components/u-mask/u-mask.vue` | Materially derived, independently rewritten controlled mask. |
| `src/uni_modules/uview-pro/components/u-no-network/u-no-network.vue` | `HIA-uView-UI/src/components/u-no-network/u-no-network.vue` | Materially derived, independently rewritten text-first panel; upstream `image.ts` asset excluded. |
| `src/uni_modules/uview-pro/components/u-notice-bar/u-notice-bar.vue` | `HIA-uView-UI/src/components/u-notice-bar/u-notice-bar.vue` | Materially derived, independently rewritten non-scrolling banner. |
| `src/uni_modules/uview-pro/components/u-top-tips/u-top-tips.vue` | `HIA-uView-UI/src/components/u-top-tips/u-top-tips.vue` | Materially derived, independently rewritten local feedback tip. |
| `src/uni_modules/uview-pro/components/u-transition/u-transition.vue` | `HIA-uView-UI/src/components/u-transition/u-transition.vue` | Materially derived, independently rewritten finite CSS transition surface. |
| `src/uni_modules/uview-pro/components/u-config-provider/u-config-provider.vue` | `HIA-uView-UI/src/components/u-config-provider/u-config-provider.vue` | Materially derived, independently rewritten same-tree theme/density scope. |
| `src/uni_modules/uview-pro/components/u-root-portal/u-root-portal.vue` | `HIA-uView-UI/src/components/u-root-portal/u-root-portal.vue` | Materially derived, independently rewritten same-tree portal fallback. |
| `src/uni_modules/uview-pro/components/u-fab/u-fab.vue` | `HIA-uView-UI/src/components/u-fab/u-fab.vue` | Materially derived, independently rewritten labeled local action control. |
| `src/uni_modules/uview-pro/components/u-action-sheet-item/u-action-sheet-item.vue` | `HIA-uView-UI/src/components/u-action-sheet-item/u-action-sheet-item.vue` | Materially derived, independently rewritten caller-controlled action-sheet item without parent injection or sheet close behavior. |
| `src/uni_modules/uview-pro/components/u-city-select/u-city-select.vue` | `HIA-uView-UI/src/components/u-city-select/u-city-select.vue` | Materially derived, independently rewritten finite caller-column selector without region data, geolocation, or address service. |
| `src/uni_modules/uview-pro/components/u-message-input/u-message-input.vue` | `HIA-uView-UI/src/components/u-message-input/u-message-input.vue` | Materially derived, independently rewritten fixed-length controlled input without code validation, messaging, timer, or keyboard ownership. |
| `src/uni_modules/uview-pro/components/u-car-keyboard/u-car-keyboard.vue` | `HIA-uView-UI/src/components/u-car-keyboard/u-car-keyboard.vue` | Materially derived, independently rewritten caller-row keyboard without region keys, randomization, long press, timer, or vehicle rules. |
| `src/uni_modules/uview-pro/components/u-keyboard/u-keyboard.vue` | `HIA-uView-UI/src/components/u-keyboard/u-keyboard.vue` | Materially derived, independently rewritten local controlled keyboard composition without global service, focus, locale, or model ownership. |
| `src/uni_modules/uview-pro/components/u-number-keyboard/u-number-keyboard.vue` | `HIA-uView-UI/src/components/u-number-keyboard/u-number-keyboard.vue` | Materially derived, independently rewritten finite caller-key keyboard without numeric generation, format rule, long press, timer, or icon asset. |
| `src/uni_modules/uview-pro/components/u-avatar-cropper/u-avatar-cropper.vue` | `HIA-uView-UI/src/components/u-avatar-cropper/u-avatar-cropper.vue` | Materially derived, independently rewritten crop-geometry intent surface without `weCropper`, Canvas, image chooser, pixel processing, or file output. |
| `src/uni_modules/uview-pro/components/u-upload/u-upload.vue` | `HIA-uView-UI/src/components/u-upload/u-upload.vue` | Materially derived, independently rewritten caller file-state intent list without chooser, file bytes, upload, deletion, preview implementation, network, or cache. |
| `src/uni_modules/uview-pro/components/u-verification-code/u-verification-code.vue` | `HIA-uView-UI/src/components/u-verification-code/u-verification-code.vue` | Materially derived, independently rewritten caller remaining/request-state projection without sending, timer, storage, network, identity, or platform state. |
