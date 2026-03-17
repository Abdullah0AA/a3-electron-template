import { contextBridge, ipcRenderer } from "electron";
import type { DesktopBridge } from "@a3-electron-template/contracts";

const bridge: DesktopBridge = {
  showNotification: (title, body) =>
    ipcRenderer.invoke("show-notification", title, body),
  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateState: (listener) => {
    const channel = "update-state";
    const handler = (_event: Electron.IpcRendererEvent, state: unknown) => {
      listener(state as Parameters<typeof listener>[0]);
    };

    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
  getUpdateState: () => ipcRenderer.invoke("get-update-state"),
};

contextBridge.exposeInMainWorld("desktopBridge", bridge);
