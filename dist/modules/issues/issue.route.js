import { Router } from "express";
import { auth, authorizeRoles, } from "../../middlewares/auth"; // Adjust to your auth path
import { createIssue, deleteIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.controller";
const router = Router();
// Secure the route: Only logged in 'contributor' or 'maintainer' roles can pass
router.post("/", auth, authorizeRoles("contributor", "maintainer"), createIssue);
router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);
// PATCH: Broad gatekeeper role verification, complex ownership validation resolved inside
router.patch("/:id", auth, authorizeRoles("maintainer", "contributor"), updateIssue);
// DELETE: Explicit strict role routing gatekeeper
router.delete("/:id", auth, authorizeRoles("maintainer"), deleteIssue);
export const issueRoutes = router;
//# sourceMappingURL=issue.route.js.map