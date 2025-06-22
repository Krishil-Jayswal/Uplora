import crypto from "node:crypto";
export * from "./bcrypt/index.js";
export * from "./jwt/index.js";

export const getRandomBytes = () => {
  return crypto.randomBytes(16).toString("hex");
};
