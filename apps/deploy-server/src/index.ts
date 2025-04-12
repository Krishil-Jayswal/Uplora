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
      await Promise.all([publisher.connect(), subscriber.connect()]);
      console.log("Redis connected successfully.");
      console.log("Deploy server started.");
    } catch (error) {
      console.error("Error in connecting to redis: ", error);
      process.exit(1);
    }

    while (true) {
      // Pop the element from the build queue
      const build = await subscriber.brPop("build-queue", 0);

      // Get the projectId
      const projectId = build?.element as string;

      try {
        await publisher
          .multi()
          .hSet(`project:${projectId}`, "status", Status.DEPLOYING)
          .lPush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Picked up from the build queue.",
            }),
          )
          .exec();

        // Get the slug
        const slug = (await subscriber.hGet(
          `project:${projectId}`,
          "slug",
        )) as string;

        // Download the files from Object Store
        await publisher.lPush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Downloading the files from Object Store ...",
          }),
        );
        await downloadProject(`output/${slug}`, __dirname);
        await publisher.lPush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Downloaded files from the Object Store.",
          }),
        );

        // Build the project
        publisher.lPush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Building the project ...",
          }),
        );
        const projectPath = path.join(__dirname, `output/${slug}`);
        const buildSuccess = await buildProject(projectPath, projectId);
        if (buildSuccess) {
          await publisher.lPush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Build completed.",
            }),
          );

          // List all the files of the project build
          const buildPath = path.join(projectPath, "dist");
          const files = listAllFiles(buildPath);

          // Upload to Object Store
          await publisher.lPush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Uploading the build files to Object Store ...",
            }),
          );
          const promiseArray = files.map((file) => {
            const filename = `dist/${slug}` + file.slice(buildPath.length);
            return uploadFile(filename, file);
          });
          await Promise.all(promiseArray);
          await publisher
            .multi()
            .lPush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Build files uploaded successfully.",
              }),
            )
            .hSet(`project:${projectId}`, "status", Status.DEPLOYED)
            .lPush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Project deployed successfully!",
              }),
            )
            .exec();

          console.log("Project deployed successfully!");
        } else {
          await publisher
            .multi()
            .lPush(
              `logs:${projectId}`,
              JSON.stringify({
                createdAt: new Date(),
                message: "Build failed.",
              }),
            )
            .hSet(`project:${projectId}`, "status", Status.FAILED)
            .exec();
        }
      } catch (error) {
        console.error("Error in deploying project: ", (error as Error).message);
        await publisher
          .multi()
          .lPush(
            `logs:${projectId}`,
            JSON.stringify({
              createdAt: new Date(),
              message: "Project deployment failed.",
            }),
          )
          .hSet(`logs:${projectId}`, "status", Status.FAILED)
          .exec();
      }
    }
  }
}

DeployServer.init();
