import type { Role } from "../types";
export type JWTPayload = {
    id: number;
    name: string;
    role: Role;
    email: string;
};
export declare const signToken: (payload: JWTPayload) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyToken: (token: string, type: "access" | "refresh") => JWTPayload | null;
//# sourceMappingURL=signToken.d.ts.map