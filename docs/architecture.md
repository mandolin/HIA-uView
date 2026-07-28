# Architecture overview

HIA-uView is an npm monorepo with a deliberately small initial boundary.

| Area | Responsibility | Current boundary |
| --- | --- | --- |
| `HIA-uView-UI` | UniApp UI framework, platform-facing APIs, component state behavior and themes | Must not own business data, backend integration, industry fields, or HIA-uView-Biz runtime rules. |
| `HIA-uView-Tool` | Development-time CLI and tooling that verifies, inspects, or prepares the UI framework | Must not become an undeclared runtime dependency of application projects or the UI package; see the [Tool contract](tool.md). |

The initial compatibility profile is UniApp Vue 3 for the WeChat Mini Program platform (`mp-weixin`). App and web support may be added through explicit compatibility profiles rather than assumptions embedded in components. See [compatibility](compatibility.md).

Themes, styles, accessibility, and localization use a separate [design-system contract](design-system.md). It defines semantic boundaries and verification requirements without publishing a runtime component API or brand assets. A pre-release component contract may be documented before its implementation, as with [HiaButton](button.md).

Source documentation uses a development-only [HIA Documentation Sys integration](documentation.md). It is outside the UI runtime boundary and its generated artifacts are not package inputs.

HIA-uView-Biz is a separate repository. It may consume a released UI version, a documented local link, or a dedicated integration fixture, but it must not import UI source files or share a parent lockfile. No runtime component API has been published yet.
