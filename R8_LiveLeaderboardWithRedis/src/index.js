import express from "express";
import leaderboardRouter from "./routes/leaderboard.routes.js";

const app = express();

app.use(express.json());

app.use("/api/leaderboard", leaderboardRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});