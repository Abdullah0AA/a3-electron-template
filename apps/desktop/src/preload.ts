import { contextBridge, ipcRenderer } from "electron";
import type { DesktopBridge } from "@a3-electron-template/contracts";

contextBridge.exposeInMainWorld("desktopBridge", {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke("show-notification", title, body),
} satisfies DesktopBridge);
