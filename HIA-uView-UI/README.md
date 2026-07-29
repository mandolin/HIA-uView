# HIA-uView-UI

This workspace contains the initial private HIA-uView UniApp UI implementation: `UButton`, `UStack`, `UNavBar`, `UCell`, `UInput`, `UField`, `UValidationMessage`, `UModal`, `UNotice`, `UEmpty`, the constrained UButton loading-message resolver, HIA theme tokens, a component manifest, and a compile-only `mp-weixin` fixture. It is not published and has no versioned external package API yet.

The initial target profile is UniApp Vue 3 on the WeChat Mini Program platform. App, H5, and other mini-program targets are not validated or promised yet. See the repository [compatibility profile](../docs/compatibility.md) and [HIA light-theme contract](../docs/theme.md).

The pre-release [UButton](../docs/button.md), [UStack](../docs/stack.md), [UNavBar](../docs/nav-bar.md), [UCell](../docs/cell.md), [UInput](../docs/input.md), [UField](../docs/field.md), [UValidationMessage](../docs/validation-message.md), [UModal](../docs/modal.md), [UNotice](../docs/notice.md), and [UEmpty](../docs/empty.md) contracts define the implemented boundaries. Component contracts, accessibility expectations, styling tokens, and upstream-reference boundaries are published before implementation changes. See the [design-system contract](../docs/design-system.md). This package must not own application data, business flows, backend integration, or industry fields.

The private runtime entry provides named component imports and an explicit `UView` Vue plugin; neither import automatically registers components or injects global styles. See [private runtime consumption](../docs/runtime-consumption.md).
