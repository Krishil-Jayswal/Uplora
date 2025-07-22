/*
    1. Take necessary environment variables -> Done
    2. Make the token for cloning -> Done
    3. Clone the repo -> Done
    4. Make the shell command string -> Done
    5. Spwan a process and Build the repo -> Done
    6. Upload build to object store -> Done
    7. Push all the logs to list and publish to their corresponding channel -> Done
    8. Update the project status time to time -> Done
    9. Emit the event to pusher in kafka -> Done
*/

import { createAppAuth } from "@octokit/auth-app";
import { env } from "@repo/env";
import { Event_Type, Job, Job_Event, Log, Status } from "@repo/validation";
import { simpleGit } from "simple-git";
import path from "node:path";
import { exec, execSync } from "node:child_process";
import stripAnsi from "strip-ansi";
import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import mime from "mime";
import { publisher } from "@repo/redis/publisher";
import { keymanager } from "@repo/redis/managers";
import { producer } from "@repo/kafka/producer";
import { Topic } from "@repo/kafka/meta";
import { randomBytes } from "node:crypto";

class Worker {
  public static async run() {
    const {
      id,
      slug,
      installationId,
      repoUrl,
      metadata: {
        rootDir,
        dependencyInstallationCommand,
        buildCommand,
        outDir,
        environmentVariables,
      },
    }: Job = JSON.parse(
      Buffer.from(env.JOB_JSON_BASE64, "base64").toString("utf8"),
    );

    const statusKey = keymanager.getStatusKey(id);
    const logsKey = keymanager.getLogsKey(id);
    const channelKey = keymanager.getChannelKey(id);

    let buildId = randomBytes(20).toString("hex");

    const publishEvent = async (type: Event_Type, content: string) => {
      const event: Job_Event = {
        type,
        content: content.trim(),
        timestamp: new Date(),
      };
      const multi = publisher.multi();
      switch (type) {
        case Event_Type.LOG: {
          const log: Log = {
            content: event.content,
            timestamp: event.timestamp,
          };
          multi.lpush(logsKey, JSON.stringify(log));
          break;
        }
        case Event_Type.STATUS: {
          multi.set(statusKey, content);
        }
      }
      multi.publish(channelKey, JSON.stringify(event));

      await multi.exec();
    };

    try {
      const auth = createAppAuth({
        appId: env.GITHUB_APP_ID,
        privateKey: env.GITHUB_PRIVATE_KEY,
      });

      const { token } = await auth({
        type: "installation",
        installationId: installationId,
      });

      const PROJECT_FOLDER = "project";
      const projectBasePath = path.join(process.cwd(), PROJECT_FOLDER);
      const signedRepoUrl = repoUrl.replace(
        "https://",
        `https://x-access-token:${token}@`,
      );

      publishEvent(Event_Type.STATUS, Status.CLONING);

      console.log("Cloning the repo...\n");
      publishEvent(Event_Type.LOG, "Cloning the repo...");
      await simpleGit().clone(signedRepoUrl, projectBasePath);

      buildId = execSync("git rev-parse HEAD", { cwd: projectBasePath })
        .toString()
        .trim();

      const projectRootPath = path.join(projectBasePath, rootDir);
      const commands = [
        `cd ${projectRootPath}`,
        `echo Installing dependencies...`,
        dependencyInstallationCommand,
        `echo Building the project...`,
        buildCommand,
      ].join(" && ");

      const envVars: Record<string, string> = {};
      environmentVariables.forEach((variable) => {
        envVars[variable.variablename] = variable.variablevalue;
      });

      publishEvent(Event_Type.STATUS, Status.BUILDING);

      const buildSuccess = await new Promise<boolean>((resolve) => {
        const p = exec(commands, {
          env: {
            ...process.env,
            ...envVars,
          },
        });

        const handlestdout = (data: Buffer) => {
          const message = stripAnsi(data.toString());
          console.log(message);
          publishEvent(Event_Type.LOG, message);
        };

        p.stdout?.on("data", handlestdout);

        p.stdout?.on("error", handlestdout);

        p.on("close", (code) => {
          resolve(code === 0);
        });
      });

      if (!buildSuccess) throw new Error("Build failed");

      const blobServiceClient = BlobServiceClient.fromConnectionString(
        env.ABS_CONNECTION_URL,
      );
      const containerClient = blobServiceClient.getContainerClient(
        env.ABS_CONTAINER_NAME,
      );

      await containerClient.createIfNotExists();

      const uploadFile = async (filename: string, filepath: string) => {
        const readStream = fs.createReadStream(filepath);
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        const contentType =
          mime.getType(filepath) || "application/octet-stream";
        await blockBlobClient.uploadStream(readStream, undefined, undefined, {
          blobHTTPHeaders: {
            blobContentType: contentType,
          },
        });
      };

      const projectBuildPath = path.join(projectRootPath, outDir);

      const buildFiles = fs
        .readdirSync(projectBuildPath, { recursive: true })
        .filter(
          (file) =>
            !fs
              .statSync(path.join(projectBuildPath, file.toString()))
              .isDirectory() &&
            file !== "." &&
            file !== "..",
        );

      await Promise.all(
        buildFiles.map((file) => {
          const filepath = path.join(projectBuildPath, file.toString());
          const filename = path.join(slug, buildId, file.toString());
          return uploadFile(filename, filepath);
        }),
      );

      console.log("Build successful...\n");
      publishEvent(Event_Type.LOG, "Build successful...");
      publishEvent(Event_Type.STATUS, Status.DEPLOYING);

      await producer.send({
        topic: Topic.STORE_LOGS,
        messages: [
          {
            value: JSON.stringify({ id, buildId }),
            key: id,
          },
        ],
      });
    } catch (error) {
      console.error("Error in worker: ", (error as Error).message);

      publishEvent(Event_Type.LOG, "Build failed.");
      publishEvent(Event_Type.STATUS, Status.FAILED);

      await producer.send({
        topic: Topic.STORE_LOGS,
        messages: [
          {
            value: JSON.stringify({ id, buildId }),
            key: id,
          },
        ],
      });
    } finally {
      publisher.quit();
      producer.disconnect();
    }
  }
}

Worker.run();
