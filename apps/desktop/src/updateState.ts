import type { DesktopUpdateState } from "@a3-electron-template/contracts";

export function shouldBroadcastDownloadProgress(
  currentState: DesktopUpdateState,
  nextPercent: number,
): boolean {
  if (currentState.status !== "downloading") return true;
  const currentPercent = currentState.downloadPercent;
  if (currentPercent === null) return true;
  const previousStep = Math.floor(currentPercent / 10);
  const nextStep = Math.floor(nextPercent / 10);
  return nextStep !== previousStep || nextPercent === 100;
}

export function nextStatusAfterDownloadFailure(
  currentState: DesktopUpdateState,
): DesktopUpdateState["status"] {
  return currentState.availableVersion ? "available" : "error";
}

export function getCanRetryAfterDownloadFailure(
  currentState: DesktopUpdateState,
): boolean {
  return currentState.availableVersion !== null;
}

export function getAutoUpdateDisabledReason(args: {
  isDevelopment: boolean;
  isPackaged: boolean;
  platform: NodeJS.Platform;
  appImage?: string | undefined;
  disabledByEnv?: boolean;
}): string | null {
  if (args.isDevelopment || !args.isPackaged) {
    return "Auto-updates are only available in packaged production builds.";
  }
  if (args.disabledByEnv) {
    return "Auto-updates are disabled by environment setting.";
  }
  if (args.platform === "linux" && !args.appImage) {
    return "Auto-updates on Linux require the AppImage build.";
  }
  return null;
}
