import { Router } from "express";
import { createInvite } from "../controllers/inviteController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router({ mergeParams: true });
router.post("/", authMiddleware, requireRole(["OWNER", "ADMIN"]), createInvite);

export default router;
