import { prisma } from "@repo/db";
import { Request, Response } from "express";

// TODO: Add the Redis layer on top of Database layes for data fetching.

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
        github_url: true,
        status: true,
        userId: true,
      },
    });

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
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: id,
      },
      select: {
        status: true,
      },
    });

    res.status(200).json({ projectId, status: project?.status });
  } catch (error) {
    console.error("Error in getting status: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const projectId = req.params.projectId!;

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

    res.status(200).json({ logs: project?.logs });
  } catch (error) {
    console.error("Error in getting logs: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
