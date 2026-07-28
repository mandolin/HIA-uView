# HIA-uView-Tool

This workspace will contain tools that support HIA-uView-UI development, verification and adoption. It is not yet published and contains no implementation. The pre-release command, configuration, privacy, and runtime-isolation boundary is documented in the repository [Tool contract](../docs/tool.md).

Tooling must keep its own CLI, build-time and runtime boundaries explicit so application projects do not receive accidental development dependencies. HIA-uView-Tool must not become an undeclared UI runtime dependency or import business-framework internals. Future source follows the bilingual [Documentation Sys contract](../docs/documentation.md) from its first line.
