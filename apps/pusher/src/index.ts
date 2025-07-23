/*
  1. Connect to database. -> Done
  2. Take necessary variables from the message. -> Done
  3. Get the logs from redis. -> Done
  4. Create a transaction to
     - Crearta a new deployment entry for the project. -> Done
     - Create all the logs for the current deployment in batch. -> Done
     - Update the project status to current one if Deployed. -> Done
     - Update the project deploymentId to the current one if Deployed. -> Done
  5. Change status to deployed if deploying in redis. -> Done
  6. Delete the logs from the redis. -> Done
*/

import { subscriber } from "@repo/redis/subscriber";
import { keymanager } from "@repo/redis/managers";
import { prisma } from "@repo/db";
import { Log, Pusher_Event, Status } from "@repo/validation";
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
          const {
            id: projectId,
            buildId,
            status,
          }: Pusher_Event = JSON.parse(message.value?.toString() || "{}");

          const logsKey = keymanager.getLogsKey(projectId);
          const statusKey = keymanager.getStatusKey(projectId);

          const logs: Log[] = (await subscriber.lrange(logsKey, 0, -1)).map(
            (log) => JSON.parse(log),
          );

          await prisma.$transaction(async (tx) => {
            const deployment = await tx.deployment.create({
              data: {
                buildId,
                status,
                projectId,
              },
              select: {
                id: true,
              },
            });

            await tx.log.createMany({
              data: logs.map((log) => {
                return {
                  ...log,
                  deploymentId: deployment.id,
                };
              }),
            });

            if (status === Status.DEPLOYING) {
              await tx.project.update({
                where: {
                  id: projectId,
                },
                data: {
                  stableDeploymentId: buildId,
                  status,
                },
              });
            }
          });

          const multi = subscriber.multi();
          multi.del(logsKey);
          if (status === Status.DEPLOYING) {
            multi.set(statusKey, Status.DEPLOYED);
          }
          await multi.exec();
        },
      });
    } catch (error) {
      console.error("Error in pusher: ", (error as Error).message);
    }
  }
}

Pusher.start();
