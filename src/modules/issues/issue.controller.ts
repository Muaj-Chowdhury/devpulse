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

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const issueId = Number(req.params.id);
    if (isNaN(issueId)) {
      throw new AppError(400, "Invalid issue ID format.");
    }
    const result = await issueService.getSingleIssueFromDB(issueId);
    if (!result) {
      throw new AppError(404, "Issue not found.");
    }
    return sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Issue retrieved successfully",
        data: result,
    })
  } catch (error) {
    next(error);
  }
  
};

export const updateIssue =async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const issueId = Number(req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if(!userId || !userRole){
        throw new AppError(401, "Authentication required")
    }

    const issue = await issueService.getIssueByIdFromDB(issueId)
    if(!issue){
        throw new AppError(404, "Issue not found")
    }
    const isMaintainer = userRole === "maintainer";
    const isOwner = issue.reporter_id === userId;
    const isStatusOpen = issue.status === "open";

    const hasPermission = isMaintainer || (isOwner && isStatusOpen);

    if (!hasPermission) {
      throw new AppError(403, "Forbidden - you do not have permission to modify this issue.");
    }

    const updatedIssue = await issueService.UpdateIssueInDB(issueId, req.body);
    return sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Issue updated successfully",
        data: updatedIssue,
    })
  } catch (error) {
    next(error);
  }

  
};

export const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const issueId = Number(req.params.id);

    const isDeleted = await issueService.deleteIssueFromDB(issueId);
    if (!isDeleted) {
      throw new AppError(404, "Issue not found or already removed.");
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


