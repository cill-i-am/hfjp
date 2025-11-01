/// <reference path="./.sst/platform/config.d.ts" />

import { execSync } from "node:child_process";

export default $config({
  app(input) {
    const stage = input?.stage ?? "dev";

    return {
      name: "hfjp",
      home: "cloudflare",
      removal: stage === "production" ? "retain" : "remove",
      protect: stage === "production",
    };
  },
  async run() {
    execSync("pnpm -C apps/app build", { stdio: "inherit" });

    const api = new sst.cloudflare.Worker("Api", {
      handler: "apps/api/src/index.ts",
      url: true,
    });

    const app = new sst.cloudflare.Worker("App", {
      handler: "apps/app/dist/server/index.js",
      url: true,
      environment: {
        API_URL: api.url,
      },
    });

    return {
      apiUrl: api.url,
      appUrl: app.url,
    };
  },
});
