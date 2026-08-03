# HIA-uView-UI

This workspace contains the HIA-uView UniApp UI implementation and 83 pre-release component contracts, including navigation, safe-area, feedback, local-overlay, form, content, and layout surfaces. The complete set is maintained in the [component index](../docs/components.md), alongside HIA theme tokens, the component manifest, and compiler/build fixtures. It is not published and has no versioned external package API yet.

The initial target profile is UniApp Vue 3 on the WeChat Mini Program platform. App, H5, and other mini-program targets are not validated or promised yet. See the repository [compatibility profile](../docs/compatibility.md) and [HIA light-theme contract](../docs/theme.md).

The pre-release [component index](../docs/components.md) records the complete current set, including [UNavbar](../docs/navbar.md), [UNoticeBar](../docs/notice-bar.md), [UConfigProvider](../docs/config-provider.md), and the other navigation, feedback, and composition surfaces. `u-navbar` and `u-notice-bar` are distinct contracts, not aliases of the earlier `u-nav-bar` and `u-notice` APIs. Component contracts, accessibility expectations, styling tokens, and upstream-reference boundaries are published before implementation changes. See the [design-system contract](../docs/design-system.md). This package must not own application data, business flows, backend integration, or industry fields.

The established controlled-choice contracts remain [URadio](../docs/radio.md), [URadioGroup](../docs/radio-group.md), [UCheckbox](../docs/checkbox.md), and [UCheckboxGroup](../docs/checkbox-group.md). Each is documented separately and remains application-state controlled.

The private runtime entry provides named component imports and an explicit `UView` Vue plugin; neither import automatically registers components or injects global styles. See [private runtime consumption](../docs/runtime-consumption.md).

The [local catalog composition example](../docs/local-composition.md) combines the current components with application-owned anonymous mock data and local state. It is compiler/runtime evidence only, not a HIA-uView-Biz module, industry starter, backend contract, router, or device-support claim. Existing uView-family consumers should also review the constrained [manual migration guidance](../docs/migration-from-uview.md); names are intentionally familiar, but no complete upstream compatibility or automatic migration is promised.
