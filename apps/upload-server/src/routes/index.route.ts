import express from "express";
import { verifyToken } from "@repo/crypto/jwt";
import { GithubUrlSchema, Status } from "@repo/validation";
import { getNameFromRepo } from "../utils/github.js";
import { prisma } from "@repo/db";
import { fileURLToPath } from "url";
import path from "path";
import { simpleGit } from "simple-git";
import { generateSlug } from "../utils/slug.js";
import { publisher } from "@repo/redis";
import { listAllFiles } from "@repo/fs";
import { uploadFile } from "@repo/object-store";

const V1Router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

V1Router.post("/deploy", async (req, res) => {
  try {
    // Check for Authentication
    const token = req.headers["authorization"];
    if (!token) {
      res.status(401).json({ message: "No Token provided." });
      return;
    }
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      console.error("Error in verifying token: ", error);
      res.status(401).json({ message: "Token expired." });
      return;
    }

    // Input Data Validation
    const validation = GithubUrlSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid github repository." });
      return;
    }

    // Generate slug
    const { githubUrl } = validation.data;
    const { id } = payload;
    const repoName = getNameFromRepo(githubUrl);
    const slug = await generateSlug(repoName);

    // Create a Database Entry
    const project = await prisma.project.create({
      data: {
        name: repoName,
        userId: id,
        github_url: githubUrl,
        status: Status.CLONING,
        slug,
      },
    });

    // Add the project in redis
    await publisher.hset(`project:${project.id}`, {
      id: project.id,
      name: project.name,
      userId: project.userId,
      githubUrl: project.github_url,
      status: project.status,
      slug: project.slug,
      createdAt: `${project.createdAt}`,
    });

    // Add the log
    await publisher.lpush(
      `logs:${project.id}`,
      JSON.stringify({
        createdAt: new Date(),
        message: "Cloning the repository ...",
      }),
    );

    // Sending the Response for polling
    res.json({ projectId: project.id });

    try {
      // Clone the repository
      const localpath = path.join(__dirname, `../output/${slug}`);
      await simpleGit().clone(githubUrl, localpath);

      // Update the status and add the log
      await publisher
        .multi()
        .hset(`project:${project.id}`, "status", Status.CLONED)
        .lpush(
          `logs:${project.id}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Repository cloned successfully.",
          }),
        )
        .exec();

      // Log for uploading the files
      await publisher.lpush(
        `logs:${project.id}`,
        JSON.stringify({
          createdAt: new Date(),
          message: "Uploading files ...",
        }),
      );

      // List all the files of the repository
      const files = listAllFiles(localpath);

      // Upload them to Object Store
      const promiseArray = files.map((file) =>
        uploadFile(file.slice(__dirname.length - 6), file),
      );
      await Promise.all(promiseArray);

      // Log for file uploaded successfully
      await publisher.lpush(
        `logs:${project.id}`,
        JSON.stringify({
          createdAt: new Date(),
          message: "Files uploaded successfully.",
        }),
      );

      // Publish the event to redis
      await publisher.lpush("build-queue", project.id);

      // Log for build queue
      await publisher.lpush(
        `logs:${project.id}`,
        JSON.stringify({
          createdAt: new Date(),
          message: "Project queued for build.",
        }),
      );
    } catch (error) {
      console.error("Error in deploying project: ", (error as Error).message);
      await publisher
        .multi()
        .lpush(
          `logs:${project.id}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Project deployment failed.",
          }),
        )
        .hset(`project:${project.id}`, "status", Status.FAILED)
        .exec();
    }
  } catch (error) {
    console.error("Error in deploying project: ", (error as Error).message);
  }
});

export default V1Router;
