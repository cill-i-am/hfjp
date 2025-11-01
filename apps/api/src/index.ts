import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) =>
  c.json({ message: "Hello from Hono + Cloudflare + pnpm!" })
);

export default app;
