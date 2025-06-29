import { prisma } from "@repo/db";
import { Request, Response } from "express";
import { subscriber } from "@repo/redis";
import {
  Project,
  Status,
  Log,
  CreateProjectConfigSchema,
} from "@repo/validation";
import { githubApp } from "../config/github.js";
import { defaultMetadata } from "../config/metadata.js";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const projects = await prisma.project.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        github_url: true,
        status: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const cloningProjectIds = projects.flatMap((project) =>
      project.status === Status.CLONING ? [`project:${project.id}`] : [],
    );
    if (cloningProjectIds.length > 0) {
      const cloningProjects = await Promise.all(
        cloningProjectIds.map((id) => subscriber.hgetall(id)),
      );
      const parsedCloningProjects = cloningProjects.map(
        (project) => project as unknown as Project,
      );
      projects.forEach((project) => {
        if (project.status === Status.CLONING) {
          const cloningProject = parsedCloningProjects.find(
            (parsedProject) => parsedProject.id === project.id,
          )!;
          project.status = cloningProject.status;
        }
      });
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error in getting projects: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const projectId = req.params.projectId!;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: id,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        github_url: true,
        status: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        logs: {
          select: {
            message: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
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
    const { id } = req.user!;
    const projectId = req.params.projectId!;
    let status: Status;
    const redisStatus = await subscriber.hget(`project:${projectId}`, "status");
    if (redisStatus) {
      status = redisStatus as Status;
    } else {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: id,
        },
        select: {
          status: true,
        },
      });
      status = project?.status as Status;
    }
    console.log(status);
    res.status(200).json({ projectId, status });
  } catch (error) {
    console.error("Error in getting status: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const projectId = req.params.projectId!;
    let logs: Log[];
    const redisLogs = await subscriber.lrange(`logs:${projectId}`, 0, -1);
    if (redisLogs) {
      logs = redisLogs.map((log) => JSON.parse(log) as Log);
    } else {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: id,
        },
        select: {
          logs: {
            select: {
              message: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      logs = project?.logs as Log[];
    }

    res.status(200).json({ logs });
  } catch (error) {
    console.error("Error in getting logs: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// TODO: Slug Creation
export const createProjectConfig = async (req: Request, res: Response) => {
  try {
    const validation = CreateProjectConfigSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: "Missing params." });
      return;
    }

    const { fullname } = validation.data;
    const [owner, repo] = fullname.split("/");
    if (!owner || !repo) {
      res.status(400).json({ message: "Invalid repo name." });
      return;
    }

    const { installation_id } = req.user!;
    const octokit = await githubApp.getInstallationOctokit(
      Number(installation_id),
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
