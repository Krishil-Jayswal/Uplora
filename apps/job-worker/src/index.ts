/*
    1. Take necessary environment variables -> Done
    2. Make the token for cloning -> Done
    3. Clone the repo -> Done
    4. Make the shell command string -> Done
    5. Spwan a process and Build the repo -> Done
    6. Upload build to S3 -> Done
    7. Push all the logs to queue
    8. Update the project status time to time
*/

import { createAppAuth } from "@octokit/auth-app";
import { env } from "@repo/env";
import { Job } from "@repo/validation";
import { simpleGit } from "simple-git";
import path from "node:path";
import { exec, execSync } from "node:child_process";
import stripAnsi from "strip-ansi";
import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs";
import mime from "mime";

class Worker {
  public static async run() {
    try {
      const {
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

      console.log("Cloning the repo...");
      await simpleGit().clone(signedRepoUrl, projectBasePath);
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
        envVars[variable.variablename] = variable.variablename;
      });

      const buildSuccess = await new Promise<boolean>((resolve) => {
        const p = exec(commands, {
          env: envVars,
        });

        const handlestdout = (data: Buffer) => {
          const message = stripAnsi(data.toString());
          console.log(message);
        };

        p.stdout?.on("data", handlestdout);

        p.stdout?.on("error", handlestdout);

        p.on("close", (code) => {
          resolve(code === 0);
        });
      });

      if (!buildSuccess) throw Error("Build failed");

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
      const buildId = execSync("git rev-parse HEAD", { cwd: projectBasePath })
        .toString()
        .trim();
      const buildFiles = fs
        .readdirSync(projectBuildPath, { recursive: true })
        .filter((f) => f !== "." && f !== "..");

      await Promise.all(
        buildFiles.map((file) => {
          const filepath = path.join(projectBuildPath, file.toString());
          const filename = path.join(slug, buildId, file.toString());
          if (fs.statSync(filepath).isDirectory()) {
            return;
          }
          return uploadFile(filename, filepath);
        }),
      );

      console.log(`Build : ${buildId} successful.`);
    } catch (error) {
      console.error("Error in wokrer: ", (error as Error).message);
    }
  }
}

Worker.run();
