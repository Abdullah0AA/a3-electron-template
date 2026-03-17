import { app, BrowserWindow, ipcMain, protocol, Notification } from "electron";
import path from "node:path";

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

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDevelopment) {
    win.loadURL("http://localhost:5733");
  } else {
    win.loadURL(`${DESKTOP_SCHEME}://app/index.html`);
  }
}

ipcMain.handle("show-notification", (_event, title, body) => {
  new Notification({ title, body }).show();
});

app.whenReady().then(() => {
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
