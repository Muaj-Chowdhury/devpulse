import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import issueService from "./issue.service";
import sendResponse from "../../utils/sendResponse";

export const createIssue = async (req: Request , res: Response, next: NextFunction) => {
    try {
        if(!req.user?.id){
            throw new AppError(401, "Authentication required to report issues.")
        }
        const {title, description, type}= req.body;
        const newIssue = await issueService.createIssueIntoDB({
            title,
            description,
            type,
            reporter_id: Number(req.user.id)
        })
        return sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "issue created successfully",
            data: newIssue
        })
    }
    catch(error){
        next(error)
    }
}