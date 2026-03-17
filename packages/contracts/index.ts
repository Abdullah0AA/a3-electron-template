export type DesktopTheme = string;

export interface UpdateState {
  status: UpdateStatus;
  version: string | null;
  percent: number | null;
  error: string | null;
}

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "downloaded"
  | "error"
  | "up-to-date";

export interface DesktopBridge {
  showNotification(title: string, body: string): Promise<void>;
  setTheme: (theme: DesktopTheme) => Promise<void>;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  onUpdateState: (listener: (state: UpdateState) => void) => () => void;
  getUpdateState: () => Promise<UpdateState>;
}
