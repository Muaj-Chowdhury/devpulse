import config from "../config";
import jwt from "jsonwebtoken";
export const signToken = (payload) => {
    const accessToken = jwt.sign(payload, config.jwt_secret, {
        expiresIn: "1d",
    });
    const refreshToken = jwt.sign(payload, config.refresh_token_secret, {
        expiresIn: "15d",
    });
    return { accessToken, refreshToken };
};
export const verifyToken = (token, type) => {
    const secret = type === "access" ? config.jwt_secret : config.refresh_token_secret;
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
//# sourceMappingURL=signToken.js.map