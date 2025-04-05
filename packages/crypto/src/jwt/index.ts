import jwt from "jsonwebtoken";
import { env } from "@repo/env";

const JWT_SECRET = env.JWT_SECRET;
const MAX_AGE = parseInt(env.MAX_AGE, 10);

type JwtPayload = {
  id: string;
};

export const createToken = (payload: JwtPayload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: MAX_AGE });
    return token;
  } catch (error) {
    console.error("Error in creating Token: ", error);
    throw error;
  }
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    console.error("Error in verifying Token: ", error);
    throw error;
  }
};
