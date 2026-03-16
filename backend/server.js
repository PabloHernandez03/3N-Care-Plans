import express from "express";
import dotenv from "dotenv";
import cors from 'cors';

import connectDB from "./config/db.js";

import nandaRoutes from "./routes/nanda.routes.js";
import nocRoutes from "./routes/noc.routes.js";
import nicRoutes from "./routes/nic.routes.js";
import diagnosisRoutes from "./routes/diagnosis.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import carePlanRoutes from './routes/careplan.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use(express.json());

app.use("/api/nanda", nandaRoutes);
app.use("/api/noc", nocRoutes);
app.use("/api/nic", nicRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/careplans', carePlanRoutes);

app.listen(5000, () => {
  console.log("Servidor puerto 5000");
});

