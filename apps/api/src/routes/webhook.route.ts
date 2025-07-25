import express from "express";
import { githubWebhookHandler } from "../controllers/webhook.controller.js";

const webhookRouter = express.Router();

webhookRouter.post("/github", githubWebhookHandler);

export default webhookRouter;
