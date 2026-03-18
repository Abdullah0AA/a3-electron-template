import {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  Notification,
  nativeTheme,
} from "electron";
import { autoUpdater } from "electron-updater";
import path from "node:path";
import fs from "node:fs";
import windowStateKeeper from "electron-window-state";
import type {
  DesktopUpdateState,
  DesktopUpdateActionResult,
} from "@a3-electron-template/contracts";
import {
  shouldBroadcastDownloadProgress,
  getAutoUpdateDisabledReason,
} from "./updateState";
import {
  createInitialDesktopUpdateState,
  reduceDesktopUpdateStateOnCheckStart,
  reduceDesktopUpdateStateOnCheckFailure,
  reduceDesktopUpdateStateOnUpdateAvailable,
  reduceDesktopUpdateStateOnNoUpdate,
  reduceDesktopUpdateStateOnDownloadStart,
  reduceDesktopUpdateStateOnDownloadProgress,
  reduceDesktopUpdateStateOnDownloadFailure,
  reduceDesktopUpdateStateOnDownloadComplete,
  reduceDesktopUpdateStateOnInstallFailure,
} from "./updateMachine";
import { APP_DISPLAY_NAME, APP_ID, APP_NAME, DESKTOP_SCHEME, isDevelopment, USER_DATA_DIR, USER_DATA_DIR_NAME } from "./app.config";

const AUTO_UPDATE_STARTUP_DELAY_MS = 10_000;
const AUTO_UPDATE_POLL_INTERVAL_MS = 4 * 60 * 60 * 1000;

let mainWindow: BrowserWindow | null = null;
let updateCheckInFlight = false;
let updateDownloadInFlight = false;
let updaterConfigured = false;
let updatePollTimer: ReturnType<typeof setInterval> | null = null;
let updateStartupTimer: ReturnType<typeof setTimeout> | null = null;
let isQuitting = false;
let updateState: DesktopUpdateState = createInitialDesktopUpdateState(
  app.getVersion(),
);

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

function resolveUserDataPath(): string {
  const appDataBase =
    process.platform === "win32"
      ? process.env.APPDATA ||
        path.join(app.getPath("home"), "AppData", "Roaming")
      : process.platform === "darwin"
        ? path.join(app.getPath("home"), "Library", "Application Support")
        : process.env.XDG_CONFIG_HOME ||
          path.join(app.getPath("home"), ".config");

  return path.join(appDataBase, USER_DATA_DIR_NAME);
}

function configureAppIdentity(): void {
  app.setName(APP_DISPLAY_NAME);
  app.setAboutPanelOptions({
    applicationName: APP_DISPLAY_NAME,
    applicationVersion: app.getVersion(),
  });
  if (process.platform === "win32") {
    app.setAppUserModelId(APP_ID);
  }
}

function emitUpdateState(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send("update-state", updateState);
    }
  }
}

function setUpdateState(next: DesktopUpdateState): void {
  updateState = next;
  emitUpdateState();
}

function clearUpdateTimers(): void {
  if (updateStartupTimer) {
    clearTimeout(updateStartupTimer);
    updateStartupTimer = null;
  }
  if (updatePollTimer) {
    clearInterval(updatePollTimer);
    updatePollTimer = null;
  }
}

async function checkForUpdates(reason: string): Promise<void> {
  if (isQuitting || !updaterConfigured || updateCheckInFlight) return;
  if (
    updateState.status === "downloading" ||
    updateState.status === "downloaded"
  ) {
    console.info(
      `[updater] Skipping check (${reason}) — status=${updateState.status}`,
    );
    return;
  }
  updateCheckInFlight = true;
  setUpdateState(
    reduceDesktopUpdateStateOnCheckStart(updateState, new Date().toISOString()),
  );
  console.info(`[updater] Checking for updates (${reason})...`);
  try {
    await autoUpdater.checkForUpdates();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    setUpdateState(
      reduceDesktopUpdateStateOnCheckFailure(
        updateState,
        message,
        new Date().toISOString(),
      ),
    );
    console.error(`[updater] Check failed: ${message}`);
  } finally {
    updateCheckInFlight = false;
  }
}

async function downloadAvailableUpdate(): Promise<{
  accepted: boolean;
  completed: boolean;
}> {
  if (
    !updaterConfigured ||
    updateDownloadInFlight ||
    updateState.status !== "available"
  ) {
    return { accepted: false, completed: false };
  }
  updateDownloadInFlight = true;
  setUpdateState(reduceDesktopUpdateStateOnDownloadStart(updateState));
  console.info("[updater] Downloading update...");
  try {
    await autoUpdater.downloadUpdate();
    return { accepted: true, completed: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    setUpdateState(
      reduceDesktopUpdateStateOnDownloadFailure(updateState, message),
    );
    console.error(`[updater] Download failed: ${message}`);
    return { accepted: true, completed: false };
  } finally {
    updateDownloadInFlight = false;
  }
}

async function installDownloadedUpdate(): Promise<{
  accepted: boolean;
  completed: boolean;
}> {
  if (isQuitting || !updaterConfigured || updateState.status !== "downloaded") {
    return { accepted: false, completed: false };
  }
  isQuitting = true;
  clearUpdateTimers();
  try {
    autoUpdater.quitAndInstall();
    return { accepted: true, completed: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    isQuitting = false;
    setUpdateState(
      reduceDesktopUpdateStateOnInstallFailure(updateState, message),
    );
    console.error(`[updater] Install failed: ${message}`);
    return { accepted: true, completed: false };
  }
}

function configureAutoUpdater(): void {
  const disabledReason = getAutoUpdateDisabledReason({
    isDevelopment,
    isPackaged: app.isPackaged,
    platform: process.platform,
    appImage: process.env.APPIMAGE,
  });

  if (disabledReason) {
    console.info(`[updater] Disabled: ${disabledReason}`);
    setUpdateState({ ...updateState, enabled: false, status: "disabled" });
    return;
  }

  updaterConfigured = true;
  setUpdateState({ ...updateState, enabled: true, status: "idle" });

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on("update-available", (info) => {
    setUpdateState(
      reduceDesktopUpdateStateOnUpdateAvailable(
        updateState,
        info.version,
        new Date().toISOString(),
      ),
    );
    console.info(`[updater] Update available: ${info.version}`);
  });

  autoUpdater.on("update-not-available", () => {
    setUpdateState(
      reduceDesktopUpdateStateOnNoUpdate(updateState, new Date().toISOString()),
    );
    console.info("[updater] No updates available.");
  });

  autoUpdater.on("download-progress", (progress) => {
    if (shouldBroadcastDownloadProgress(updateState, progress.percent)) {
      setUpdateState(
        reduceDesktopUpdateStateOnDownloadProgress(
          updateState,
          progress.percent,
        ),
      );
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    setUpdateState(
      reduceDesktopUpdateStateOnDownloadComplete(updateState, info.version),
    );
    console.info(`[updater] Update downloaded: ${info.version}`);
  });

  autoUpdater.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (!updateCheckInFlight && !updateDownloadInFlight) {
      setUpdateState(
        reduceDesktopUpdateStateOnCheckFailure(
          updateState,
          message,
          new Date().toISOString(),
        ),
      );
    }
    console.error(`[updater] Error: ${message}`);
  });

  clearUpdateTimers();

  updateStartupTimer = setTimeout(() => {
    updateStartupTimer = null;
    void checkForUpdates("startup");
  }, AUTO_UPDATE_STARTUP_DELAY_MS);
  updateStartupTimer.unref();

  updatePollTimer = setInterval(() => {
    void checkForUpdates("poll");
  }, AUTO_UPDATE_POLL_INTERVAL_MS);
  updatePollTimer.unref();
}

ipcMain.handle("check-for-updates", () => checkForUpdates("manual"));
ipcMain.handle("download-update", async () => {
  const result = await downloadAvailableUpdate();
  return {
    ...result,
    state: updateState,
  } satisfies DesktopUpdateActionResult;
});
ipcMain.handle("install-update", async () => {
  const result = await installDownloadedUpdate();
  return {
    ...result,
    state: updateState,
  } satisfies DesktopUpdateActionResult;
});
ipcMain.handle("get-update-state", () => updateState);

ipcMain.handle("show-notification", (_event, title, body) => {
  new Notification({ title, body }).show();
});

ipcMain.handle("set-theme", (_event, theme: string) => {
  if (theme === "light" || theme === "dark" || theme === "system") {
    nativeTheme.themeSource = theme;
  }
});

function resolveStaticDir(): string | null {
  if (app.isPackaged) {
    const prodPath = path.join(process.resourcesPath, "web/dist");
    if (fs.existsSync(path.join(prodPath, "index.html"))) {
      return prodPath;
    }
    return null;
  }
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

  protocol.registerFileProtocol(DESKTOP_SCHEME, (request, callback) => {
    try {
      const url = new URL(request.url);
      const rawPath = decodeURIComponent(url.pathname);
      const normalized = path.posix.normalize(rawPath).replace(/^\/+/, "");

      if (normalized.includes("..")) {
        callback({ path: fallbackIndex });
        return;
      }

      const requested = normalized.length > 0 ? normalized : "index.html";
      const resolved = path.resolve(path.join(staticRootResolved, requested));
      const isInRoot =
        resolved === fallbackIndex || resolved.startsWith(staticRootPrefix);

      if (!isInRoot || !fs.existsSync(resolved)) {
        if (path.extname(resolved)) {
          callback({ error: -6 });
          return;
        }
        callback({ path: fallbackIndex });
        return;
      }

      callback({ path: resolved });
    } catch {
      callback({ path: fallbackIndex });
    }
  });
}
function createWindow() {
  const windowState = windowStateKeeper({
    defaultHeight: 600,
    defaultWidth: 800,
  });
  const win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    title: APP_DISPLAY_NAME,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  mainWindow = win;
  windowState.manage(win);

  win.on("page-title-updated", (event) => {
    event.preventDefault();
    win.setTitle(APP_DISPLAY_NAME);
  });

  win.webContents.on("did-finish-load", () => {
    win.setTitle(APP_DISPLAY_NAME);
    emitUpdateState();
  });

  win.on("closed", () => {
    mainWindow = null;
  });

  if (isDevelopment) {
    win.loadURL("http://localhost:5733");
  } else {
    win.loadURL(`${DESKTOP_SCHEME}://app/index.html`);
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.setPath("userData", resolveUserDataPath());
configureAppIdentity();

app.on("before-quit", () => {
  isQuitting = true;
  clearUpdateTimers();
});

app.whenReady().then(() => {
  configureAppIdentity();
  registerDesktopProtocol();
  configureAutoUpdater();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

if (process.platform !== "win32") {
  process.on("SIGINT", () => {
    if (isQuitting) return;
    isQuitting = true;
    clearUpdateTimers();
    app.quit();
  });

  process.on("SIGTERM", () => {
    if (isQuitting) return;
    isQuitting = true;
    clearUpdateTimers();
    app.quit();
  });
}
