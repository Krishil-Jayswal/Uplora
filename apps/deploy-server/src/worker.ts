import { exec } from "child_process";
import { publisher } from "@repo/redis";

export const buildProject = async (projectPath: string, projectId: string) => {
  return new Promise<boolean>((resolve) => {
    const command = `cd ${projectPath} && npm install && npm run build`;

    const child_process = exec(command);

    child_process.stdout?.on("data", (data) =>
      publisher.lPush(
        `logs:${projectId}`,
        JSON.stringify({
          createdAt: new Date(),
          message: String(data),
        }),
      ),
    );

    child_process.stderr?.on("data", (data) =>
      publisher.lPush(
        `logs:${projectId}`,
        JSON.stringify({
          createdAt: new Date(),
          message: String(data),
        }),
      ),
    );

    child_process.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
