import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import {
  createDeployment,
  getDeployment,
  getDeployments,
} from "../controllers/deployment.controller.js";
import { installMiddleware } from "../middlewares/install.middleware.js";

const deploymentRouter = express.Router();

deploymentRouter.get("/", authMiddlware, getDeployments);

deploymentRouter.get("/:deploymentId", authMiddlware, getDeployment);

deploymentRouter.post("/", authMiddlware, installMiddleware, createDeployment);

export default deploymentRouter;
