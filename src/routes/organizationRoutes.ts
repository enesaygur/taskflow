import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createOrganization,
  getOrganization,
  listMembers,
  listMyOrganizations,
} from "../controllers/organizationController";
import inviteRoutes from "./inviteRoutes";
import projectRoutes from "./projectRoutes";
import billingRoutes from "./billingRoutes";
import { requireRole } from "../middleware/roleMiddleware";
const router = Router();

router.post(
  "/",
  authMiddleware,
  createOrganization,
);
router.get(
  "/",
  authMiddleware,
  listMyOrganizations,
);
router.get(
  "/:organizationId",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  getOrganization,
);
router.get("/:organizationId/members", authMiddleware,requireRole(["OWNER", "ADMIN", "MEMBER"]), listMembers);
router.use("/:organizationId/invites", inviteRoutes);
router.use("/:organizationId/projects", projectRoutes);
router.use("/:organizationId/billing", billingRoutes);
export default router;
