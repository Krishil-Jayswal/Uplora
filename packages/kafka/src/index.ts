import { env } from "@repo/env";
import { Kafka } from "kafkajs";
import { CLIENT_ID } from "./types.js";

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [env.KAFKA_URL],
});

export const producer = kafka.producer();
await producer.connect();

export const createConsumer = async (groupId: string) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  return consumer;
};

export * from "./types.js";
