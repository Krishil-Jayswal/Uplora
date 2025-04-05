import express from "express";
import { env } from "@repo/env";
import { prisma } from "@repo/db";
import V1Router from "./routes/index.route.js";
import cors from "cors";

const PORT = env.PORT;

const app = express();

app.use(cors());

app.use(express.json());

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
  console.log(`Server is running on port ${PORT}.`);
});
