import type { IUser } from ".";


declare global {
  namespace Express {
    interface Request {
      // Use standard type intersections to hard-lock the format
      user?: Omit<IUser, "password_hash">;
      cookies?: Record<string, string>;
    }
  }
}

export {};
