# HIA-uView

HIA-uView is a UniApp UI framework focused first on robust mini-program development, with future compatibility work planned for app and web targets. The repository contains two npm workspaces:

| Workspace | Purpose | npm package status |
| --- | --- | --- |
| `HIA-uView-UI/` | UI framework, components, composables and platform adapters | `UButton`, `UStack`, `UNavBar`, `UCell`, `UInput`, `UField`, `UValidationMessage`, `UModal`, `UNotice`, `UEmpty`, `URadio`, `URadioGroup`, `UCheckbox`, `UCheckboxGroup`, theme tokens, locale resolver, manifest, and `mp-weixin` compile fixture; private and not published |
| `HIA-uView-Tool/` | Development and verification tools that support HIA-uView-UI | Read-only `doctor`, `check contract`, `check adoption`, `inspect components`, and `inspect compatibility` CLI; private and not published |

## Development

The repository uses npm workspaces and requires Node.js 22 or later with npm 10 or later.

```bash
npm run check
npm test
npm run tool:doctor
npm run tool:check
npm run tool:inspect:components
npm run tool:inspect:compatibility
npm run build:fixture:mp-weixin
```

`check` validates the workspace and package-contract baseline. `npm test` uses the Node.js built-in test runner to verify component, Tool, theme, and documentation contracts. Runtime source and component APIs remain private and unpublished; the active compatibility profile is documented in [compatibility](docs/compatibility.md). The [component index](docs/components.md) links every current contract: [UButton](docs/button.md), [UStack](docs/stack.md), [UNavBar](docs/nav-bar.md), [UCell](docs/cell.md), [UInput](docs/input.md), [UField](docs/field.md), [UValidationMessage](docs/validation-message.md), [UModal](docs/modal.md), [UNotice](docs/notice.md), [UEmpty](docs/empty.md), [URadio](docs/radio.md), [URadioGroup](docs/radio-group.md), [UCheckbox](docs/checkbox.md), and [UCheckboxGroup](docs/checkbox-group.md). These are independently implemented with Vue runtime and compile-only fixture evidence; this does not imply a published API, device, accessibility-tree, asynchronous-validation, modal, timer, list-loading, or cross-platform guarantee.

See [development notes](docs/development.md), the [public architecture overview](docs/architecture.md), and [Documentation Sys usage](docs/documentation.md).
The theme, style, accessibility, and localization boundary is documented in the [design-system contract](docs/design-system.md).
The [Tool contract](docs/tool.md) defines the development-only CLI boundary, and [adoption metadata](docs/tool-adoption.md) documents the bounded UI-only integration JSON. All implemented Tool commands are read-only; it does not scan application source or host business helpers. The private named-export, explicit-plugin, and explicit-style boundary is documented in [runtime consumption](docs/runtime-consumption.md). The compile-only [local catalog composition example](docs/local-composition.md) and [examples index](docs/examples.md) show caller-owned mock data, query, detail, and feedback state without creating a business module or backend contract. For existing uView-family applications, read the constrained [manual migration guidance](docs/migration-from-uview.md) before changing imports or component usage.

## Contributing

Read `AGENTS.md` and the relevant package README before adding code, dependencies or assets. Public documentation must remain user-focused; internal planning, research, audits, and task logs are maintained separately.

## License

HIA-uView is licensed under the [MIT License](LICENSE). Any incorporated third-party code or asset retains its own required notices; see the [upstream source-intake policy](docs/upstream-source-intake.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
