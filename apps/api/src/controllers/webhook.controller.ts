import { prisma } from "@repo/db";
import {
  GithubEventType,
  GithubEventTypeSchema,
  GithubWebhookInstallationEventSchema,
  GithubWebhookPushEventSchema,
  Oauth_Type,
} from "@repo/validation";
import { Request, Response } from "express";

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
          // Delete the installationId from database by finding the user from oauthId: id, oauthType: Oauth_Type: GITHUB
          const user = await prisma.user.findUnique({
            where: {
              oauthType_oauthId: {
                oauthId: id.toString(),
                oauthType: Oauth_Type.GITHUB,
              },
            },
          });
          console.log(user);
        }
        break;
      }
      case GithubEventType.Push: {
        const validation = GithubWebhookPushEventSchema.safeParse(req.body);
        if (validation.success) {
          const {
            repository: { id },
          } = validation.data;
          // Filter projects on installationId and submit a deployment job for each project.
          const projects = await prisma.project.findMany({
            where: {
              repoId: id.toString(),
            },
            select: {
              id: true,
              name: true,
              slug: true,
              repoUrl: true,
              owner: {
                select: {
                  installationId: true,
                },
              },
              metadata: true,
            },
          });
          console.log(projects);
        }
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
