import { exec } from "child_process";

export const buildProject = async (slug: string) => {
  return new Promise<void>((resolve) => {
    const command = `cd ${slug} && npm install && npm run build`;

    const child_process = exec(command);

    child_process.stdout?.on("data", console.log);

    child_process.stderr?.on("data", console.log);

    child_process.on("close", () => resolve());
  });
};
