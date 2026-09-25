import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  archiveTask,
  assignUser,
  createTask,
  listTasks,
  moveTask,
  unassignUser,
  updateTask,
} from "../controllers/taskController";
import {
  addLabelToTask,
  removeLabelFromTask,
} from "../controllers/labelController";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  createTask,
);
router.get(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  listTasks,
);
router.patch(
  "/:taskId/move",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  moveTask,
);

router.post(
  "/:taskId/assignees",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  assignUser,
);

router.delete(
  "/:taskId/assignees/:userId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  unassignUser,
);

router.post(
  "/:taskId/label",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  addLabelToTask,
);

router.delete(
  "/:taskId/labels/:labelId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  removeLabelFromTask,
);

router.put(
  "/:taskId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  updateTask,
);
router.delete(
  "/:taskId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  archiveTask,
);

export default router;
