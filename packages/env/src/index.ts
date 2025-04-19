import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envPath });

const EnvSchema = z.object({
  HTTP_PORT: z.string(),
  UPLOAD_PORT: z.string(),
  REQ_HANDLER_PORT: z.string(),
  JWT_SECRET: z.string(),
  MAX_AGE: z.string(),
  REDIS_URL: z.string(),
  BLOB_CONNECTION_URL: z.string(),
  BLOB_CONTAINER_NAME: z.string(),
  PROXY_TARGET_URL: z.string(),
  BLOB_SAS_TOKEN: z.string(),
});

export const env = EnvSchema.parse(process.env);
