import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

const config = defineConfig({
  server: {
    port: 3001,
  },
  plugins: [cloudflare()],
});

export default config;
