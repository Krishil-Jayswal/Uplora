import { Request, Response } from "express";
import { getRandomBytes } from "@repo/crypto";
import { publisher, keymanager } from "@repo/redis";
import { githubApp } from "../config/github.js";

export const githubAuth = async (req: Request, res: Response) => {
  try {
    const state = getRandomBytes();
    const satetKey = keymanager.getOauthStateKey(state);
    await publisher.setex(satetKey, 60 * 10, "YES");
    const { url } = githubApp.oauth.getWebFlowAuthorizationUrl({
      state,
      redirectUrl: "http://localhost:5000/api/v1/auth/callback/github",
    });
    res.redirect(url);
  } catch (error) {
    console.error("Error in github auth: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    res.status(200).json({
      user: {
        ...user,
        installation_id: user.installation_id ? "YES" : undefined,
      },
    });
  } catch (error) {
    console.error("Error in getting user info: ", error);
    res.status(500).json({ messgae: "Internal server error." });
  }
};
