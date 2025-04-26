import { exec } from "child_process";
import { publisher } from "@repo/redis";
import stripAnsi from "strip-ansi";

export const buildProject = async (projectPath: string, projectId: string) => {
  return new Promise<boolean>((resolve) => {
    const command = `cd ${projectPath} && npm install && npm run build`;

    const child_process = exec(command);

    const handleLogs = (data: Buffer) => {
      const message = stripAnsi(data.toString());
      publisher.lpush(
        `logs:${projectId}`,
        JSON.stringify({
          createdAt: new Date(),
          message,
        }),
      );
    };

    child_process.stdout?.on("data", handleLogs);

    child_process.stderr?.on("data", handleLogs);

    child_process.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
