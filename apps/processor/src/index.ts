import { createConsumer } from "@repo/kafka/consumer";
import { GroupId, Topic } from "@repo/kafka/meta";
import { Job } from "@repo/validation";

class JobProcessor {
  public static async start() {
    const consumer = await createConsumer(GroupId.JOB_PROCESSOR);
    await consumer.subscribe({ topic: Topic.JOB });
    consumer.run({
      eachMessage: async ({ message }) => {
        const Job: Job = JSON.parse(message.value?.toString() || "{}");
        console.log(JSON.stringify(Job, null, 2));
        console.log(
          Buffer.from(message.value?.toString() ?? "", "utf8").toString(
            "base64",
          ),
        );
      },
    });
  }
}

JobProcessor.start();
