import { sql } from "../../db";
import type { IIssue, TGetIssuesQuery, TIssuePayload, TStitchedIssue } from "../../types";

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
  async getAllIssuesFromDB(filters: TGetIssuesQuery): Promise<TStitchedIssue[]>{
    const {type, status, sort = "newest"} = filters;
    let query = sql`
    SELECT id , title , description, type , status, reporter_id, created_at, updated_at FROM issues WHERE 1=1`;
    if (type) {
      query = sql`${query} AND type = ${type}`;
    }
    if(status){
        query = sql`${query} AND status = ${status}`
    }
    if(sort === "oldest"){
        query = sql`${query} ORDER BY created_at ASC`
    }else{
        query = sql`${query} ORDER BY created_at DESC`
    }
    const issues = (await query) as IIssue[];
    if(issues.length === 0 ) return []

    const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)))
    console.log(reporterIds)
    const reporters =  await sql`
    SELECT id , name ,role FROM users WHERE id IN (${reporterIds})` as Array<{id: number, name: string , role: string}>

  const reportersMap = reporters.reduce((acc , reporter)=>{
    acc[reporter.id] = reporter;
    return acc
  } , {} as Record<number ,typeof reporters[0]>)

  const stitchedIssues : TStitchedIssue[] = issues.map(issue => {
    const {reporter_id , issueData}
  }) 
  }
  
}

export default new IssueService();
