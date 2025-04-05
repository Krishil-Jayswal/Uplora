import { z } from "zod";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envPath });

const EnvSchema = z.object({
  PORT: z.string(),
  JWT_SECRET: z.string(),
  MAX_AGE: z.string(),
});

export const env = EnvSchema.parse(process.env);
