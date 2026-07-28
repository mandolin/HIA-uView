# Development

## Prerequisites

- Node.js 22 or later
- npm 10 or later

## Commands

```bash
npm run check
npm test
```

`npm run check` verifies required files and the UI/Tool package metadata. `npm test` verifies the same contract with the Node.js built-in test runner. Do not add a root dependency tree for HIA-uView-Biz or any other workspace. Future UI and Tool dependencies must be installed and locked inside this repository after their license and compatibility reviews.

## Local integration

Before published package names and compatibility contracts are approved, cross-repository experiments must use a documented local link or dedicated fixture. They must not rely on an undeclared absolute path or a shared parent lockfile.

## Compatibility scope

The only active compatibility profile is UniApp Vue 3 for `mp-weixin`. Do not claim App, H5, or other mini-program compatibility without an explicit profile, fixture, and validation record. See [compatibility](compatibility.md).
