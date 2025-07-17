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

const ProjectMetadata = z.object({
  framework: z.enum(["Vite"]),
  rootDir: z.string().trim(),
  dependencyInstallationCommand: z.enum(["npm install"]),
  buildCommand: z.enum(["npm run build"]),
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
