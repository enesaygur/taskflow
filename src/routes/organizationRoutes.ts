import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createOrganization } from "../controllers/organizationController";

const router = Router();

router.post("/", authMiddleware, createOrganization);

export default router;
