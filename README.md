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

- **Electron** with electron-builder and electron-updater
- **React 19 + Vite 8** powered by Rolldown
- **Tailwind v4** — CSS-first, no config file
- **shadcn/ui** with Base UI primitives
- **Turborepo + Bun** monorepo
- **tsdown** bundles main + preload as CJS
- **TypeScript 5.9** strict mode throughout
