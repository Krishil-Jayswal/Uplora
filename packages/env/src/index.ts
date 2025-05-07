import { z } from "zod";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const EnvSchema = z.object({
  HTTP_PORT: z.string().default("Your HTTP Server Port"),
  UPLOAD_PORT: z.string().default("Your Upload Server Port"),
  REQ_HANDLER_PORT: z.string().default("Your Request Handler Port"),
  JWT_SECRET: z.string().default("Your JWT Secret"),
  MAX_AGE: z.string().default("Your Token Max Age"),
  REDIS_URL: z.string().default("Your Redis URL"),
  ABS_CONNECTION_URL: z.string().default("Your Azure Blob Connection URL"),
  ABS_CONTAINER_NAME: z.string().default("Your Azure Blob Container Name"),
  PROXY_TARGET_URL: z.string().default("Your Proxy Target URL"),
  BLOB_SAS_TOKEN: z.string().default("Your Azure Blob SAS Token"),
});

export const env = EnvSchema.parse(process.env);
