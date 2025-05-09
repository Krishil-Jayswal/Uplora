import { publisher, subscriber } from "@repo/redis";
import { downloadProject, uploadFile } from "@repo/object-store";
import path from "path";
import { fileURLToPath } from "url";
import { buildProject } from "./worker.js";
import { clearOutputDir, listAllFiles } from "@repo/fs";
import { Status } from "@repo/validation";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeployServer {
  public static async init() {
    await DeployServer.connectRedis();

    DeployServer.setupLogging();

    console.log("Deploy server started.");

    setInterval(() => clearOutputDir(__dirname, 10), 10000);
    setInterval(() => publisher.ping().then(console.log), 30000);

    DeployServer.pollBuildQueue();
  }

  private static async connectRedis() {
    try {
      await Promise.all([
        new Promise<void>((resolve) =>
          publisher.status === "ready"
            ? resolve()
            : publisher.once("ready", resolve),
        ),
        new Promise<void>((resolve) =>
          subscriber.status === "ready"
            ? resolve()
            : subscriber.once("ready", resolve),
        ),
      ]);
      console.log("Redis connected successfully.");
    } catch (error) {
      console.error("Error in connecting to Redis: ", error);
      process.exit(1);
    }
  }

  private static async setupLogging() {
    const logEvents = (
      client: typeof subscriber | typeof publisher,
      name: string,
    ) => {
      client.on("connect", () => console.log(`[${name}] connected.`));
      client.on("ready", () => console.log(`[${name}] ready.`));
      client.on("reconnecting", () => console.log(`[${name}] reconnecting.`));
      client.on("end", () => console.log(`[${name}] closed.`));
      client.on("error", (err) => console.log(`[${name}] error: `, err));
    };

    logEvents(publisher, "Publisher");
    logEvents(subscriber, "Subscriber");
  }

  private static async pollBuildQueue() {
    try {
      const build = await subscriber.brpop("build-queue", 150);
      const projectId = build?.[1];

      if (!projectId) {
        console.warn("Empty project Id.");
        DeployServer.pollBuildQueue();
        return;
      }

      await DeployServer.deployProject(projectId);
    } catch (error) {
      console.error("Error in polling build queue", error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    DeployServer.pollBuildQueue();
  }

  private static async deployProject(projectId: string) {
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

      // Log for downloaded project files successfully and building the project
      await publisher
        .multi()
        .lpush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Downloaded files from the Object Store.",
          }),
        )
        .lpush(
          `logs:${projectId}`,
          JSON.stringify({
            createdAt: new Date(),
            message: "Building the project ...",
          }),
        )
        .exec();

      // Build the project
      const projectPath = path.join(__dirname, `output/${slug}`);
      const buildSuccess = await buildProject(projectPath, projectId);
      if (!buildSuccess) throw new Error("Build failed.");

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

DeployServer.init();
