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

export const ConfigureProjectSchema = z.object({
  fullname: z.string(),
});

export const FullnameSchema = z.tuple([z.string(), z.string()]);

export enum Status {
  CLONING = "cloning",
  BUILDING = "building",
  DEPLOYED = "deployed",
  FAILED = "failed",
}

export enum Oauth_Type {
  GITHUB = "GITHUB",
  GOOGLE = "GOOGLE",
}
