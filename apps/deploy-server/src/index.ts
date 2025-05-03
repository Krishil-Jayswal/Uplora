import { publisher, subscriber } from "@repo/redis";
import { downloadProject, uploadFile } from "@repo/object-store";
import path from "path";
import { fileURLToPath } from "url";
import { buildProject } from "./worker.js";
import { listAllFiles } from "@repo/fs";
import { Status } from "@repo/validation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Clear the local project folder.

class DeployServer {
  public static async init() {
    // Connect to Redis
    try {
      await Promise.all([
        new Promise<void>((resolve) => {
          if (publisher.status === "ready") {
            resolve();
          }
          publisher.on("ready", resolve);
        }),
        new Promise<void>((resolve) => {
          if (subscriber.status === "ready") {
            resolve();
          }
          subscriber.on("ready", resolve);
        }),
      ]);
      console.log("Redis connected successfully.");
      console.log("Deploy server started.");
    } catch (error) {
      console.error("Error in connecting to redis: ", error);
      process.exit(1);
    }

    while (true) {
      // Pop the element from the build queue
      const build = await subscriber.brpop("build-queue", 0);

      // Get the projectId
      const projectId = build?.[1] as string;

      try {
        // Log for picking up from the build queue and update the status to Deploying
        await publisher
          .multi()
          .hset(`project:${projectId}`, "status", Status.DEPLOYING)
          .lpush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Picked up from the build queue.",
            }),
          )
          .exec();

        // Get the slug
        const slug = (await subscriber.hget(
          `project:${projectId}`,
          "slug",
        )) as string;

        // Log for downloading the files from Object Store
        await publisher.lpush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Downloading the files from Object Store ...",
          }),
        );

        // Download the files from Object Store
        await downloadProject(`output/${slug}`, __dirname);

        // Log for downloaded project files successfully
        await publisher.lpush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Downloaded files from the Object Store.",
          }),
        );

        // Log for building the project
        publisher.lpush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Building the project ...",
          }),
        );

        // Build the project
        const projectPath = path.join(__dirname, `output/${slug}`);
        const buildSuccess = await buildProject(projectPath, projectId);
        if (buildSuccess) {
          // Log for build completed
          await publisher.lpush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Build completed.",
            }),
          );

          // List all the files of the project build
          const buildPath = path.join(projectPath, "dist");
          const files = listAllFiles(buildPath);

          // Log for uploading the build files to Object Store
          await publisher.lpush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Uploading the build files to Object Store ...",
            }),
          );

          // Upload to Object Store
          const promiseArray = files.map((file) => {
            const filename = `dist/${slug}` + file.slice(buildPath.length);
            return uploadFile(filename, file);
          });
          await Promise.all(promiseArray);

          // Log for build files uploaded successfully and update the status to Deployed and publishing the event for flushing the project data
          await publisher
            .multi()
            .lpush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Build files uploaded successfully.",
              }),
            )
            .hset(`project:${projectId}`, "status", Status.DEPLOYED)
            .lpush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Project deployed successfully!",
              }),
            )
            .lpush("flush-queue", projectId)
            .exec();
        } else {
          // Log for build failed and update the status to Failed and publishing the event for flushing the project data
          await publisher
            .multi()
            .lpush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Build failed.",
              }),
            )
            .hset(`project:${projectId}`, "status", Status.FAILED)
            .lpush("flush-queue", projectId)
            .exec();
        }
      } catch (error) {
        console.error("Error in deploying project: ", (error as Error).message);
        // Log for project deployment failed and update the status to Failed and publishing the event for flushing the project data
        await publisher
          .multi()
          .lpush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Project deployment failed.",
            }),
          )
          .hset(`logs:${projectId}`, "status", Status.FAILED)
          .lpush("flush-queue", projectId)
          .exec();
      }
    }
  }
}

DeployServer.init();
