import { useDesktopUpdate } from "../hooks/useDesktopUpdate";
import { shouldHighlightDesktopUpdateError } from "../lib/desktopUpdateLogic";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useState } from "react";

/**
 * Floating update notification card — appears bottom-right when an update
 * needs user attention. Dismissible for available/error states.
 *
 * States:
 * - available   → amber dot, download + dismiss
 * - downloading → blue dot, progress bar, no dismiss
 * - downloaded  → green dot, restart + later
 * - error       → red dot, retry + dismiss
 */
export function UpdateNotification() {
  const { state, handleAction } = useDesktopUpdate();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed when a new version becomes available or download completes
  const key = `${state.status}-${state.availableVersion}-${state.downloadedVersion}`;

  if (dismissed && state.status !== "downloaded") {
    return null;
  }

  if (
    state.status === "idle" ||
    state.status === "checking" ||
    state.status === "up-to-date" ||
    state.status === "disabled"
  ) {
    return null;
  }

  const dotColor =
    {
      available: "bg-amber-400",
      downloading: "bg-blue-400",
      downloaded: "bg-green-500",
      error: shouldHighlightDesktopUpdateError(state)
        ? "bg-red-500"
        : "bg-yellow-400",
    }[state.status] ?? "bg-gray-400";

  return (
    <div
      key={key}
      className="fixed bottom-4 right-4 z-50 w-75 rounded-xl border border-border bg-background shadow-lg p-3.5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {state.status === "available" && "Update available"}
          {state.status === "downloading" && "Downloading"}
          {state.status === "downloaded" && "Ready to install"}
          {state.status === "error" && "Update failed"}
        </span>
      </div>

      {/* Available */}
      {state.status === "available" && (
        <>
          <p className="text-sm font-medium text-foreground mb-0.5">
            Version {state.availableVersion} is ready
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Download in the background while you work.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleAction}
            >
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </>
      )}

      {/* Downloading */}
      {state.status === "downloading" && (
        <>
          <p className="text-sm font-medium text-foreground mb-2">
            Downloading {state.availableVersion}...
          </p>
          <Progress
            value={state.downloadPercent ?? 0}
            className="h-0.75 mb-2"
          />
          <p className="text-[11px] text-muted-foreground">
            {Math.floor(state.downloadPercent ?? 0)}%
          </p>
        </>
      )}

      {/* Downloaded */}
      {state.status === "downloaded" && (
        <>
          <p className="text-sm font-medium text-foreground mb-0.5">
            Version {state.downloadedVersion} downloaded
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Restart the app to apply the update.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleAction}
            >
              Restart & install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setDismissed(true)}
            >
              Later
            </Button>
          </div>
        </>
      )}

      {/* Error */}
      {state.status === "error" && (
        <>
          <p className="text-sm font-medium text-foreground mb-0.5">
            {state.errorContext === "download"
              ? "Download failed"
              : "Update check failed"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {state.message ?? "Check your connection and try again."}
          </p>
          <div className="flex gap-2">
            {state.canRetry && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleAction}
              >
                Retry
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
