import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { createProject, listProjects } from "../controllers/projectController";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN"]),
  createProject,
);

router.get(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  listProjects,
);

export default router;
