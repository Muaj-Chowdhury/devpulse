export const roles = ["contributor", "maintainer"] as const;

export type Role = typeof roles[number];

export interface IUser {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: Role;
    created_at: Date;
    updated_at: Date;
}

export type TUser = Omit<IUser, "id"|"password_hash" | "created_at" | "updated_at"> 

export type IssueType = "bug" | "feature-request";
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";

export interface IIssue {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
    reporter_id: number;
    created_at: Date;
    updated_at: Date;
}
// Data coming into the service requires the body fields + the extracted reporter ID
export type TIssuePayload = Omit<IIssue, "id" | "status" | "created_at" | "updated_at">
// 1. Structure the allowed query parameters
export type TGetIssuesQuery = {
  sort?: "newest" | "oldest" | undefined; 
  type?: IssueType | undefined;          
  status?: IssueStatus | undefined;     
};
//  The final response format requested by the API spec
export type TStitchedIssue = Omit<IIssue, "reporter_id"> & {
    reporter:{
        id: number,
        name:string,
        role:string
    }
}
// The fields a user is allowed to modify during a PATCH request
export type TUpdateIssuePayload = Partial<Pick<IIssue,"title"|"description"|"type">>

