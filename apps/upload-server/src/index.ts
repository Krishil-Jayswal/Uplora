import express from "express";
import cors from "cors";
import { env } from "@repo/env";
import { prisma } from "@repo/db";

const PORT = env.UPLOAD_PORT;

const app = express();

app.use(express.json());

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running." });
});

app.listen(PORT, async (err) => {
  if (err) {
    console.error("Error in starting server: ", err);
    process.exit(1);
  }
  await prisma.$connect();
  console.log("Database connected successfully.");
  console.log(`Upload Server is running on port ${PORT}.`);
});
