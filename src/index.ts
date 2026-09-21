import express from "express";
import homeRoutes from "./routes/homeRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import organizationRoutes from "./routes/organizationRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import { acceptInvite } from "./controllers/inviteController";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.post("/invites/accept", authMiddleware, acceptInvite);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
