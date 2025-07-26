import { PrismaClient } from "../generated/index.js";
export type {
  Project,
  User,
  Deployment,
  Log,
  Status,
} from "../generated/index.js";

export const prisma = new PrismaClient();
