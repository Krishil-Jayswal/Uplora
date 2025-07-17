import { Kafka, ITopicConfig } from "kafkajs";
import { CLIENT_ID, Topic } from "./types.js";
import { env } from "@repo/env";

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [env.KAFKA_URL],
});

const admin = kafka.admin();

await admin.connect();

const existingTopics = await admin.listTopics();

const requiredTopics: ITopicConfig[] = [
  { topic: Topic.JOB, numPartitions: 4, replicationFactor: 1 },
];

const topicsToCreate = requiredTopics.filter(
  (t) => !existingTopics.includes(t.topic),
);

if (topicsToCreate.length) {
  await admin.createTopics({ topics: topicsToCreate });
  console.log("Created kafka topics: ");
  console.table(topicsToCreate);
}

await admin.disconnect();
