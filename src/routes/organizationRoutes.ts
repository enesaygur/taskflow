import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createOrganization } from "../controllers/organizationController";
import inviteRoutes from "./inviteRoutes";
const router = Router();

router.post("/", authMiddleware, createOrganization);
router.use("/:organizationId/invites", inviteRoutes);
export default router;
