import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/lib/utils.ts", "./src/components/ui/button.tsx"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  noExternal: ["clsx", "tailwind-merge"],
});
