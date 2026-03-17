import { defineConfig } from "tsdown";

const shared = {
  format: "cjs" as const,
  outDir: "dist-electron",
  sourcemap: true,
  outExtensions: () => ({ js: ".js" }),
  deps: {
    neverBundle: ["electron"],
  },
};

export default defineConfig([
  {
    ...shared,
    entry: ["src/main.ts"],
    clean: true,
    deps: {
      neverBundle: ["electron"],
      alwaysBundle: [/@a3-electron-template\//],
    },
  },
  {
    ...shared,
    entry: ["src/preload.ts"],
  },
]);
