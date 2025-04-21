import { Redis } from "ioredis";
import { env } from "@repo/env";

const REDIS_URL = env.REDIS_URL;

export const publisher = new Redis(REDIS_URL);

export const subscriber = new Redis(REDIS_URL);
