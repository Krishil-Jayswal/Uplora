import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import {
  createProjectConfig,
  getLogs,
  getProject,
  getProjects,
  getStatus,
} from "../controllers/project.controller.js";
import { installMiddleware } from "../middlewares/install.middleware.js";

const projectRouter = express.Router();

projectRouter.get("/all", authMiddlware, getProjects);

projectRouter.get("/:projectId", authMiddlware, getProject);

projectRouter.get("/status/:projectId", authMiddlware, getStatus);

projectRouter.get("/logs/:projectId", authMiddlware, getLogs);

projectRouter.post(
  "/create-config",
  authMiddlware,
  installMiddleware,
  createProjectConfig,
);

export default projectRouter;
