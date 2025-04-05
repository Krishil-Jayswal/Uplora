import express from "express";
import authRouter from "./auth.route.js";

const V1Router = express.Router();

V1Router.use("/auth", authRouter);

export default V1Router;