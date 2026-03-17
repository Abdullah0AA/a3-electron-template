import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme("light")}>☀️ Light</button>
      <button onClick={() => setTheme("system")}>💻 System</button>
      <button onClick={() => setTheme("dark")}>🌙 Dark</button>
    </div>
  );
}
