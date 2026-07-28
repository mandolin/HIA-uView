# Third-party notices

## Development documentation dependencies

| Package | Version / integrity | License | Purpose and distribution boundary |
| --- | --- | --- | --- |
| `@mandolin/jsdoc-plugin-hia-sys` | `0.1.2`; `sha512-FO8Go6tNb3WCDEqnm78BiLdj07eSbTtH3EvzUWUj9PiMzXoLJTqV2VEOZ2BKm7f0Y2GGgqCNtFSdS6bfqw8J2w==` | MIT | HIA JSDoc metadata, bilingual-documentation and integration output plugin; development only, never a UI runtime dependency. |
| `@mandolin/jsdoc-theme-hia` | `0.1.1`; `sha512-6wGuEH28N3ms91nI+b/sgn5gAdBqdpQjICMVxkPoJWmKWoAncEHVdmHcpwd0ot+62hvTKKaEjQ9uf6VutS0WGQ==` | MIT | HIA JSDoc HTML theme; development-only generated documentation. It does not bundle font files. |
| `jsdoc` | `4.0.5`; `sha512-P4C6MWP9yIlMiK8nwoZvxN84vb6MsnXcHuy7XzVOvQoCizWX5JFCBsWIIWKXBltpoRZXddUOVQmCTOZt9yDj9g==` | Apache-2.0 | JSDoc generator required by the HIA documentation integration; development only. |

No third-party UI source code, UI runtime dependency, asset, font, icon, theme resource, or locale resource has been incorporated into HIA-uView as of 2026-07-28.

Before any reviewed upstream source is adopted, add a per-item entry here following [the source-intake policy](docs/upstream-source-intake.md). The entry must identify the source repository, package version, immutable commit, exact source path, license/notice, HIA target path, change summary and verification evidence.

Third-party notices are additive: do not remove an existing notice merely because HIA later modifies the adopted code.
