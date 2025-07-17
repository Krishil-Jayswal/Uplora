import {
  DeployProjectSchema,
  Job,
  RepoFullnameSchema,
  Status,
} from "@repo/validation";
import { Request, Response } from "express";
import { githubApp } from "../config/github.js";
import { prisma } from "@repo/db";
import { generateSlug } from "../lib/slug.js";
import { producer, Topic } from "@repo/kafka";

export const deployProject = async (req: Request, res: Response) => {
  try {
    const validation1 = DeployProjectSchema.safeParse(req.body);
    if (!validation1.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }
    const { repoFullName, name, metadata } = validation1.data;
    const validation2 = RepoFullnameSchema.safeParse(repoFullName.split("/"));
    if (!validation2.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }
    const [owner, repo] = validation2.data;
    const { installationId, id } = req.user!;

    const octokit = await githubApp.getInstallationOctokit(
      Number(installationId),
    );
    const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });
    const slug = await generateSlug(name);
    const project = await prisma.project.create({
      data: {
        name,
        ownerId: id,
        repoId: data.id.toString(),
        repoUrl: data.clone_url,
        slug,
        metadata: JSON.stringify(metadata),
        status: Status.QUEUED,
      },
    });

    const Job: Job = {
      id: project.id,
      name: project.name,
      repoUrl: project.repoUrl,
      slug,
      installationId: installationId!,
      metadata,
    };

    await producer.send({
      topic: Topic.JOB,
      messages: [{ value: JSON.stringify(Job), key: project.id }],
    });

    res.status(201).json({ id: project.id });
  } catch (error) {
    console.error("Error in deploying project: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
