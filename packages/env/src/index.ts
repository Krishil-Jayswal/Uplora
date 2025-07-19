import { z } from "zod";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const EnvSchema = z.object({
  HTTP_PORT: z.string().default("HTTP Server Port"),
  UPLOAD_PORT: z.string().default("Upload Server Port"),
  PROXY_PORT: z.string().default("Proxy Server Port"),

  JWT_SECRET: z.string().default("JWT Secret"),
  MAX_AGE: z.string().default("Token Max Age"),

  REDIS_URL: z.string().default("Redis URL"),
  KAFKA_URL: z.string().default("Kafka cluster url"),
  DATABASE_URL: z.string().default("Database Url"),
  ABS_CONNECTION_URL: z.string().default("Azure Blob Connection URL"),
  ABS_CONTAINER_NAME: z.string().default("Azure Blob Container Name"),
  PROXY_TARGET_URL: z.string().default("Proxy Target URL"),
  ABS_SAS_TOKEN: z.string().default("Azure Blob SAS Token"),

  CLIENT_URL: z.string().default("Client url."),

  BASE_REDIRECT_URL: z.string().default("Redirect Url"),

  GITHUB_APP_ID: z.string().default("Github app id."),
  GITHUB_PRIVATE_KEY: z.string().default("Gihub app private key."),
  GITHUB_CLIENT_ID: z.string().default("Github app client Id."),
  GITHUB_CLIENT_SECRET: z.string().default("Github app client secret."),

  JOB_JSON_BASE64: z.string().default(""),
});

export const env = EnvSchema.parse(process.env);
