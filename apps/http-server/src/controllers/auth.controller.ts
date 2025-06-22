import { Request, Response } from "express";
import { Oauth_Type } from "@repo/validation";
import { prisma } from "@repo/db";
import { createToken, getRandomBytes } from "@repo/crypto";
import { env } from "@repo/env";
import { publisher, keymanager } from "@repo/redis";
import axios from "axios";
import { Octokit } from "@octokit/core";

export const githubAuth = async (req: Request, res: Response) => {
  try {
    const state = getRandomBytes();
    const satetKey = keymanager.getOauthStateKey(state);
    await publisher.setex(satetKey, 60 * 10, "YES");
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&scope=read:user%20user:email&state=${state}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in github auth: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      res.status(400).json({ message: "Missing query params." });
      return;
    }

    const statetKey = keymanager.getOauthStateKey(state.toString());
    const exists = await publisher.getdel(statetKey);

    if (!exists) {
      res.status(400).json({ message: "State not matched." });
      return;
    }

    const response = await axios.get(
      `https://github.com/login/oauth/access_token?client_id=${env.GITHUB_CLIENT_ID}&client_secret=${env.GITHUB_CLIENT_SECRET}&code=${code}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const octokit = new Octokit({
      auth: response.data.access_token,
    });

    const { data: profile } = await octokit.request("GET /user");
    const { data: emails } = await octokit.request("GET /user/emails");
    const primaryAndVerifiedEmails = emails.filter(
      (email) => email.primary && email.verified,
    );
    const email = primaryAndVerifiedEmails[0]!.email;

    let user = await prisma.user.findFirst({
      where: {
        oauth_id: profile.id.toString(),
        oauth_type: Oauth_Type.GITHUB,
      },
    });
    console.log(user);
    if (!user) {
      user = await prisma.user.create({
        data: {
          oauth_id: profile.id.toString(),
          oauth_type: Oauth_Type.GITHUB,
          name: profile.name || profile.login,
          email,
          avatar_url: profile.avatar_url,
        },
      });
    }

    const token = createToken({ id: user.id });

    res.redirect(`http://localhost:5173/callback?token=${token}`);
  } catch (error) {
    console.error("Error in github callback: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const payload = req.user!;
    const { id, token } = payload;
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });
    res.status(200).json({
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        token,
      },
    });
  } catch (error) {
    console.error("Error in getting user info: ", error);
    res.status(500).json({ messgae: "Internal server error." });
  }
};
