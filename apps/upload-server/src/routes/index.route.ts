import express from "express";
import { verifyToken } from "@repo/crypto/jwt";
import { GithubUrlSchema, Status } from "@repo/validation";
import { getNameFromRepo } from "../utils/github.js";
import { prisma } from "@repo/db";
import { fileURLToPath } from "url";
import path from "path";
import { simpleGit } from "simple-git";
import { generateSlug } from "../utils/slug.js";
import { publisher } from "@repo/redis";
import { listAllFiles } from "@repo/fs";
import { uploadFile } from "@repo/object-store";

const V1Router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Add more detailed logs.
V1Router.post("/deploy", async (req, res) => {
    try {
        // Check for Authentication
        const token = req.headers["authorization"];
        if (!token) {
            res.status(401).json({message: "No Token provided."});
            return;
        }
        let payload;
        try {
            payload = verifyToken(token);
        } catch (error) {
            console.error("Error in verifying token: ", error);
            res.status(401).json({ message: "Token expired." });
            return;
        }

        // Input Data Validation
        const validation = GithubUrlSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ message: "Invalid github repository." });
            return;
        }

        // Generate slug
        const { githubUrl } = validation.data;
        const { id } = payload;
        const repoName = getNameFromRepo(githubUrl);
        const slug = await generateSlug(repoName);

        // Create a Database Entry
        const project = await prisma.project.create({
            data: {
                name: repoName,
                userId: id,
                github_url: githubUrl,
                status: Status.CLONING,
                slug
            }
        });

        // Add the project in redis
        await publisher.hSet(`project:${project.id}`, {
            id: project.id,
            name: project.name,
            githubUrl: project.github_url,
            status: project.status,
            slug: project.slug,
            createdAt: `${project.createdAt}`,
        });

        // Add the log
        await publisher.lPush(`logs:${project.id}`, JSON.stringify({
            createdAt: new Date(),
            message: "Cloning the repository ..."
        }));

        // Sending the Response for polling
        res.json({ id: project.id });

        // Clone the repository
        const localpath = path.join(__dirname, `../output/${slug}`);
        await simpleGit().clone(githubUrl, localpath);

        // Update the status and add the log
        await publisher
            .multi()
            .hSet(`project:${project.id}`, "status", "cloned")
            .lPush(`logs:${project.id}`, JSON.stringify({
            createdAt: new Date(),
            message: "Repository cloned successfully."
        })).exec();

        // List all the files of the repository
        const files = listAllFiles(localpath);

        // Upload them to Object Store
        const promiseArray = files.map((file) => uploadFile(file.slice(__dirname.length - 6), file));
        await Promise.all(promiseArray);

        // Publish the event to redis
        await publisher.lPush("build-queue", project.id);

    } catch (error) {
        console.error("Error in deploying project: ", error)
        res.status(500).json({ message: "Internal server error." });
    }
});

export default V1Router;
