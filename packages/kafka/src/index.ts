import { env } from "@repo/env";
import { Kafka } from "kafkajs";
import { CLIENT_ID, MECHANISM } from "./meta.js";

export const kafka =
  env.APP_ENV === "production"
    ? new Kafka({
        clientId: CLIENT_ID,
        brokers: [env.KAFKA_URL],
        ssl: {
          ca: [env.KAFKA_CA_CERT],
        },
        sasl: {
          mechanism: MECHANISM,
          username: env.KAFKA_USERNAME,
          password: env.KAFKA_PASSWORD,
        },
      })
    : new Kafka({
        clientId: CLIENT_ID,
        brokers: [env.KAFKA_URL],
      });
