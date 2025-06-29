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
    const install_url = await githubApp.getInstallationUrl({ state: id });
    res.status(200).json({ install_url });
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
    res.redirect(`${env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error(
      "Error in github installation callback: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getRepos = async (req: Request, res: Response) => {
  try {
    const { installation_id } = req.user!;
    const octokit = await githubApp.getInstallationOctokit(
      Number(installation_id),
    );
    const { data } = await octokit.request("GET /installation/repositories");
    const repos = data.repositories
      .sort(
        (a, b) =>
          new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime(),
      )
      .map((repo) => {
        return {
          id: repo.id,
          name: repo.name,
          fullname: repo.full_name,
          url: repo.clone_url,
          defaultBranch: repo.default_branch,
          private: repo.private,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
        };
      });
    res.json({ repos });
  } catch (error) {
    console.error("Error in listing repos: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
