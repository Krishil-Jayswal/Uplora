import { createToken } from "@repo/crypto";
import { prisma } from "@repo/db";
import { keymanager, publisher } from "@repo/redis";
import { GithubOAuthSchema, Oauth_Type } from "@repo/validation";
import { Request, Response } from "express";
import { githubApp } from "../config/github.js";
import { env } from "@repo/env";

export const githubHandler = async (req: Request, res: Response) => {
  try {
    const validation = GithubOAuthSchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({ message: "Missing query params." });
      return;
    }
    const { state, code } = validation.data;

    const statetKey = keymanager.getOauthStateKey(state);
    const exists = await publisher.getdel(statetKey);

    if (!exists) {
      res.status(400).json({ message: "State not matched." });
      return;
    }

    const octokit = await githubApp.oauth.getUserOctokit({ code });

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

    res.redirect(`${env.CLIENT_URL}/callback?token=${token}`);
  } catch (error) {
    console.error("Error in github auth callback: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
