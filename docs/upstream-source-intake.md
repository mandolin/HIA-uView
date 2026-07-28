# Upstream source intake

HIA-uView may selectively reuse compatible MIT-licensed source code from its reviewed uView baselines. The goal is practical reuse of mature behavior while preserving a clear provenance and release boundary. Reuse is not automatic: each adopted file or materially derived implementation needs the record below before it becomes part of a release.

## Locked reference baselines

| Source | Component package version | Immutable reference commit | Eligible package boundary |
| --- | --- | --- | --- |
| `umicro/uView` | `uview-ui@1.8.8` | `1c73d473e15d6a66291aacb88ecdcedf22b2f7cb` | `uview-ui/` |
| `umicro/uView2.0` | `uview-ui@2.0.38` | `e5649b708bb56f40c64c2f48e1b790dc51ce8e8d` | `uni_modules/uview-ui/` |
| `anyup/uView-Pro` | `uview-pro@0.6.13` | `3bc1948d8f7c5d2bcb1ba3434cede1e709391a62` | `src/uni_modules/uview-pro/` |
| `ijry/uview-plus` | `uview-plus@3.8.89` | `b73a5dcb1898c7f577785309152167d8343ce69b` | `src/uni_modules/uview-plus/` |

These are reference locks, not floating dependencies. A later upstream release is never adopted implicitly: update the intended source version and commit in a dedicated review before studying or copying its changes.

## Per-item adoption record

Before adding code, document each copied file or materially derived implementation in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). The entry must include:

1. the source repository, package version, immutable commit and exact upstream path;
2. the applicable license file and copyright/notice text;
3. the HIA target path, whether it is copied or materially derived, and a short change summary;
4. the audit outcome for dependencies, assets, trademark-sensitive material and target platforms; and
5. the test or verification evidence for the adopted behavior.

An item is eligible only when the source file is inside the stated package boundary, its license coverage is confirmed, and no more restrictive third-party material applies. Preserve all required MIT notices in the repository and release artifacts.

## Exclusions

Do not import upstream demonstration apps, root-project tooling, generated outputs, packages not covered by the checked license, fonts, icons, images, PDF.js content, signing material, certificates, private keys, trademarks or brand assets without a separate review. A permissive repository-level license does not make these materials automatically eligible.
