import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import nandaRoutes from "./routes/nanda.routes.js";
import nocRoutes from "./routes/noc.routes.js";
import diagnosisRoutes from "./routes/diagnosis.routes.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use("/api/nanda", nandaRoutes);
app.use("/api/noc", nocRoutes);
app.use("/api/diagnosis", diagnosisRoutes);

app.listen(5000, () => {
  console.log("Servidor puerto 5000");
});