import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../controllers/projectController";

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
router.put(
  "/:id",
  authMiddleware,
  requireRole(["OWNER", "ADMIN"]),
  updateProject,
);

router.delete("/:id", authMiddleware, requireRole(["OWNER", "ADMIN"]), deleteProject);
export default router;
