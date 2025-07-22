import { createConsumer } from "@repo/kafka/consumer";
import { GroupId, Topic } from "@repo/kafka/meta";
import { Job } from "@repo/validation";
import {
  BatchV1Api,
  KubeConfig,
  BatchV1ApiCreateNamespacedJobRequest,
} from "@kubernetes/client-node";

class Processor {
  public static async start() {
    const kubectl = new KubeConfig();
    kubectl.loadFromDefault();
    const k = kubectl.makeApiClient(BatchV1Api);

    const consumer = await createConsumer(GroupId.PROCESSOR);
    await consumer.subscribe({ topic: Topic.JOB });
    consumer.run({
      eachMessage: async ({ message }) => {
        const Job: Job = JSON.parse(message.value?.toString() || "{}");
        console.log(JSON.stringify(Job, null, 2));
        const JOB_JSON_BASE64 = Buffer.from(
          message.value?.toString() ?? "",
          "utf8",
        ).toString("base64");
        console.log(JOB_JSON_BASE64);
        const batchV1ApiCreateNamespacedJobRequest: BatchV1ApiCreateNamespacedJobRequest =
          {
            namespace: "default",
            body: {},
          };
        const response = await k.createNamespacedJob(
          batchV1ApiCreateNamespacedJobRequest,
        );

        console.log(response);
      },
    });
  }
}

Processor.start();
