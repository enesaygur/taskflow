import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { createLabel, listLabels } from "../controllers/labelController";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, requireRole(["OWNER", "ADMIN"]), createLabel);
router.get(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  listLabels,
);

export default router;
