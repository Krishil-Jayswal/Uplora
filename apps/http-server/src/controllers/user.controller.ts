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

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in getting projects: ", error);
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
