import { z } from "zod";

export const OAuthCallbackSchema = z.strictObject({
  code: z.string(),
  state: z.string(),
});

export const GithubInstallationCallbackSchema = z.strictObject({
  installation_id: z.string(),
  setup_action: z.enum(["install", "update"]),
  state: z.string(),
});

const ProjectMetadataSchema = z.strictObject({
  framework: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.enum(["Vite"]),
  ),
  rootDir: z.string().trim(),
  dependencyInstallationCommand: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.enum(["npm install"]),
  ),
  buildCommand: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.enum(["npm run build"]),
  ),
  outDir: z.string().trim(),
  environmentVariables: z.array(
    z.strictObject({
      variablename: z.string().trim(),
      variablevalue: z.string().trim(),
    }),
  ),
});

export const CreateProjectSchema = z.strictObject({
  repoFullName: z.string().trim(),
  name: z.string().trim(),
  metadata: ProjectMetadataSchema,
});

export const RepoFullnameSchema = z.tuple([z.string(), z.string()]);

export const ProjectIdSchema = z.strictObject({
  projectId: z.string(),
});

export const DeploymentIdSchema = z.strictObject({
  deploymentId: z.string(),
});

export const GithubWebhookPushEventSchema = z.object({
  repository: z.object({
    id: z.number(),
  }),
});

export const GithubWebhookInstallationEventSchema = z.object({
  action: z.literal("deleted"),
  installation: z.object({
    account: z.object({
      id: z.number(),
    }),
  }),
});

export enum GithubEventType {
  Installation = "installation",
  Push = "push",
}

export const GithubEventTypeSchema = z.object({
  "x-github-event": z.enum([
    GithubEventType.Installation,
    GithubEventType.Push,
  ]),
});

export enum Status {
  QUEUED = "queued",
  CLONING = "cloning",
  BUILDING = "building",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  FAILED = "failed",
}

export enum Oauth_Type {
  GITHUB = "GITHUB",
  GOOGLE = "GOOGLE",
}

export enum Event_Type {
  STATUS = "STATUS",
  LOG = "LOG",
}

export type Job = {
  id: string;
  name: string;
  repoUrl: string;
  installationId: string;
  slug: string;
  metadata: z.infer<typeof ProjectMetadataSchema>;
};

export type Log = {
  content: string;
  timestamp: Date;
};

export type Job_Event = {
  type: Event_Type;
  content: string;
  timestamp: Date;
};

export type Pusher_Event = {
  id: string;
  buildId: string;
  status: Status;
};
