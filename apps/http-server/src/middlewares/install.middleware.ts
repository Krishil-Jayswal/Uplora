import { NextFunction, Request, Response } from "express";

export const installMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { installation_id } = req.user!;
    if (!installation_id) {
      res.status(200).json({ message: "Connect github to continue." });
      return;
    }
    next();
  } catch (error) {
    console.error("Error in install middleware: ", (error as Error).message);
    res.status(500).json({ message: "Internal server error." });
  }
};
