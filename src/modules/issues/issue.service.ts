import { sql } from "../../db";
import type { IIssue, TIssuePayload } from "../../types";

class IssueService {
  async createIssueIntoDB(payload: TIssuePayload): Promise<IIssue> {
    const {title, description , type, reporter_id} = payload;
    const result = await sql`
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES (${title}, ${description}, ${type}, ${reporter_id})
      RETURNING id, title, description, type , status, reporter_id, created_at, updated_at
      `
      return result[0] as IIssue;
  }
}

export default new IssueService();
