import { env } from "@repo/env";
import { Kafka } from "kafkajs";
import { CLIENT_ID } from "./meta.js";

export const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [env.KAFKA_URL],
});
