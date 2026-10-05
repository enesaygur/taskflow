import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createOrganization,
  listMembers,
  listMyOrganizations,
} from "../controllers/organizationController";
import inviteRoutes from "./inviteRoutes";
import projectRoutes from "./projectRoutes";
import billingRoutes from "./billingRoutes";
const router = Router();

router.post("/", authMiddleware, createOrganization);
router.get("/", authMiddleware, listMyOrganizations);
router.get("/:organizationId/members", authMiddleware, listMembers);
router.use("/:organizationId/invites", inviteRoutes);
router.use("/:organizationId/projects", projectRoutes);
router.use("/:organizationId/billing", billingRoutes);
export default router;
