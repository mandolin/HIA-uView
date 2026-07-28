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

`check` currently validates the repository baseline. Runtime source, public APIs, UniApp compatibility profiles and release tooling will be added only after their contracts and upstream-source intake records are reviewed.

See [development notes](docs/development.md) and the [public architecture overview](docs/architecture.md).

## Contributing

Read `AGENTS.md` and the relevant package README before adding code, dependencies or assets. Public documentation must remain user-focused; design records, research, audits and task logs belong to the separate private WorkZone.

## License

HIA-uView is licensed under the [MIT License](LICENSE). Any incorporated third-party code or asset retains its own required notices; see the [upstream source-intake policy](docs/upstream-source-intake.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
