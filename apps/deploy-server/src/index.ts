import { subscriber } from "@repo/redis";
import { downloadFolder } from "@repo/object-store";
import path from "path";
import { fileURLToPath } from "url"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeployServer {

    public static async init() {
        await subscriber.connect();
        console.log("Redis connected successfully.");
        console.log("Deploy server started.");

        while (true) {
            // Pop the element from the build queue
            const build = await subscriber.brPop("build-queue", 0);
            if (build) {
                const projectId = build.element;
                console.log(projectId);
                // Get the slug from redis
                const slug = await subscriber.hGet(`project:${projectId}`, "slug") as string;
                console.log(slug);
                // Download the files for this slug from object store
                await downloadFolder(`output/${slug}`, __dirname);
            }
        }
    }
}

DeployServer.init();
