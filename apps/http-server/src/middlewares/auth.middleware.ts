import { verifyToken } from "@repo/crypto/jwt";
import { prisma } from "@repo/db";
import { Request, Response, NextFunction } from "express";

export const authMiddlware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      res.status(401).json({ message: "No Token Provided." });
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      installation_id: user.installation_id,
      token,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token Expired." });
    console.log("Error in auth middleware: ", error);
  }
};
