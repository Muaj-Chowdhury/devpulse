import { sql } from "../../db";
class IssueService {
    async createIssueIntoDB(payload) {
        const { title, description, type, reporter_id } = payload;
        const result = await sql `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES (${title}, ${description}, ${type}, ${reporter_id})
      RETURNING id, title, description, type , status, reporter_id, created_at, updated_at
      `;
        return result[0];
    }
    async getAllIssuesFromDB(filters) {
        const { type, status, sort = "newest" } = filters;
        let query = sql `
    SELECT id , title , description, type , status, reporter_id, created_at, updated_at FROM issues WHERE 1=1`;
        if (type) {
            query = sql `${query} AND type = ${type}`;
        }
        if (status) {
            query = sql `${query} AND status = ${status}`;
        }
        if (sort === "oldest") {
            query = sql `${query} ORDER BY created_at ASC`;
        }
        else {
            query = sql `${query} ORDER BY created_at DESC`;
        }
        const issues = (await query);
        if (issues.length === 0)
            return [];
        // 3. Collect UNIQUE reporter IDs to optimize our batch search array
        const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));
        console.log(reporterIds);
        // 4. Batch-fetch reporters using the WHERE id IN (...) strategy
        const reporters = (await sql `
    SELECT id , name ,role FROM users WHERE id = ANY(${reporterIds})`);
        // 5. Map reporters to an object/dictionary for quick O(1) lookups during assembly
        const reportersMap = reporters.reduce((acc, reporter) => {
            acc[reporter.id] = reporter;
            return acc;
        }, {});
        // 6. Stitch the data together exactly as the spec demands
        const stitchedIssues = issues.map((issue) => {
            const { reporter_id, ...issueData } = issue;
            return {
                ...issueData,
                reporter: reportersMap[reporter_id] || {
                    id: reporter_id,
                    name: "Unknown User",
                    role: "contributor",
                },
            };
        });
        return stitchedIssues;
    }
    async getSingleIssueFromDB(id) {
        const IssueResult = await sql `
    SELECT id , title , description,type, status,reporter_id ,created_at , updated_at
    FROM issues
    WHERE id = ${id}`;
        if (!IssueResult || IssueResult.length === 0) {
            return null;
        }
        const issue = IssueResult[0];
        const reporterResult = await sql `
    SELECT id , name , role
    FROM users
    WHERE id = ${issue.reporter_id}`;
        const { reporter_id, ...issueData } = issue;
        return {
            ...issueData,
            reporter: reporterResult.length
                ? reporterResult[0]
                : {
                    id: reporter_id,
                    name: "Unknown user",
                    role: "contributor",
                },
        };
    }
    async getIssueByIdFromDB(id) {
        const result = await sql `
      SELECT id, title, description, type, status, reporter_id, created_at, updated_at
      FROM issues
      WHERE id = ${id}
    `;
        return result.length === 0 ? null : result[0];
    }
    async UpdateIssueInDB(id, payload) {
        const { title, description, type } = payload;
        const result = await sql `
    UPDATE issues
    SET
    title = COALESCE(${title} , title),
    description = COALESCE(${description} , description),
    type = COALESCE(${type}, type),
    updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
        return result.length === 0 ? null : result[0];
    }
    async deleteIssueFromDB(id) {
        const result = await sql `
      DELETE FROM issues WHERE id = ${id}
      RETURNING id;
    `;
        // Returns true if a row was affected/deleted
        return result.length > 0;
    }
}
export default new IssueService();
//# sourceMappingURL=issue.service.js.map