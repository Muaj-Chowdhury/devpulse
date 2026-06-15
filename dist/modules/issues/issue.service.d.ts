import type { IIssue, TGetIssuesQuery, TIssuePayload, TStitchedIssue, TUpdateIssuePayload } from "../../types";
declare class IssueService {
    createIssueIntoDB(payload: TIssuePayload): Promise<IIssue>;
    getAllIssuesFromDB(filters: TGetIssuesQuery): Promise<TStitchedIssue[]>;
    getSingleIssueFromDB(id: number): Promise<TStitchedIssue | null>;
    getIssueByIdFromDB(id: number): Promise<IIssue | null>;
    UpdateIssueInDB(id: Number, payload: TUpdateIssuePayload): Promise<IIssue | null>;
    deleteIssueFromDB(id: number): Promise<boolean>;
}
declare const _default: IssueService;
export default _default;
//# sourceMappingURL=issue.service.d.ts.map