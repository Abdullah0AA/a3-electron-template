import type { DesktopBridge, DesktopUpdateState } from "@a3-electron-template/contracts";

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktopBridge", {
  showNotification: (title, body) => ipcRenderer.invoke("show-notification", title, body),

  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),

  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  downloadUpdate: () => ipcRenderer.invoke("download-update"),

  installUpdate: () => ipcRenderer.invoke("install-update"),

  getUpdateState: () => ipcRenderer.invoke("get-update-state"),

  onUpdateState: (listener) => {
    const wrapped = (_event: Electron.IpcRendererEvent, state: unknown) => {
      if (typeof state !== "object" || state === null) return;
      listener(state as DesktopUpdateState);
    };
    ipcRenderer.on("update-state", wrapped);
    return () => ipcRenderer.removeListener("update-state", wrapped);
  },
} satisfies DesktopBridge);
