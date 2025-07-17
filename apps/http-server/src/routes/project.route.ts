import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { configureProject } from "../controllers/project.controller.js";
import { installMiddleware } from "../middlewares/install.middleware.js";

const projectRouter = express.Router();

projectRouter.post(
  "/configure",
  authMiddlware,
  installMiddleware,
  configureProject,
);

export default projectRouter;
