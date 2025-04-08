import { subscriber } from "@repo/redis";
import { downloadProject, uploadFile } from "@repo/object-store";
import path from "path";
import { fileURLToPath } from "url"; 
import { buildProject } from "./worker.js";
import { listAllFiles } from "@repo/fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Add the logs to the Redis and update the project status.
// TODO: Clear the local project folder.

class DeployServer {

    public static async init() {
        // Connect to Redis
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
                console.log("Picked up from the build queue");

                // Get the slug
                const slug = await subscriber.hGet(`project:${projectId}`, "slug") as string;
                
                // Download the files from Object Store
                console.log("Downloading the files from Object Store ...");
                await downloadProject(`output/${slug}`, __dirname);
                console.log("Downnloaded the files from Object Store");

                // Build the project
                console.log("Building the project ...")
                const projectPath = path.join(__dirname, `output/${slug}`);
                await buildProject(projectPath);
                console.log("Build completed");

                // List all the files of the project build
                const buildPath = path.join(projectPath, "dist");
                const files = listAllFiles(buildPath);
                
                // Upload to Object Store
                console.log("Uploading the build files to Object Store ...");
                const promiseArray = files.map((file) => {
                    const filename = `dist/${slug}` + file.slice(buildPath.length);
                    return uploadFile(filename, file);
                });
                await Promise.all(promiseArray);
                console.log("Build files uploaded successfully");

                console.log("Project deployed successfully!");
            }
        }
    }
}

DeployServer.init();
