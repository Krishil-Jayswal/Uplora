import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { installMiddleware } from "../middlewares/install.middleware.js";
import {
  createProject,
  getProject,
  getProjects,
  getStatus,
} from "../controllers/project.controller.js";

const projectRouter = express.Router();

projectRouter.get("/", authMiddlware, getProjects);

projectRouter.get("/:projectId", authMiddlware, getProject);

projectRouter.get("/:projectId/status", authMiddlware, getStatus);

projectRouter.post("/", authMiddlware, installMiddleware, createProject);

export default projectRouter;
