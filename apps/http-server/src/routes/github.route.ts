import express from "express";
import {
  appInstallationHandler,
  callbackHandler,
} from "../controllers/github.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const githubRouter = express.Router();

githubRouter.get("/install", authMiddlware, appInstallationHandler);

githubRouter.get("/callback", callbackHandler);

export default githubRouter;
