import express from "express";
import { githubAuth, me } from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import callbackRouter from "./callback.route.js";

const authRouter = express.Router();

authRouter.get("/github", githubAuth);

authRouter.get("/me", authMiddlware, me);

authRouter.use("/callback", callbackRouter);

export default authRouter;
