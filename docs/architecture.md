# Architecture overview

HIA-uView is an npm monorepo with a deliberately small initial boundary.

| Area | Responsibility | Current boundary |
| --- | --- | --- |
| `HIA-uView-UI` | UniApp UI framework, platform-facing APIs, component state behavior and themes | Must not own business data, backend integration, industry fields, or HIA-uView-Biz runtime rules. |
| `HIA-uView-Tool` | Development-time CLI and tooling that verifies, inspects, or prepares the UI framework | May consume only declared UI metadata JSON; must not become an undeclared runtime dependency, source scanner, or business helper. See the [Tool contract](tool.md). |

The initial compatibility profile is UniApp Vue 3 for the WeChat Mini Program platform (`mp-weixin`). App and web support may be added through explicit compatibility profiles rather than assumptions embedded in components. See [compatibility](compatibility.md).

Themes, styles, accessibility, and localization use a separate [design-system contract](design-system.md). It defines semantic boundaries and verification requirements without publishing a versioned external runtime API or brand assets. [UButton](button.md), [UStack](stack.md), [UNavBar](nav-bar.md), [UCell](cell.md), [UInput](input.md), [UField](field.md), [UValidationMessage](validation-message.md), [UModal](modal.md), [UNotice](notice.md), and [UEmpty](empty.md) are private independently implemented components with explicit pre-release contracts.

Source documentation uses a development-only [HIA Documentation Sys integration](documentation.md). It is outside the UI runtime boundary and its generated artifacts are not package inputs.

HIA-uView-Biz is a separate repository. It may consume a released UI version, a documented local link, or a dedicated integration fixture, but it must not import UI source files or share a parent lockfile. Biz modules, domain configuration, API/adapter/Directus helpers, identity, pages, and business-tooling CLI capabilities belong in that separate Biz repository, not in HIA-uView-Tool. No versioned runtime component API has been published yet.
