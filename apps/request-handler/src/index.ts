import { Hono } from "hono";

const app = new Hono();

app.get("/*", (c) => {
  console.log(`Hostname: ${c.req.header("Host")}`);
  console.log(`File requested: ${c.req.path}`);

  return c.text("Hello Hono!");
});

export default app;
