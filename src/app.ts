import express from "express";
import homeRoutes from "./routes/homeRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import organizationRoutes from "./routes/organizationRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import { acceptInvite } from "./controllers/inviteController";
import cookieParser from "cookie-parser";
import cors from "cors";
import { handleStripeWebhook } from "./controllers/billingController";
import { FRONTEND_URL } from "./config/env";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);
app.use(express.json());
app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.post("/invites/accept", authMiddleware, acceptInvite);

app.use(errorHandler);

export default app;
