import express from "express";
import {
  githubAuth,
  githubAuthCallback,
  me,
} from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.get("/github", githubAuth);
authRouter.get("/callback/github", githubAuthCallback);
authRouter.get("/me", authMiddlware, me);

export default authRouter;
