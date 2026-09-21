import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createOrganization } from "../controllers/organizationController";
import inviteRoutes from "./inviteRoutes";
import projectRoutes from "./projectRoutes";
const router = Router();

router.post("/", authMiddleware, createOrganization);
router.use("/:organizationId/invites", inviteRoutes);
router.use("/:organizationId/projects", projectRoutes);
export default router;
