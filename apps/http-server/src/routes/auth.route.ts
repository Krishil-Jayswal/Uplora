import express from "express";
import {
  githubCallback,
  githubAuth,
  me,
} from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.get("/github", githubAuth);

authRouter.get("/github/callback", githubCallback);

authRouter.get("/me", authMiddlware, me);

export default authRouter;
