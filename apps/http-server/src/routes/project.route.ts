import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import {
  getLogs,
  getProject,
  getProjects,
  getStatus,
} from "../controllers/project.controller.js";

const projectRouter = express.Router();

projectRouter.get("/all", authMiddlware, getProjects);

projectRouter.get("/:projectId", authMiddlware, getProject);

projectRouter.get("/status/:projectId", authMiddlware, getStatus);

projectRouter.get("/logs/:projectId", authMiddlware, getLogs);

export default projectRouter;
