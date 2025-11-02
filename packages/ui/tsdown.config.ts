import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/components/ui/button.tsx",
    "src/lib/utils.ts"
  ],
  dts: true,
  format: ["esm"],
  target: "esnext",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  unbundle: true
});
