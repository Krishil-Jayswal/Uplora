import { kafka } from "./index.js";

export const producer = kafka.producer();
await producer.connect();
