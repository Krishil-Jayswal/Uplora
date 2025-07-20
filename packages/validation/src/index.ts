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

const ProjectMetadata = z.strictObject({
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

export const DeployProjectSchema = z.strictObject({
  repoFullName: z.string().trim(),
  name: z.string().trim(),
  metadata: ProjectMetadata,
});

export const RepoFullnameSchema = z.tuple([z.string(), z.string()]);

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

export type Job = {
  id: string;
  name: string;
  repoUrl: string;
  installationId: string;
  slug: string;
  metadata: z.infer<typeof ProjectMetadata>;
};

export enum Event_Type {
  STATUS = "STATUS",
  LOG = "LOG",
}

export type Job_Event = {
  type: Event_Type;
  content: string;
  timestamp: Date;
};

export type Log = {
  content: string;
  timestamp: Date;
};

export type Pusher_Event = {
  id: string;
  buildId: string;
};
