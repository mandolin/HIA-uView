# Architecture overview

HIA-uView is an npm monorepo with a deliberately small initial boundary.

| Area | Responsibility | Current boundary |
| --- | --- | --- |
| `HIA-uView-UI` | UniApp UI framework and platform-facing APIs | No implementation contract has been frozen yet. |
| `HIA-uView-Tool` | Tooling that verifies, develops or assists the UI framework | Must not become an undeclared runtime dependency of application projects. |

The framework will begin with mini-program requirements. App and web support may be added through explicit compatibility profiles rather than assumptions embedded in components. Any decision that changes the package split, UniApp platform contract, component compatibility baseline or upstream-code adoption rule requires a documented architecture decision in the private project WorkZone.
