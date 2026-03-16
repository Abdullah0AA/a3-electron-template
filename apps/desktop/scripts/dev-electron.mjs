import { spawn } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopDir = path.resolve(__dirname, "..");
const entry = path.join(desktopDir, "dist-electron", "main.js");

let child = null;
let restarting = false;

function start() {
  child = spawn("electron", ["."], {
    cwd: desktopDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", () => {
    child = null;
    if (restarting) {
      restarting = false;
      start();
    }
  });
}

function restart() {
  if (!child) {
    start();
    return;
  }

  restarting = true;
  child.kill();
}

start();

watch(
  path.join(desktopDir, "dist-electron"),
  { recursive: true },
  (_, filename) => {
    if (!filename?.endsWith(".js")) return;
    restart();
  },
);

process.on("SIGINT", () => {
  if (child) child.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (child) child.kill();
  process.exit(0);
});
