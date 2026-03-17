export type DesktopTheme = string;

export interface DesktopBridge {
  showNotification(title: string, body: string): Promise<void>;
  setTheme: (theme: DesktopTheme) => Promise<void>;
}
