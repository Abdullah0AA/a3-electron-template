import React from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { UpdateNotification } from "./components/UpdateNotification";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div>
      <ThemeToggle />
      <UpdateNotification debug />
      New Version 1
      <Button onClick={() => window.desktopBridge?.checkForUpdates()}>
        Check for updates
      </Button>
    </div>
  );
}
