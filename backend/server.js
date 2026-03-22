import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from "./config/db.js";
import nandaRoutes from "./routes/nanda.routes.js";
import nocRoutes from "./routes/noc.routes.js";
import nicRoutes from "./routes/nic.routes.js";
import diagnosisRoutes from "./routes/diagnosis.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import carePlanRoutes from './routes/careplan.routes.js';
import enfermeroRoutes from "./routes/enfermero.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json()); // solo una vez

connectDB();

app.use("/api/nanda",     nandaRoutes);
app.use("/api/noc",       nocRoutes);
app.use("/api/nic",       nicRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use('/api/patients',  patientRoutes);
app.use('/api/careplans', carePlanRoutes);
app.use('/api/enfermero', enfermeroRoutes);

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor puerto ${PORT}`));