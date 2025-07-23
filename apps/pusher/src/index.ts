/*
  1. Connect to database. -> Done
  2. Take necessary variables from the message. -> Done
  3. Get the status and logs from redis. -> Done
  4. Create a transaction to
     - Update the project status to current one.
     - Update the current deploymentId to the current one.
     - Crearta a new deployment entry for the project.
     - Create all the logs for the current deployment in batch.
  5. Change status to deployed in redis.
*/

import { subscriber } from "@repo/redis/subscriber";
import { keymanager } from "@repo/redis/managers";
import { prisma } from "@repo/db";
import { Log, Pusher_Event } from "@repo/validation";
import { createConsumer } from "@repo/kafka/consumer";
import { GroupId, Topic } from "@repo/kafka/meta";

class Pusher {
  public static async start() {
    try {
      await prisma.$connect();
      console.log("Database connected successfully.");
    } catch (error) {
      console.error(
        "Error in connecting to Database: ",
        (error as Error).message,
      );
      process.exit(1);
    }

    try {
      const consumer = await createConsumer(GroupId.PUSHER);
      await consumer.subscribe({
        topic: Topic.STORE_LOGS,
        fromBeginning: true,
      });
      consumer.run({
        eachMessage: async ({ message }) => {
          const { id: projectId, buildId: deploymentId }: Pusher_Event =
            JSON.parse(message.value?.toString() || "{}");

          const logsKey = keymanager.getLogsKey(projectId);
          const statusKey = keymanager.getStatusKey(projectId);

          const status = await subscriber.get(statusKey);
          const logs: Log[] = (await subscriber.lrange(logsKey, 0, -1)).map(
            (log) => JSON.parse(log),
          );

          console.log("Project", projectId);
          console.log("Deployment", deploymentId);
          console.log("Status ", status);
          console.log("Build logs");
          console.log(logs);
        },
      });
    } catch (error) {
      console.error("Error in pusher: ", (error as Error).message);
    }
  }
}

Pusher.start();
