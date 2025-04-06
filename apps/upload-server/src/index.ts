import express from "express";
import cors from "cors";
import { env } from "@repo/env";
import { prisma } from "@repo/db";
import V1Router from "./routes/index.route.js";
import { publisher } from "@repo/redis";

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
  await prisma.$connect();
  console.log("Database connected successfully.");
  await publisher.connect();
  console.log("Redis connected successfully.");
  console.log(`Upload Server is running on port ${PORT}.`);
});
