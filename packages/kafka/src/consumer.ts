import { kafka } from "./index.js";

export const createConsumer = async (groupId: string) => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  return consumer;
};
