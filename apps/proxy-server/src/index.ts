import express from "express";
import httpProxy from "http-proxy";
import { env } from "@repo/env";
import path from "path";

const PORT = env.PROXY_PORT;
const BASE_URL = env.PROXY_TARGET_URL;

const proxy = httpProxy.createProxy();

const app = express();

app.use((req, res) => {
  const hostname = req.hostname;
  const slug = hostname.split(".")[0];
  const filename = req.path === "/" ? "index.html" : req.path.slice(1);
  const extension = path.extname(filename).toLowerCase();
  const resolvedFilename = extension ? filename : "index.html";
  const fullPath = `/${slug}/${resolvedFilename}?${env.ABS_SAS_TOKEN}`;

  // Rewrite the path with SAS Token
  req.url = fullPath;

  // Proxy the request
  proxy.web(req, res, {
    target: BASE_URL,
    changeOrigin: true,
    selfHandleResponse: false,
    secure: true,
    followRedirects: true,
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error in starting Proxy Server: ", err.message);
    process.exit(1);
  }
  console.log(`Proxy Server is running on port ${PORT}.`);
});
