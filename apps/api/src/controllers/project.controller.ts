import {
  CreateProjectSchema,
  ProjectIdSchema,
  RepoFullnameSchema,
  Status,
} from "@repo/validation";
import { Request, Response } from "express";
import { githubApp } from "../config/github.js";
import { prisma } from "@repo/db";
import { generateSlug } from "../lib/slug.js";
import { producer } from "@repo/kafka/producer";
import { Topic } from "@repo/kafka/meta";
import { createDeploymentJob } from "../lib/job.js";

export const createProject = async (req: Request, res: Response) => {
  try {
    const validation1 = CreateProjectSchema.safeParse(req.body);
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

    const Job = createDeploymentJob(project, installationId!);
    await producer.send({
      topic: Topic.JOB,
      messages: [{ value: JSON.stringify(Job), key: id }],
    });

    res.status(201).json({ id: project.id });
  } catch (error) {
    console.error("Error in deploying project: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const validation = ProjectIdSchema.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    const { projectId } = validation.data;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        repoUrl: true,
        createdAt: true,
        updatedAt: true,
        deployments: {
          select: {
            id: true,
            status: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
        _count: {
          select: {
            deployments: true,
          },
        },
      },
    });

    res.status(200).json({ project });
  } catch (error) {
    console.error("Error in getting project: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const validation = ProjectIdSchema.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    const { projectId } = validation.data;
    const { id } = req.user!;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        ownerId: id,
      },
      select: {
        status: true,
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found." });
      return;
    }

    res.status(200).json({ status: project.status });
  } catch (error) {
    console.error(
      "Error in getting project status: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const projects = await prisma.project.findMany({
      where: {
        ownerId: id,
      },
      select: {
        id: true,
        name: true,
        repoUrl: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error in getting projects: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
