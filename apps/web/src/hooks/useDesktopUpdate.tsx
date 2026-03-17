import { useEffect, useState } from "react";
import type { DesktopUpdateState } from "@a3-electron-template/contracts";
import { toast } from "sonner";
import {
  resolveDesktopUpdateButtonAction,
  shouldShowDesktopUpdateButton,
  isDesktopUpdateButtonDisabled,
  getDesktopUpdateButtonTooltip,
  getDesktopUpdateActionError,
  shouldToastDesktopUpdateActionResult,
} from "../lib/desktopUpdateLogic";

const initial: DesktopUpdateState = {
  enabled: false,
  status: "idle",
  currentVersion: "",
  availableVersion: null,
  downloadedVersion: null,
  downloadPercent: null,
  checkedAt: null,
  message: null,
  errorContext: null,
  canRetry: false,
};

/**
 * Subscribes to desktop update state from the Electron bridge.
 *
 * Uses two strategies to get the initial state:
 * 1. `onUpdateState` — live subscription for future changes
 * 2. `getUpdateState` — one-time fetch for the current state on mount
 *
 * The `disposed` + `receivedSubscriptionUpdate` flags prevent a race condition
 * where `getUpdateState` resolves after a subscription update already arrived.
 *
 * Returns derived UI state and a single `handleAction` function that
 * calls download or install depending on the current update status.
 */
export function useDesktopUpdate() {
  const [state, setState] = useState<DesktopUpdateState>(initial);

  useEffect(() => {
    const bridge = window.desktopBridge;
    if (!bridge) return;

    let disposed = false;
    let receivedSubscriptionUpdate = false;

    /** Live subscription — keeps state in sync as updates progress */
    const unsub = bridge.onUpdateState((nextState) => {
      if (disposed) return;
      receivedSubscriptionUpdate = true;
      setState(nextState);
    });

    /** Fetch current state on mount in case updates already happened */
    void bridge
      .getUpdateState()
      .then((nextState) => {
        if (disposed || receivedSubscriptionUpdate) return;
        setState(nextState);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unsub();
    };
  }, []);

  /** What action the button should trigger — "download", "install", or "none" */
  const buttonAction = resolveDesktopUpdateButtonAction(state);

  /** Whether to show the update button at all */
  const showButton = shouldShowDesktopUpdateButton(state);

  /** True while downloading — button should be disabled */
  const buttonDisabled = isDesktopUpdateButtonDisabled(state);

  /** Tooltip text describing the current update status */
  const tooltip = getDesktopUpdateButtonTooltip(state);

  /**
   * Triggers download or install based on current update state.
   * Shows a toast on failure.
   */
  const handleAction = async () => {
    const bridge = window.desktopBridge;
    if (!bridge || buttonDisabled || buttonAction === "none") return;

    if (buttonAction === "download") {
      try {
        const result = await bridge.downloadUpdate();
        if (result.completed) return;

        if (shouldToastDesktopUpdateActionResult(result)) {
          const error = getDesktopUpdateActionError(result);
          if (error) {
            toast.error("Could not download update", { description: error });
          }
        }
      } catch (error) {
        toast.error("Could not start update download", {
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
      }
      return;
    }

    if (buttonAction === "install") {
      try {
        const result = await bridge.installUpdate();
        if (shouldToastDesktopUpdateActionResult(result)) {
          const error = getDesktopUpdateActionError(result);
          if (error) {
            toast.error("Could not install update", { description: error });
          }
        }
      } catch (error) {
        toast.error("Could not install update", {
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
      }
    }
  };

  return {
    /** Full update state from the Electron bridge */
    state,
    /** Whether to render the update UI */
    showButton,
    /** "download" | "install" | "none" */
    buttonAction,
    /** True while downloading — disable the button */
    buttonDisabled,
    /** Tooltip text for the update button */
    tooltip,
    /** Call this when the user clicks the update button */
    handleAction,
  };
}
