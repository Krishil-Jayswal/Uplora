import { z } from "zod";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "../../../.env");
dotenv.config({ path: envPath });

const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "production"]),

  API_PORT: z.string().default("API Server Port"),
  CDN_PORT: z.string().default("CDN Server Port"),
  WS_PORT: z.string().default("WS Server Port"),

  JWT_SECRET: z.string().default("JWT Secret"),
  MAX_AGE: z.string().default("Token Max Age"),

  REDIS_URL: z.string().default("Redis URL"),

  DATABASE_URL: z.string().default("Database Url"),

  ABS_CONNECTION_URL: z.string().default("Azure Blob Connection URL"),
  ABS_CONTAINER_NAME: z.string().default("Azure Blob Container Name"),
  ABS_SAS_TOKEN: z.string().default("Azure Blob SAS Token"),

  PROXY_TARGET_URL: z.string().default("Proxy Target URL"),

  CLIENT_URL: z.string().default("Client url."),

  BASE_REDIRECT_URL: z.string().default("Redirect Url"),

  GITHUB_APP_ID: z.string().default("Github app id."),
  GITHUB_PRIVATE_KEY: z.string().default("Gihub app private key."),
  GITHUB_CLIENT_ID: z.string().default("Github app client Id."),
  GITHUB_CLIENT_SECRET: z.string().default("Github app client secret."),

  JOB_JSON_BASE64: z.string().default(""),

  KAFKA_URL: z.string().default("Kafka cluster Url"),
  KAFKA_USERNAME: z.string().default("Kafka cluster username"),
  KAFKA_PASSWORD: z.string().default("Kafka cluster password"),
  KAFKA_CA_CERT: z.string().default("Kafka cluster ca certificate"),
});

export const env = EnvSchema.parse(process.env);
