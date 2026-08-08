# Compatibility profile

## Initial profile

HIA-uView is being designed first for **UniApp Vue 3** applications targeting the **WeChat Mini Program** platform (`mp-weixin`). This is the only compatibility profile currently under active validation.

| Area | Current status | Contract |
| --- | --- | --- |
| UniApp runtime | Compiler-verified only | Vue 3 APIs and UniApp semantics are the initial target; runtime behavior remains separately scoped. |
| WeChat Mini Program | Compiler-verified and one repository fixture revision locally observed in DevTools | The repository currently builds `mp-weixin`. A recorded generated fixture revision was manually imported into local WeChat DevTools with `touristappid`, where the simulator rendered that bounded fixture and the Issues panel showed zero issues. This is not current 107-component runtime coverage, device, focus, screen-reader, production AppID, review, or release evidence. |
| H5 | Static-build smoke evidence only | The repository H5 fixture builds and passes bounded output checks; H5 runtime behavior and a support profile remain unverified and unpromised. |
| App / other mini-programs | Not validated | No compatibility or fallback behavior is promised yet. |
| UI component APIs | Private and pre-release | Each current component contract and the API inventory states a bounded scope; none is a published platform-support promise. |

The repository's declarative `HIA-uView-UI/hia-uview.compatibility.json` records compiler-fixture, local-DevTools-fixture, and jsdom-runtime evidence, together with explicitly unverified environments. `hia-uview-tool inspect compatibility` only reports that declaration; it neither executes the named target nor upgrades local DevTools fixture evidence into device, accessibility, cross-platform, review, or release evidence. API-shape and migration results belong to the separate [API compatibility inventory](api-compatibility.md) and `inspect api-compatibility`; neither inventory can substitute for platform evidence. See the [Tool contract](tool.md).

## Platform rules

- A component must not silently access device or platform APIs. Platform access needs an explicit adapter, feature detection, and a documented fallback or unsupported result.
- A component must not claim cross-platform support merely because it compiles. Each target needs its own fixture and validation evidence.
- Application and business rules belong outside this package. HIA-uView-Biz, when integrated later, must use a documented package contract rather than importing UI source files.

## Future profiles

App and web targets may be introduced as separate compatibility profiles after their platform differences, test fixtures, and public API effects are documented. They do not inherit support from the initial `mp-weixin` profile.
