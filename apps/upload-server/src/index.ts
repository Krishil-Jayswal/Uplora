import express from "express";
import cors from "cors";
import { env } from "@repo/env";
import { prisma } from "@repo/db";
import V1Router from "./routes/index.route.js";
import { publisher } from "@repo/redis";
import { clearOutputDir } from "@repo/fs";
import { fileURLToPath } from "url";
import path from "path";

const PORT = env.UPLOAD_PORT;

const app = express();

app.use(express.json());

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running." });
});

app.use("/api/v1", V1Router);

app.listen(PORT, async (err) => {
  if (err) {
    console.error("Error in starting server: ", err);
    process.exit(1);
  }
  await Promise.all([
    prisma.$connect(),
    new Promise<void>((resolve) => {
      if (publisher.status === "ready") {
        resolve();
      }
      publisher.on("ready", resolve);
    }),
  ]);
  console.log("Database connected successfully.");
  console.log("Redis connected successfully.");
  console.log(`Upload Server is running on port ${PORT}.`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setInterval(() => {
  clearOutputDir(__dirname, 5);
}, 10000);

setInterval(() => {
  publisher.ping().then(console.log);
}, 30000);
