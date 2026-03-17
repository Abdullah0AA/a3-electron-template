import { ThemeToggle } from "./components/ThemeToggle";
import { Button } from "./components/ui/button";
import { useEffect, useState } from "react";
import type { UpdateState } from "@a3-electron-template/contracts";

export default function App() {
  const [updateState, setUpdateState] = useState<UpdateState>({
    status: "idle",
    version: null,
    percent: null,
    error: null,
  });

  useEffect(() => {
    const bridge = window.desktopBridge;
    if (!bridge) return;

    void bridge
      .getUpdateState()
      .then((state) => {
        setUpdateState(state);
      })
      .catch(() => {});

    const unsubscribe = bridge.onUpdateState((state) => {
      setUpdateState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const bridge = window.desktopBridge;
  const isDesktop = Boolean(bridge);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4">
      <ThemeToggle />

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {isDesktop ? "Desktop shell detected" : "Running in browser only"}
        </span>

        {isDesktop && (
          <>
            <div className="text-sm">
              Update status:{" "}
              <span className="font-mono">{updateState.status}</span>
              {updateState.version && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (v{updateState.version})
                </span>
              )}
              {updateState.percent != null &&
                updateState.status === "downloading" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {updateState.percent.toFixed(0)}%
                  </span>
                )}
            </div>

            {updateState.error && (
              <div className="text-xs text-red-500 max-w-xs text-center">
                {updateState.error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={
                  updateState.status === "checking" ||
                  updateState.status === "downloading"
                }
                onClick={() => {
                  void bridge
                    ?.checkForUpdates()
                    .catch(() => undefined);
                }}
              >
                Check for updates
              </Button>

              {updateState.status === "available" && (
                <Button
                  size="sm"
                  onClick={() => {
                    void bridge
                      ?.downloadUpdate()
                      .catch(() => undefined);
                  }}
                >
                  Download
                </Button>
              )}

              {updateState.status === "downloaded" && (
                <Button
                  size="sm"
                  onClick={() => {
                    void bridge
                      ?.installUpdate()
                      .catch(() => undefined);
                  }}
                >
                  Restart to update
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
