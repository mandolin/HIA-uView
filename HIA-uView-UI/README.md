# HIA-uView-UI

This workspace contains the initial private HIA-uView UniApp UI implementation: `HiaButton`, its constrained loading-message resolver, HIA theme tokens, a component manifest, and a compile-only `mp-weixin` fixture. It is not published and has no versioned external package API yet.

The initial target profile is UniApp Vue 3 on the WeChat Mini Program platform. App, H5, and other mini-program targets are not validated or promised yet. See the repository [compatibility profile](../docs/compatibility.md) and [HIA light-theme contract](../docs/theme.md).

The pre-release [HiaButton component contract](../docs/button.md) defines the first implementation boundary. Component contracts, accessibility expectations, styling tokens, and upstream-reference boundaries are published before component implementation begins. See the [design-system contract](../docs/design-system.md). This package must not own application data, business flows, backend integration, or industry fields.

The private runtime entry provides named component imports and an explicit `HiaUView` Vue plugin; neither import automatically registers components or injects global styles. See [private runtime consumption](../docs/runtime-consumption.md).
