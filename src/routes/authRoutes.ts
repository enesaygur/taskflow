import { Router } from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
  verifyEmail,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/verify-email", verifyEmail);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
