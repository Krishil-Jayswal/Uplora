/*
  1. Get the slug from the hostname. -> Done
  2. Find a stable deployment for the slug from database. -> Done
  3. If not stable deployment, return 404 page. -> Done
  4. Else, make the complete path to blob storage for the requested asset. -> Done
  5. Proxy the request to blob storage with SAS token(read access only). -> Done
  6. Cache the stable deployment for the slug and also every requested pages (if needed).
*/

import express from "express";
import httpProxy from "http-proxy";
import { env } from "@repo/env";
import path from "path";
import { prisma } from "@repo/db";

const PORT = env.CDN_PORT;
const BASE_URL = env.PROXY_TARGET_URL;

const proxy = httpProxy.createProxy();

const app = express();

app.use(async (req, res) => {
  const hostname = req.hostname;
  const slug = hostname.split(".")[0];
  const project = await prisma.project.findUnique({
    where: {
      slug,
    },
    select: {
      stableDeploymentId: true,
    },
  });

  if (!project?.stableDeploymentId) {
    res.send(`404 Not Found`);
  }

  const filename = req.path === "/" ? "index.html" : req.path.slice(1);
  const extension = path.extname(filename).toLowerCase();
  const resolvedFilename = extension ? filename : "index.html";
  const fullPath = `/${slug}/${project?.stableDeploymentId}/${resolvedFilename}?${env.ABS_SAS_TOKEN}`;

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
    console.log("Error in starting CDN Server: ", err.message);
    process.exit(1);
  }
  console.log(`CDN Server is running on port ${PORT}.`);
});
