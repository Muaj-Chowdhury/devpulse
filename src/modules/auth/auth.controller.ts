import type { NextFunction, Request, Response } from "express";
import authService from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { signToken } from "../../utils/signToken";
/*cimport type { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

const sendResponse = <T>(res: Response , data: TResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
        error: data.error
    })
}

export default sendResponse;*/

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.createUser({ name, email, password, role });
    if (!user) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "User registration failed",
      });
    }
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  // 1. Service returns the sanitized user object (which includes id, name, email, role)
  const user = await authService.validateUser(email, password);
  if (!user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Invalid email or password",
    });
  }
  // 2. Pass the specific fields required by JWTPayload
  const { accessToken: token, refreshToken } = signToken({
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  });
  // 3. Set cookie and send response
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "login successful",
    data: {
      token,
      user,
    },
  });
};
