import { ThemeToggle } from "./components/ThemeToggle";
import { UpdateNotification } from "./components/UpdateNotification";
import { Button } from "./components/ui/button";
import { FileIcon, GridIcon, SunIcon, MonitorIcon, ClockIcon, CodeIcon } from "lucide-react";

const FEATURES = [
  {
    icon: FileIcon,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    title: "Typed IPC bridge",
    description:
      "Fully typed preload bridge via contracts package. Add a method once, get types everywhere.",
  },
  {
    icon: GridIcon,
    iconClass: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    title: "Auto-updates",
    description:
      "electron-updater with GitHub Releases. State machine, progress tracking, OS notifications.",
  },
  {
    icon: SunIcon,
    iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    title: "Theme system",
    description: "Light, dark, system. Flash-free, cross-tab sync, syncs native title bar via IPC.",
  },
  {
    icon: MonitorIcon,
    iconClass: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    title: "Window state",
    description: "Remembers size and position across restarts. Single instance lock included.",
  },
  {
    icon: ClockIcon,
    iconClass: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
    title: "CI / CD",
    description: "GitHub Actions builds for Linux, macOS, Windows on every version tag.",
  },
  {
    icon: CodeIcon,
    iconClass: "bg-muted text-muted-foreground",
    title: "Turborepo + Bun",
    description: "Monorepo with shared packages, fast builds, and workspace-aware scripts.",
  },
];

export default function App() {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-12 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">A3 App</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border tracking-wide">
            template
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">v0.0.0</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 gap-3">
        <h1 className="text-2xl font-medium tracking-tight">Electron + React + Turbo</h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          A production-ready template with auto-updates, theming, typed IPC bridge, and CI/CD.
          Delete this page and start building.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.desktopBridge?.checkForUpdates()}
        >
          Check for updates
        </Button>
      </section>

      {/* Feature grid */}
      <section className="grid grid-cols-3 gap-3 px-6 pb-12 max-w-3xl mx-auto w-full">
        {FEATURES.map(({ icon: Icon, iconClass, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-background p-4 flex flex-col gap-2.5"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground mb-0.5">{title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Start by editing{" "}
        <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
          apps/web/src/App.tsx
        </code>
      </footer>

      <UpdateNotification debug />
    </div>
  );
}
