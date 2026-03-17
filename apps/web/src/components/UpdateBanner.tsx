import { useDesktopUpdate } from "../hooks/useDesktopUpdate";
import { shouldHighlightDesktopUpdateError } from "../lib/desktopUpdateLogic";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

/**
 * Thin banner at the top of the app that appears only when an update
 * needs user attention. Invisible for idle/checking/up-to-date states.
 *
 * States:
 * - available   → blue bar, download button
 * - downloading → blue bar with progress bar
 * - downloaded  → green bar, restart & install button
 * - error       → red/yellow bar, retry button (only if canRetry)
 */
export function UpdateBanner() {
  const { state, handleAction } = useDesktopUpdate();

  if (
    state.status === "idle" ||
    state.status === "checking" ||
    state.status === "up-to-date" ||
    state.status === "disabled"
  ) {
    return null;
  }

  if (state.status === "available") {
    return (
      <div className="flex items-center justify-between px-3 h-9 bg-blue-50 border-b border-blue-200 text-sm text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
        <span>Update available — v{state.availableVersion}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAction}
          className="h-6 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          Download
        </Button>
      </div>
    );
  }

  if (state.status === "downloading") {
    return (
      <div className="flex flex-col justify-center px-3 h-12 bg-blue-50 border-b border-blue-200 dark:bg-blue-950 dark:border-blue-800 gap-1.5">
        <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
          <span>Downloading update...</span>
          <span className="font-medium text-xs">
            {Math.floor(state.downloadPercent ?? 0)}%
          </span>
        </div>
        <Progress
          value={state.downloadPercent ?? 0}
          className="h-1 bg-blue-200 dark:bg-blue-800 [&>div]:bg-blue-500 dark:[&>div]:bg-blue-400"
        />
      </div>
    );
  }

  if (state.status === "downloaded") {
    return (
      <div className="flex items-center justify-between px-3 h-9 bg-green-50 border-b border-green-200 text-sm text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
        <span>v{state.downloadedVersion} ready to install</span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAction}
          className="h-6 text-xs border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
        >
          Restart & install
        </Button>
      </div>
    );
  }

  if (state.status === "error") {
    const isHighlighted = shouldHighlightDesktopUpdateError(state);
    return (
      <div
        className={`flex items-center justify-between px-3 h-9 border-b text-sm ${
          isHighlighted
            ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
            : "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300"
        }`}
      >
        <span>
          {state.errorContext === "download"
            ? "Download failed"
            : state.errorContext === "install"
              ? "Install failed"
              : "Update check failed"}
          {state.message ? ` — ${state.message}` : ""}
        </span>
        {state.canRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAction}
            className="h-6 text-xs underline"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return null;
}
