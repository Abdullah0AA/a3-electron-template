/// <reference types="vite/client" />
import type { DesktopBridge } from "@a3-electron-template/contracts";

declare global {
  interface Window {
    desktopBridge?: DesktopBridge;
  }
}
