import { ITopicConfig } from "kafkajs";
import { kafka } from "./index.js";
import { Topic } from "./meta.js";

const admin = kafka.admin();

await admin.connect();

const existingTopics = await admin.listTopics();

const requiredTopics: ITopicConfig[] = [
  { topic: Topic.JOB, numPartitions: 4, replicationFactor: 1 },
  { topic: Topic.STORE_LOGS, numPartitions: 4, replicationFactor: 1 },
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
