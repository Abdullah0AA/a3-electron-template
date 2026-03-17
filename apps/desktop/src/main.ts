import {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  Notification,
  nativeTheme,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import windowStateKeeper from "electron-window-state";

const DESKTOP_SCHEME = "a3";
const isDevelopment = Boolean(process.env.VITE_DEV_SERVER_URL);

protocol.registerSchemesAsPrivileged([
  {
    scheme: DESKTOP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function resolveStaticDir(): string | null {
  const candidates = [
    path.join(__dirname, "../../web/dist"),
    path.join(__dirname, "../../../apps/web/dist"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }
  return null;
}

function registerDesktopProtocol(): void {
  if (isDevelopment) return;

  const staticRoot = resolveStaticDir();
  if (!staticRoot) {
    throw new Error("Static bundle missing. Build apps/web first.");
  }

  const staticRootResolved = path.resolve(staticRoot);
  const staticRootPrefix = `${staticRootResolved}${path.sep}`;
  const fallbackIndex = path.join(staticRootResolved, "index.html");

  protocol.handle(DESKTOP_SCHEME, (request) => {
    try {
      const url = new URL(request.url);
      const rawPath = decodeURIComponent(url.pathname);
      const normalized = path.posix.normalize(rawPath).replace(/^\/+/, "");

      if (normalized.includes("..")) {
        return new Response(fs.readFileSync(fallbackIndex), {
          headers: { "content-type": "text/html" },
        });
      }

      const requested = normalized.length > 0 ? normalized : "index.html";
      const resolved = path.resolve(path.join(staticRootResolved, requested));
      const isInRoot =
        resolved === fallbackIndex || resolved.startsWith(staticRootPrefix);

      if (!isInRoot || !fs.existsSync(resolved)) {
        if (path.extname(resolved)) {
          return new Response(null, { status: 404 });
        }
        return new Response(fs.readFileSync(fallbackIndex), {
          headers: { "content-type": "text/html" },
        });
      }

      return new Response(fs.readFileSync(resolved));
    } catch {
      return new Response(fs.readFileSync(fallbackIndex), {
        headers: { "content-type": "text/html" },
      });
    }
  });
}
function createWindow() {
  const windowState = windowStateKeeper({
    defaultHeight: 600,
    defaultWidth: 80,
  });
  const win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  windowState.manage(win);

  if (isDevelopment) {
    win.loadURL("http://localhost:5733");
  } else {
    win.loadURL(`${DESKTOP_SCHEME}://app/index.html`);
  }
}

ipcMain.handle("show-notification", (_event, title, body) => {
  new Notification({ title, body }).show();
});
ipcMain.handle("set-theme", (_event, theme: string) => {
  if (theme === "light" || theme === "dark" || theme === "system") {
    nativeTheme.themeSource = theme;
  }
});

app.whenReady().then(() => {
  registerDesktopProtocol();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
