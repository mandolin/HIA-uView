# HIA-uView

HIA-uView is a UniApp UI framework focused first on robust mini-program development, with future compatibility work planned for app and web targets. The repository contains two npm workspaces:

| Workspace | Purpose | npm package status |
| --- | --- | --- |
| `HIA-uView-UI/` | UI framework, components, composables and platform adapters | 107 controlled component contracts, theme tokens, locale resolver, manifest, and bounded compiler/runtime fixtures; private and not published |
| `HIA-uView-Tool/` | Development and verification tools that support HIA-uView-UI | Read-only `doctor`, `check contract`, `check adoption`, `inspect components`, `inspect compatibility`, and `inspect api-compatibility` CLI; private and not published |

The component index includes the controlled-choice surfaces `URadio`, `URadioGroup`, `UCheckbox`, and `UCheckboxGroup`, alongside navigation, form, feedback, data-display, overlay, and layout families. All remain private pre-release contracts.

## Development

The repository uses npm workspaces and requires Node.js 22 or later with npm 10 or later.

```bash
mise exec -- npm run check
mise exec -- npm test
mise exec -- npm run tool:doctor
mise exec -- npm run tool:check
mise exec -- npm run tool:inspect:components
mise exec -- npm run tool:inspect:compatibility
mise exec -- npm run tool:inspect:api-compatibility
mise exec -- npm run build:fixture:mp-weixin
```

`check` validates the workspace and package-contract baseline. `npm test` uses the Node.js built-in test runner to verify component, Tool, theme, and documentation contracts. Runtime source and component APIs remain private and unpublished; the active platform evidence is documented in [compatibility](docs/compatibility.md). The [component index](docs/components.md) links all 107 current contracts. The separate [API compatibility inventory](docs/api-compatibility.md) records the 99 names shared with the fixed uView-Pro 0.6.15 comparison, their current API-level migration dispositions, easycom/type delivery, and unresolved review questions. Component presence, compiler evidence, API migration, device support, and cross-platform support remain separate claims.

See [development notes](docs/development.md), the [public architecture overview](docs/architecture.md), and [Documentation Sys usage](docs/documentation.md).
The theme, style, accessibility, and localization boundary is documented in the [design-system contract](docs/design-system.md).
The [Tool contract](docs/tool.md) defines the development-only CLI boundary, and [adoption metadata](docs/tool-adoption.md) documents the bounded UI-only integration JSON. All implemented Tool commands are read-only; they do not scan application source, open an upstream checkout, access the network, or host business helpers. The private named-export, explicit-plugin, and explicit-style boundary is documented in [runtime consumption](docs/runtime-consumption.md). The compile-only [local catalog composition example](docs/local-composition.md) and [examples index](docs/examples.md) show caller-owned mock data, query, detail, and feedback state without creating a business module or backend contract. For existing uView-family applications, read the constrained [manual migration guidance](docs/migration-from-uview.md) before changing imports or component usage.

## Contributing

Read `AGENTS.md` and the relevant package README before adding code, dependencies or assets. Public documentation must remain user-focused; internal planning, research, audits, and task logs are maintained separately.

## License

HIA-uView is licensed under the [MIT License](LICENSE). Any incorporated third-party code or asset retains its own required notices; see the [upstream source-intake policy](docs/upstream-source-intake.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
