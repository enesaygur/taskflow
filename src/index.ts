import express from "express";
import homeRoutes from "./routes/homeRoutes";

const app = express();
const PORT = 3000;

app.get("/", homeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
