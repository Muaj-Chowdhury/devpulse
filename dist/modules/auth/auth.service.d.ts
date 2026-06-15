import type { IUser, TUser } from "../../types";
declare class AuthService {
    private hashPassword;
    createUser(user: TUser & {
        password: string;
    }): Promise<Record<string, any> | undefined>;
    validateUser(email: string, password: string): Promise<Omit<IUser, 'password_hash'> | null>;
    getUserById(userId: number): Promise<Omit<IUser, 'password_hash'> | null>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map