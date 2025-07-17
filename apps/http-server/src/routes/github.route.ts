import express from "express";
import {
  appInstallationHandler,
  installationCallbackHandler,
  getRepos,
} from "../controllers/github.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { installMiddleware } from "../middlewares/install.middleware.js";

const githubRouter = express.Router();

githubRouter.get("/install", authMiddlware, appInstallationHandler);

githubRouter.get("/callback", installationCallbackHandler);

githubRouter.get("/repos", authMiddlware, installMiddleware, getRepos);

export default githubRouter;
