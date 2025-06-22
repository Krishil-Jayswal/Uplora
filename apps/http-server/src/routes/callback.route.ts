import express from "express";
import { githubHandler } from "../controllers/callback.controller.js";

const callbackRouter = express.Router();

callbackRouter.get("/github", githubHandler);

export default callbackRouter;
