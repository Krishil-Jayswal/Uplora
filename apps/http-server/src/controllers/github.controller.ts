import { Request, Response } from "express";
import { githubApp } from "../config/github.js";
import { env } from "@repo/env";
import { keymanager, publisher } from "@repo/redis";
import { GithubInstallationSchema } from "@repo/validation";
import { prisma } from "@repo/db";

export const appInstallationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const stateKey = keymanager.getInstallationStateKey(id);
    await publisher.setex(stateKey, 60 * 10, "YES");
    const installationUrl = await githubApp.getInstallationUrl({ state: id });
    res.status(200).json({ installationUrl });
  } catch (error) {
    console.error(
      "Error in github app installation: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const callbackHandler = async (req: Request, res: Response) => {
  try {
    const validation = GithubInstallationSchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({ message: "Missing query params." });
      return;
    }
    const { state, setup_action, installation_id } = validation.data;
    if (setup_action === "install") {
      await prisma.user.update({
        where: {
          id: state,
        },
        data: {
          installation_id,
        },
      });
    }
    res.redirect(env.CLIENT_URL);
  } catch (error) {
    console.error(
      "Error in github installation callback: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
