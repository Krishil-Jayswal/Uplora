import { env } from "@repo/env";
import { Redis } from "ioredis";

export const subscriber = new Redis(env.REDIS_URL);
