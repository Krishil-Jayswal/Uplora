import { Request, Response } from "express";
import { publisher } from "@repo/redis/publisher";
import { keymanager } from "@repo/redis/managers";
import { githubApp } from "../config/github.js";
import { randomBytes } from "node:crypto";
import { Oauth_Type, OAuthCallbackSchema } from "@repo/validation";
import { env } from "@repo/env";
import { prisma } from "@repo/db";
import { createToken } from "@repo/jwt";

export const githubAuth = async (req: Request, res: Response) => {
  try {
    const state = randomBytes(16).toString("hex");
    const satetKey = keymanager.getOauthStateKey(state);
    await publisher.setex(satetKey, 60 * 10, "YES");
    const { url } = githubApp.oauth.getWebFlowAuthorizationUrl({
      state,
      redirectUrl: `${env.BASE_REDIRECT_URL}/github`,
    });
    res.redirect(url);
  } catch (error) {
    console.error("Error in github auth: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const githubAuthCallback = async (req: Request, res: Response) => {
  try {
    const validation = OAuthCallbackSchema.safeParse(req.query);
    if (!validation.success) {
      res.redirect(`${env.CLIENT_URL}/callback`);
      return;
    }
    const { state, code } = validation.data;

    const statetKey = keymanager.getOauthStateKey(state);
    const exists = await publisher.getdel(statetKey);

    if (!exists) {
      res.redirect(`${env.CLIENT_URL}/callback`);
      return;
    }

    const octokit = await githubApp.oauth.getUserOctokit({ code });

    const { data: profile } = await octokit.request("GET /user");
    const { data: emails } = await octokit.request("GET /user/emails");
    const primaryAndVerifiedEmails = emails.filter(
      (email) => email.primary && email.verified,
    );
    const email = primaryAndVerifiedEmails[0]!.email;

    const user = await prisma.user.upsert({
      where: {
        oauthType_oauthId: {
          oauthType: Oauth_Type.GITHUB,
          oauthId: profile.id.toString(),
        },
      },
      create: {
        name: profile.name!,
        email,
        avatarUrl: profile.avatar_url,
        oauthType: Oauth_Type.GITHUB,
        oauthId: profile.id.toString(),
      },
      update: {},
    });

    const token = createToken({ id: user.id });

    res.redirect(`${env.CLIENT_URL}/callback?token=${token}`);
  } catch (error) {
    console.error("Error in github auth callback: ", (error as Error).message);
    res.redirect(`${env.CLIENT_URL}/callback`);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    res.status(200).json({
      user: {
        ...user,
        installation: user.installationId ? true : false,
      },
    });
  } catch (error) {
    console.error("Error in getting user info: ", (error as Error).message);
    res.status(500).json({ messgae: "Internal server error." });
  }
};
