import express from "express";
import authRouter from "./auth.route.js";
import projectRouter from "./project.route.js";
import githubRouter from "./github.route.js";
import webhookRouter from "./webhook.route.js";

const V1Router = express.Router();

V1Router.use("/auth", authRouter);

V1Router.use("/github", githubRouter);

V1Router.use("/project", projectRouter);

V1Router.use("/webhook", webhookRouter);

export default V1Router;
