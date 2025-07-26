import { prisma } from "@repo/db";
import {
  GithubEventType,
  GithubEventTypeSchema,
  GithubWebhookInstallationEventSchema,
  GithubWebhookPushEventSchema,
  Oauth_Type,
} from "@repo/validation";
import { Request, Response } from "express";
import { createDeploymentJob } from "../lib/job.js";
import { producer } from "@repo/kafka/producer";
import { Topic } from "@repo/kafka/meta";

export const githubWebhookHandler = async (req: Request, res: Response) => {
  try {
    const eventValidation = GithubEventTypeSchema.safeParse(req.headers);

    if (!eventValidation.success) {
      res.status(400).json({ message: "Unknown event" });
      return;
    }

    const { "x-github-event": event } = eventValidation.data;

    switch (event) {
      case GithubEventType.Installation: {
        const validation = GithubWebhookInstallationEventSchema.safeParse(
          req.body,
        );
        if (validation.success) {
          const {
            installation: {
              account: { id },
            },
          } = validation.data;
          await prisma.user.update({
            where: {
              oauthType_oauthId: {
                oauthId: id.toString(),
                oauthType: Oauth_Type.GITHUB,
              },
            },
            data: {
              installationId: null,
            },
          });
        }
        break;
      }

      // Check for head ref to default branch
      case GithubEventType.Push: {
        const validation = GithubWebhookPushEventSchema.safeParse(req.body);
        if (validation.success) {
          const {
            repository: { id },
            installation: { id: installationId },
          } = validation.data;

          const projects = await prisma.project.findMany({
            where: {
              repoId: id.toString(),
            },
          });

          await Promise.all(
            projects.map((project) => {
              const Job = createDeploymentJob(
                project,
                installationId.toString(),
              );
              return producer.send({
                topic: Topic.JOB,
                messages: [
                  { value: JSON.stringify(Job), key: project.ownerId },
                ],
              });
            }),
          );
        }

        break;
      }
    }

    res.status(200).json({ message: "Event processed." });
  } catch (error) {
    console.error(
      "Error in github webhook controller: ",
      (error as Error).message,
    );
    res.status(500).json({ message: "Internal server error." });
  }
};
