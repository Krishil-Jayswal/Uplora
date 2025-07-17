import { Request, Response } from "express";
import { ConfigureProjectSchema, FullnameSchema } from "@repo/validation";
import { githubApp } from "../config/github.js";
import { defaultMetadata } from "../config/metadata.js";

export const configureProject = async (req: Request, res: Response) => {
  try {
    const validation1 = ConfigureProjectSchema.safeParse(req.body);
    if (!validation1.success) {
      res.status(400).json({ message: "Missing params." });
      return;
    }
    const { fullname } = validation1.data;

    const validation2 = FullnameSchema.safeParse(fullname.split("/"));
    if (!validation2.success) {
      res.status(400).json({ message: "Invalid repo name." });
      return;
    }
    const [repo, owner] = validation2.data;
    const { installationId } = req.user!;
    const octokit = await githubApp.getInstallationOctokit(
      Number(installationId),
    );
    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });

    res.status(200).json({
      id: data.id,
      name: data.name,
      defaultBranch: data.default_branch,
      url: data.clone_url,
      slug: "",
      metadata: defaultMetadata,
    });
  } catch (error) {
    console.error(
      "Error in creating project config: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
