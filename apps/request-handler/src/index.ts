import { Hono } from "hono";
import { Bindings } from "./bindngs";

const app = new Hono<{
  Bindings: Bindings;
}>();

app.get("/*", async (c) => {
  const hostname = c.req.header("Host");
  const filename = c.req.path === "/" ? "index.html" : c.req.path.slice(1);
  const slug = hostname?.split(".uplora")[0];

  console.log(`Hostname: ${hostname}`);
  console.log(`File requested: ${filename}`);
  console.log(`Slug: ${slug}`);

  const blobUrl = `https://${c.env.BLOB_STORAGE_ACCOUNT}.blob.core.windows.net/${c.env.BLOB_CONTAINER_NAME}/dist/${slug}/${filename}?${c.env.BLOB_SAS_TOKEN}`;

  const response = await fetch(blobUrl);

  console.log(response);

  return c.text("Hello Hono!");
});

export default app;
