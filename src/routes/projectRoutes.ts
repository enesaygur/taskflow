import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import taskRoutes from "./taskRoutes";
import labelRoutes from "./labelRoutes";
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
  "/:projectId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN"]),
  updateProject,
);

router.delete(
  "/:projectId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN"]),
  deleteProject,
);
router.use("/:projectId/tasks", taskRoutes);
router.use("/:projectId/labels", labelRoutes);

export default router;
