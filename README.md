# a3-electron-template

Production-ready Electron + React + Turborepo + shadcn/ui template with typed IPC, auto-updates, theming, and CI/CD

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.10
- [Node.js](https://nodejs.org) >= 24

## Getting started

```bash
bun install
bun dev
```

## Scripts

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun dev`             | Start dev server + Electron                   |
| `bun build`           | Build all packages                            |
| `bun dist`            | Build + package Electron app                  |
| `bun run check-types` | Typecheck all packages                        |
| `bun lint`            | Lint all packages                             |
| `bun serve:updates`   | Serve release folder for local update testing |

## Structure

```
apps/
  desktop/     — Electron main + preload
  web/         — React app (renderer)
packages/
  contracts/   — Shared types (DesktopBridge, UpdateState, etc.)
release/       — Built artifacts (gitignored)
```

## Stack

- **Electron** with [electron-builder](https://www.electron.build) and [electron-updater](https://www.electron.build/auto-update)
- **React 19 + Vite 8**
- **[Tailwind v4](https://tailwindcss.com)**
- **[shadcn/ui](https://ui.shadcn.com)** with Base UI primitives
- **[Turborepo](https://turborepo.dev/) + [Bun](https://bun.sh)** monorepo
- **[tsdown](https://tsdown.dev)** bundles main + preload as CJS
- **TypeScript 5.9** strict mode throughout

---

## Acknowledgements

Many patterns in this template are adapted from [T3 Code](https://github.com/pingdotgg/t3code)
