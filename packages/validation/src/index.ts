import { z } from "zod";

export const RegisterSchema = z.strictObject({
  name: z
    .string()
    .min(6, { message: "Name must be atleast 6 characters long." })
    .max(255, { message: "Name should not be more than 255 characters." }),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long." })
    .max(20, { message: "Password should not be more than 20 characters." }),
});

export const LoginSchema = z.strictObject({
  email: z.string().email(),
  password: z.string().min(6).max(20),
});

export const GithubUrlSchema = z.strictObject({
  githubUrl: z
    .string()
    .trim()
    .regex(
      /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\.git\/?$/,
      { message: "Must be a valid github repository url." },
    )
    .transform((url) => url.replace(/\/+$/, "")),
});

export enum Status {
  CLONING = "cloning",
  CLONED = "cloned",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  FAILED = "failed",
}

export interface Project {
  id: string;
  name: string;
  githubUrl: string;
  status: Status;
  slug: string;
  userId: string;
  createdAt: Date;
}

export interface Log {
  createdAt: Date;
  message: string;
}

export type LoginProps = z.infer<typeof LoginSchema>;

export type SignupProps = z.infer<typeof RegisterSchema>;
