import { createConsumer } from "@repo/kafka/consumer";
import { GroupId, Topic } from "@repo/kafka/meta";
import { BatchV1Api, KubeConfig } from "@kubernetes/client-node";
import { createJobRequest } from "./job.js";
import { Job } from "@repo/validation";
import { env } from "@repo/env";

class Processor {
  public static async start() {
    const kubectl = new KubeConfig();
    if (env.APP_ENV === "production") {
      kubectl.loadFromCluster();
    } else {
      kubectl.loadFromDefault();
    }
    const k = kubectl.makeApiClient(BatchV1Api);

    const consumer = await createConsumer(GroupId.PROCESSOR);
    await consumer.subscribe({ topic: Topic.JOB });
    consumer.run({
      eachMessage: async ({ message }) => {
        const Job: Job = JSON.parse(message.value?.toString() || "{}");
        const batchV1ApiJobRequest = createJobRequest(Job);
        await k.createNamespacedJob(batchV1ApiJobRequest);
      },
    });
  }
}

Processor.start();
