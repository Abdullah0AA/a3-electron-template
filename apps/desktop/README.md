`apps/desktop/README.md`:

---

# desktop

Electron main process and preload bridge.

## Adding IPC methods

1. Add to `packages/contracts/index.ts`:

```ts
export interface DesktopBridge {
  myMethod: (arg: string) => Promise<string>;
}
```

2. Implement in `src/preload.ts` — `satisfies DesktopBridge` enforces it:

```ts
myMethod: (arg) => ipcRenderer.invoke("my-method", arg),
```

3. Handle in `src/main.ts`:

```ts
ipcMain.handle("my-method", (_event, arg: string) => {
  return `hello ${arg}`;
});
```

4. Call from React — fully typed:

```ts
const result = await window.desktopBridge?.myMethod("world");
```

## Testing auto-updates locally

1. Set `electron-builder.yml` publish URL to `http://localhost:3001`
2. Build: `bun dist` from repo root
3. Run the AppImage
4. Start update server: `bun serve:updates` from repo root
5. Bump version in `package.json`, rebuild
6. Running app checks after 10 seconds or via "Check for updates"

## Shipping

Switch `electron-builder.yml` back to GitHub Releases:

```yaml
publish:
  provider: github
  owner: your-username
  repo: your-repo
```

Tag to trigger CI:

```bash
git tag v1.0.0
git push origin v1.0.0
```
