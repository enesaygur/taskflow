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
const app = express();
const PORT = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
