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
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
  createOrganization,
);
router.get(
  "/",
  authMiddleware,
  requireRole(["OWNER", "ADMIN", "MEMBER"]),
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
