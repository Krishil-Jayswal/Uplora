import { subscriber } from "@repo/redis";
import { downloadProject } from "@repo/object-store";
import path from "path";
import { fileURLToPath } from "url"; 
import { buildProject } from "./worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeployServer {

    public static async init() {
        try {
            await subscriber.connect();
            console.log("Redis connected successfully.");
            console.log("Deploy server started.");   
        } catch (error) {
            console.error("Error in connecting to redis: ", error);
            process.exit(1);
        }

        while (true) {
            // Pop the element from the build queue
            const build = await subscriber.brPop("build-queue", 0);
            if (build) {
                // Get the projectId
                const projectId = build.element;
                console.log(projectId);
                
                // Get the slug
                const slug = await subscriber.hGet(`project:${projectId}`, "slug") as string;
                console.log(slug);
                
                // Download the files for this slug from object store
                await downloadProject(`output/${slug}`, __dirname);
                
                // Build the project
                const projectPath = path.join(__dirname, `output/${slug}`);
                await buildProject(projectPath);

                console.log("Build completed.");
            }
        }
    }
}

DeployServer.init();
