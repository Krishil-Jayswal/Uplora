import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import projectRouter from "./project.route.js";

const V1Router = express.Router();

V1Router.use("/auth", authRouter);

V1Router.use("/user", userRouter);

V1Router.use("/project", projectRouter);

export default V1Router;
