# HIA-uView-Tool

This workspace contains the private, development-time CLI that supports HIA-uView-UI verification and adoption metadata. It is not published and has no UI-runtime export. The pre-release command, configuration, privacy, and runtime-isolation boundary is documented in the repository [Tool contract](../docs/tool.md).

The initial implementation provides read-only `doctor`, `check contract`, `check adoption`, `inspect components`, and `inspect compatibility` commands. It reads only declared, repository-local JSON metadata; it neither scans application source nor runs scripts, builds, package managers, Git, network requests, or DevTools. HIA-uView-Tool must not become an undeclared UI runtime dependency or import business-framework internals. Business-oriented helpers belong in HIA-uView-Biz `main-repo`, not here. Source follows the bilingual [Documentation Sys contract](../docs/documentation.md) from its first line.
