import express from "express";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { getProjects, getStatus } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/projects", authMiddlware, getProjects);

userRouter.get("/status/:projectId", authMiddlware, getStatus);

export default userRouter;
