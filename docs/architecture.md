# Architecture overview

HIA-uView is an npm monorepo with a deliberately small initial boundary.

| Area | Responsibility | Current boundary |
| --- | --- | --- |
| `HIA-uView-UI` | UniApp UI framework, platform-facing APIs, component state behavior and themes | Must not own business data, backend integration, industry fields, or HIA-uView-Biz runtime rules. |
| `HIA-uView-Tool` | Tooling that verifies, develops or assists the UI framework | Must not become an undeclared runtime dependency of application projects or the UI package. |

The initial compatibility profile is UniApp Vue 3 for the WeChat Mini Program platform (`mp-weixin`). App and web support may be added through explicit compatibility profiles rather than assumptions embedded in components. See [compatibility](compatibility.md).

HIA-uView-Biz is a separate repository. It may consume a released UI version, a documented local link, or a dedicated integration fixture, but it must not import UI source files or share a parent lockfile. No component API has been published yet.
