import { prisma } from "@repo/db";
import { DeploymentIdSchema, ProjectIdSchema } from "@repo/validation";
import { Request, Response } from "express";
import { createDeploymentJob } from "../lib/job.js";
import { producer } from "@repo/kafka/producer";
import { Topic } from "@repo/kafka/meta";

export const createDeployment = async (req: Request, res: Response) => {
  try {
    const validation = ProjectIdSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    const { projectId } = validation.data;
    const { id, installationId } = req.user!;

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        ownerId: id,
      },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found." });
      return;
    }

    const Job = createDeploymentJob(project, installationId!);
    await producer.send({
      topic: Topic.JOB,
      messages: [{ value: JSON.stringify(Job), key: id }],
    });

    res.status(201).json({ id: project.id });
  } catch (error) {
    console.error("Error in creating deployment: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getDeployment = async (req: Request, res: Response) => {
  try {
    const validation = DeploymentIdSchema.safeParse(req.params);
    if (!validation.success) {
      res.status(400).json({ message: "Invalid data format." });
      return;
    }

    const { deploymentId } = validation.data;
    const { id } = req.user!;

    const deployment = await prisma.deployment.findUnique({
      where: {
        id: deploymentId,
        project: {
          ownerId: id,
        },
      },
      include: {
        logs: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
            timestamp: true,
          },
        },
      },
    });

    if (!deployment) {
      res.status(404).json({ message: "Deployment not found." });
      return;
    }

    res.status(200).json({ deployment });
  } catch (error) {
    console.error("Error in getting deployment: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getDeployments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const { id } = req.user!;
    let whereClause;

    if (projectId) {
      const validation = ProjectIdSchema.safeParse({ projectId });
      if (!validation.success) {
        res.status(400).json({ message: "Invalid data format." });
        return;
      }
      whereClause = {
        projectId: validation.data.projectId,
        project: {
          ownerId: id,
        },
      };
    } else {
      whereClause = {
        project: {
          ownerId: id,
        },
      };
    }

    const deployments = await prisma.deployment.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        buildId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ deployments });
  } catch (error) {
    console.error(
      "Error in getting project deployments: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
