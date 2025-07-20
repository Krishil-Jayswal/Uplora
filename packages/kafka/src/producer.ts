import { Partitioners } from "kafkajs";
import { kafka } from "./index.js";

export const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});
await producer.connect();
