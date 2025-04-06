import express from "express";
import { verifyToken } from "@repo/crypto/jwt";
import { GithubUrlSchema, Status } from "@repo/validation";
import { getNameFromRepo } from "../utils/github.js";
import { prisma } from "@repo/db";
import { fileURLToPath } from "url";
import path from "path";
import { simpleGit } from "simple-git";

const V1Router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            res.status(400).json({ message: "Invalid data format." });
            return;
        }

        // Create a Database Entry
        const { githubUrl } = validation.data;
        const { id } = payload;
        const repoName = getNameFromRepo(githubUrl);
        const project = await prisma.project.create({
            data: {
                name: repoName,
                userId: id,
                github_url: githubUrl,
                status: Status.CLONING,
            }
        });

        // Sending the Response for polling
        res.json({ project: {
            id: project.id,
            name: project.name,
            githubUrl: project.github_url,
            status: project.status,
        } });

        // Clone the repository
        const localpath = path.join(__dirname, `../output/${repoName}-${project.id}`);
        simpleGit().clone(githubUrl, localpath);

        // Upload to Object Store
        
        
    } catch (error) {
        console.error("Error in deploying project: ", error)
        res.status(500).json({ message: "Internal server error." });
    }
});

export default V1Router;
