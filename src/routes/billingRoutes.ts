import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  createCheckoutSession,
  createPortalSession,
} from "../controllers/billingController";

const router = Router({ mergeParams: true });

router.post(
  "/checkout",
  authMiddleware,
  requireRole(["OWNER"]),
  createCheckoutSession,
);
router.post(
  "/portal",
  authMiddleware,
  requireRole(["OWNER"]),
  createPortalSession,
);

export default router;
