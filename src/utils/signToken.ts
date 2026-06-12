import config from "../config";
import type { Role } from "../types";
import jwt from "jsonwebtoken";

export type JWTPayload = {
  id: number;
  name: string;
  role: Role;
  email: string;
};

export const signToken = (payload: JWTPayload) => {
  const accessToken = jwt.sign(payload, config.jwt_secret as string, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(
    payload,
    config.refresh_token_secret as string,
    {
      expiresIn: "15d",
    },
  );
  return { accessToken, refreshToken };
};


export const verifyToken = (token: string, type: "access" | "refresh") => {
  const secret =
    type === "access" ? config.jwt_secret : config.refresh_token_secret;
  try {
    const decoded = jwt.verify(token, secret as string) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
