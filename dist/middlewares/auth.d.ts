import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types";
export declare const auth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map