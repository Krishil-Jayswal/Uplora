import { verifyToken } from "@repo/crypto/jwt";
import { Request, Response, NextFunction } from "express";

export const authMiddlware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"];
        if (!token) {
            res.status(401).json({ message: "No Token Provided." });
            return;
        }

        const payload = verifyToken(token);
        req.user = { id: payload.id, token};
        next();
    } catch (error) {
        res.status(401).json({ message: "Token Expired." });
        console.log("Error in auth middleware: ", error);
    }
}
