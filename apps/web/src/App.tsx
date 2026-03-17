import { ThemeToggle } from "./components/ThemeToggle";
import { UpdateNotification } from "./components/UpdateNotification";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-border">
        <span className="text-sm font-medium text-foreground">A3 App</span>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Your app content goes here
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.desktopBridge?.checkForUpdates()}
        >
          Check for updates
        </Button>
      </main>

      <UpdateNotification debug />
    </div>
  );
}
