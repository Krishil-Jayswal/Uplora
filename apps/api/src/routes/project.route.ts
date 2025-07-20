import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { installMiddleware } from "../middlewares/install.middleware.js";
import { deployProject } from "../controllers/project.controller.js";

const projectRouter = express.Router();

projectRouter.post("/deploy", authMiddlware, installMiddleware, deployProject);

export default projectRouter;
