import express from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/me", authMiddlware, me);

export default authRouter;
