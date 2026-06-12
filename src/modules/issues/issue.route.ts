import { Router } from "express";
import { auth, authorizeRoles,  } from "../../middlewares/auth"; // Adjust to your auth path
import { createIssue } from "./issue.controller";

const router = Router();

// Secure the route: Only logged in 'contributor' or 'maintainer' roles can pass
router.post(
  "/",
  auth,
  authorizeRoles("contributor", "maintainer"),
  createIssue
);

export const issueRoutes = router;