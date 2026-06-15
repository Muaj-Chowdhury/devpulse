import { AppError } from "../errors/AppError";
import config from "../config";
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "internal server error";
    res.status(statusCode).json({
        success: false,
        message,
        stack: config.node_env === 'development' ? err.stack : undefined
    });
};
export default globalErrorHandler;
//# sourceMappingURL=globalErrorHandler.js.map