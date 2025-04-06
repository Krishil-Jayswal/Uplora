import { createClient } from "redis";
import { env } from "@repo/env";

const REDIS_URL = env.REDIS_URL;

export const publisher = createClient({
  url: REDIS_URL,
});

export const subscriber = createClient({
  url: REDIS_URL,
});
