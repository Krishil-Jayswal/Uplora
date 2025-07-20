import { Redis } from "ioredis";
import { env } from "@repo/env";

export const publisher = new Redis(env.REDIS_URL);
