import type { DesktopUpdateState } from "@a3-electron-template/contracts";

import { AlertCircle, CheckCircle2, Download, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { useDesktopUpdate } from "../hooks/useDesktopUpdate";
import { shouldHighlightDesktopUpdateError } from "../lib/desktopUpdateLogic";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

type UpdateNotificationProps = {
  debug?: boolean;
};

const DEBUG_VERSION = "1.2.0";

const debugInitialState: DesktopUpdateState = {
  enabled: true,
  status: "idle",
  currentVersion: "1.0.0",
  availableVersion: null,
  downloadedVersion: null,
  downloadPercent: null,
  checkedAt: null,
  message: null,
  errorContext: null,
  canRetry: false,
};

// ── Status config ─────────────────────────────────────────────────────────────

type StatusConfig = {
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  title: string;
  getDescription: (state: DesktopUpdateState) => string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  available: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    icon: <Download className="size-4" />,
    title: "Update available",
    getDescription: (s) => s.message ?? "A new version is ready to download.",
  },
  downloading: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    icon: <Loader2 className="size-4 animate-spin" />,
    title: "Downloading update",
    getDescription: (s) =>
      s.availableVersion ? `Fetching version ${s.availableVersion}…` : "Please wait…",
  },
  downloaded: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    icon: <CheckCircle2 className="size-4" />,
    title: "Ready to install",
    getDescription: (s) => s.message ?? "Download complete. Restart to apply.",
  },
  error: {
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    icon: <AlertCircle className="size-4" />,
    title: "Update failed",
    getDescription: (s) => s.message ?? "Check your connection and try again.",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function UpdateNotification({ debug = false }: UpdateNotificationProps) {
  const { state: bridgeState, handleAction } = useDesktopUpdate();
  const [dismissed, setDismissed] = useState(false);
  const [debugState, setDebugState] = useState<DesktopUpdateState>(debugInitialState);
  const downloadIntervalRef = useRef<number | null>(null);
  const isDebugMode = import.meta.env.DEV && debug;

  const clearDebugDownloadInterval = () => {
    if (downloadIntervalRef.current !== null) {
      window.clearInterval(downloadIntervalRef.current);
      downloadIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearDebugDownloadInterval();
  }, []);

  const state = isDebugMode ? debugState : bridgeState;

  const shouldHideNotification =
    (dismissed && state.status !== "downloaded") ||
    state.status === "idle" ||
    state.status === "checking" ||
    state.status === "up-to-date" ||
    state.status === "disabled";

  if (!isDebugMode && shouldHideNotification) return null;

  const handleNotificationAction = () => {
    if (isDebugMode) {
      console.log(`[UpdateNotification debug] action from state: ${state.status}`);
      return;
    }
    void handleAction();
  };

  // ── Debug state setters ───────────────────────────────────────────────────

  const setDebugAvailable = () => {
    clearDebugDownloadInterval();
    setDismissed(false);
    setDebugState((prev) => ({
      ...prev,
      status: "available",
      availableVersion: DEBUG_VERSION,
      downloadedVersion: null,
      downloadPercent: null,
      message: null,
      errorContext: null,
      canRetry: false,
    }));
  };

  const setDebugDownloading = () => {
    clearDebugDownloadInterval();
    setDismissed(false);
    setDebugState((prev) => ({
      ...prev,
      status: "downloading",
      availableVersion: DEBUG_VERSION,
      downloadedVersion: null,
      downloadPercent: 0,
      message: null,
      errorContext: null,
      canRetry: false,
    }));

    const start = Date.now();
    const durationMs = 3000;

    downloadIntervalRef.current = window.setInterval(() => {
      const percent = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setDebugState((prev) => ({
        ...prev,
        status: "downloading",
        downloadPercent: percent,
      }));
      if (percent >= 100) {
        clearDebugDownloadInterval();
        setDebugState((prev) => ({
          ...prev,
          status: "downloaded",
          availableVersion: DEBUG_VERSION,
          downloadedVersion: DEBUG_VERSION,
          downloadPercent: 100,
          message: null,
          errorContext: null,
          canRetry: false,
        }));
      }
    }, 100);
  };

  const setDebugDownloaded = () => {
    clearDebugDownloadInterval();
    setDismissed(false);
    setDebugState((prev) => ({
      ...prev,
      status: "downloaded",
      availableVersion: DEBUG_VERSION,
      downloadedVersion: DEBUG_VERSION,
      downloadPercent: 100,
      message: null,
      errorContext: null,
      canRetry: false,
    }));
  };

  const setDebugError = () => {
    clearDebugDownloadInterval();
    setDismissed(false);
    setDebugState((prev) => ({
      ...prev,
      status: "error",
      availableVersion: DEBUG_VERSION,
      downloadedVersion: null,
      downloadPercent: null,
      errorContext: "download",
      message: "Connection refused",
      canRetry: true,
    }));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const config = STATUS_CONFIG[state.status];
  const isDownloading = state.status === "downloading";
  const isDownloaded = state.status === "downloaded";
  const isError = state.status === "error";
  const isDismissible = !isDownloading;
  const isHighlightedError = shouldHighlightDesktopUpdateError(state);

  const actionLabel =
    isError && state.canRetry
      ? "Try again"
      : isDownloaded
        ? "Restart & install"
        : "Download update";

  return (
    <>
      {/* ── Debug panel ─────────────────────────────────────────────────── */}
      {isDebugMode && (
        <div className="border-border bg-background/95 fixed right-4 bottom-40 z-50 w-75 rounded-xl border p-3 shadow-lg backdrop-blur">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Debug update state
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={setDebugAvailable}>
              Available
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={setDebugDownloading}
            >
              Downloading
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={setDebugDownloaded}
            >
              Downloaded
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={setDebugError}>
              Error
            </Button>
          </div>
        </div>
      )}

      {/* ── Notification card ────────────────────────────────────────────── */}
      {!shouldHideNotification && config && (
        <div
          className={cn(
            "fixed right-4 bottom-4 z-50 w-72",
            "bg-background/95 rounded-xl border shadow-lg backdrop-blur-sm",
            "flex flex-col gap-2.5 p-3",
            "transition-colors duration-200",
            isDownloaded && "border-emerald-500/25",
            isError && "border-destructive/30",
            isHighlightedError && "border-destructive/60 animate-pulse",
          )}
        >
          {/* Top row: icon + text + dismiss */}
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                config.iconBg,
                config.iconColor,
              )}
            >
              {config.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-foreground text-[13px] leading-snug font-medium">{config.title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                {config.getDescription(state)}
              </p>
            </div>

            {isDismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Version pill */}
          {state.availableVersion && (
            <Badge
              variant="secondary"
              className="h-5 w-fit gap-1 rounded-full px-2 text-[11px] font-medium"
            >
              <span className="text-muted-foreground">{state.currentVersion}</span>
              <span className="text-muted-foreground/40">→</span>
              <span className="text-blue-500 dark:text-blue-400">{state.availableVersion}</span>
            </Badge>
          )}

          {/* Progress bar */}
          {isDownloading && (
            <div className="flex items-center gap-2">
              <Progress value={state.downloadPercent ?? 0} className="h-0.75 flex-1" />
              <span className="text-muted-foreground w-8 text-right text-[11px] tabular-nums">
                {Math.round(state.downloadPercent ?? 0)}%
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={isError ? "destructive" : "default"}
              className="h-7 px-3 text-xs"
              disabled={isDownloading}
              onClick={handleNotificationAction}
            >
              {actionLabel}
            </Button>
            {isDismissible && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground h-7 px-3 text-xs"
                onClick={() => setDismissed(true)}
              >
                Later
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
