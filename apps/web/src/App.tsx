import { FileIcon, GridIcon, SunIcon, MonitorIcon, ClockIcon, CodeIcon } from "lucide-react";

import { ThemeToggle } from "./components/ThemeToggle";
import { Button } from "./components/ui/button";
import { UpdateNotification } from "./components/UpdateNotification";

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
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">A3 App</span>
          <span className="bg-muted text-muted-foreground border-border rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide">
            template
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">v0.0.0</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-3 px-6 pt-16 pb-12 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Electron + React + Turbo</h1>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
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
      <section className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-3 px-6 pb-12">
        {FEATURES.map(({ icon: Icon, iconClass, title, description }) => (
          <div
            key={title}
            className="border-border bg-background flex flex-col gap-2.5 rounded-xl border p-4"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-foreground mb-0.5 text-[13px] font-medium">{title}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-border text-muted-foreground mt-auto border-t px-6 py-4 text-center text-xs">
        Start by editing{" "}
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">
          apps/web/src/App.tsx
        </code>
      </footer>

      <UpdateNotification debug />
    </div>
  );
}
