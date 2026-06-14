import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import issueService from "./issue.service";
import sendResponse from "../../utils/sendResponse";
import type { TGetIssuesQuery } from "../../types";

export const createIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.id) {
      throw new AppError(401, "Authentication required to report issues.");
    }
    const { title, description, type } = req.body;
    const newIssue = await issueService.createIssueIntoDB({
      title,
      description,
      type,
      reporter_id: Number(req.user.id),
    });
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "issue created successfully",
      data: newIssue,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters: TGetIssuesQuery = {};

    // 1. Map type and status filters only if the client provides them
    if (req.query.type) {
      filters.type = req.query.type as TGetIssuesQuery["type"];
    }
    if (req.query.status) {
      filters.status = req.query.status as TGetIssuesQuery["status"];
    }

    // 2. Apply your specification default: if no sort value is sent, fall back to "newest"
    filters.sort = (req.query.sort as TGetIssuesQuery["sort"]) || "newest";

    const result = await issueService.getAllIssuesFromDB(filters);

    // return sendResponse(res, {
    //   statusCode: 200,
    //   success: true,
    //   message: "Issues retrieved successfully",
    //   data: result,
    // });
  } catch (error) {
    next(error);
  }
};
