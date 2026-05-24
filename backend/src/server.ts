import "dotenv/config";
import cors from "cors";
import express from "express";
import {pool} from "./db.js";


const app = express();

const port = Number(process.env.PORT) || 8080;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/db/health", async (_req, res) => {
  const result = await pool.query("select now() as now");

  res.json({
    database: "connected",
    now: result.rows[0].now
  });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
