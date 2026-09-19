import { Router } from "express";
import {
  login,
  logout,
  refresh,
  register,
  verifyEmail,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/verify-email", verifyEmail);
router.post("/logout", logout);

export default router;
