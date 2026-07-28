# Development

## Prerequisites

- Node.js 22 or later
- npm 10 or later

## Commands

```bash
npm run check
```

The current command checks only the repository baseline. Do not add a root dependency tree for HIA-uView-Biz or any other workspace. Future UI and Tool dependencies must be installed and locked inside this repository after their license and compatibility reviews.

## Local integration

Before published package names and compatibility contracts are approved, cross-repository experiments must use a documented local link or dedicated fixture. They must not rely on an undeclared absolute path or a shared parent lockfile.
