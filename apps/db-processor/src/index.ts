import { subscriber, publisher } from "@repo/redis";
import { prisma } from "@repo/db";
import { Log, Project } from "@repo/validation";

class DBProcessor {
  public static async init() {
    // Connect to the Database
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

    // Connect to the Redis
    try {
      await Promise.all([publisher.connect(), subscriber.connect()]);
      console.log("Redis connected successfully.");
    } catch (error) {
      console.error("Error in connecting to Redis: ", (error as Error).message);
      process.exit(1);
    }

    while (true) {
      // Pop the element from the flush queue
      const flush = await subscriber.brPop("flush-queue", 0);

      // Get the projectId
      const projectId = flush?.element as string;

      // Get the logs and metadata and store in database
      try {
        const logs = await subscriber.lRange(`logs:${projectId}`, 0, -1);
        const project = (await subscriber.hGetAll(
          `project:${projectId}`,
        )) as unknown as Project;

        const parsedLogs = logs.map((log: string) => {
          const parsedLog = JSON.parse(log) as Log;
          return { ...parsedLog, projectId: projectId };
        });

        await prisma.$transaction([
          prisma.log.createMany({
            data: parsedLogs,
          }),
          prisma.project.update({
            where: {
              id: projectId,
            },
            data: {
              status: project.status,
            },
          }),
        ]);

        // Clear the data from the redis
        await subscriber.del(`logs:${projectId}`);
        await subscriber.del(`project:${projectId}`);
      } catch (error) {
        console.error(
          "Error in processing the event: ",
          (error as Error).message,
        );

        // Push the event back to the flush queue
        await publisher.lPush("flush-queue", projectId);
      }
    }
  }
}

DBProcessor.init();
