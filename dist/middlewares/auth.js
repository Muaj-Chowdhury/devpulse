import sendResponse from "../utils/sendResponse";
import { verifyToken } from "../utils/signToken";
import authService from "../modules/auth/auth.service";
export const auth = async (req, res, next) => {
    // 1. Check if the token exists
    // 2. Verify the token
    // 3. Find the user into database
    try {
        const token = req.headers.authorization;
        if (!token) {
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized"
            });
        }
        const payload = verifyToken(token, "access");
        if (!payload) {
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Invalid token"
            });
        }
        const user = await authService.getUserById(payload.id);
        if (!user) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found"
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Unauthorized",
            });
        }
        if (!roles.includes(req.user.role)) {
            return sendResponse(res, {
                statusCode: 403,
                success: false,
                message: "Forbidden Access",
            });
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map