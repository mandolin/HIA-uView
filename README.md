# HIA-uView

HIA-uView is a UniApp UI framework focused first on robust mini-program development, with future compatibility work planned for app and web targets. The repository contains two npm workspaces:

| Workspace | Purpose | npm package status |
| --- | --- | --- |
| `HIA-uView-UI/` | UI framework, components, composables and platform adapters | Manifest only; not published |
| `HIA-uView-Tool/` | Development and verification tools that support HIA-uView-UI | Manifest only; not published |

## Development

The repository uses npm workspaces and requires Node.js 22 or later with npm 10 or later.

```bash
npm run check
```

`check` validates the workspace and package-contract baseline. `npm test` uses the Node.js built-in test runner to verify that contract. Runtime source and component APIs remain unpublished; the active compatibility profile is documented in [compatibility](docs/compatibility.md). The first pre-release component contract, with no implementation yet, is [HiaButton](docs/button.md).

See [development notes](docs/development.md), the [public architecture overview](docs/architecture.md), and [Documentation Sys usage](docs/documentation.md).
The theme, style, accessibility, and localization boundary is documented in the [design-system contract](docs/design-system.md).

## Contributing

Read `AGENTS.md` and the relevant package README before adding code, dependencies or assets. Public documentation must remain user-focused; internal planning, research, audits, and task logs are maintained separately.

## License

HIA-uView is licensed under the [MIT License](LICENSE). Any incorporated third-party code or asset retains its own required notices; see the [upstream source-intake policy](docs/upstream-source-intake.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
