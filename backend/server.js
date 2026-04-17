import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔴 1. Importar los módulos necesarios para Socket.io
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from "./config/db.js";
import nandaRoutes from "./routes/nanda.routes.js";
import nocRoutes from "./routes/noc.routes.js";
import nicRoutes from "./routes/nic.routes.js";
import diagnosisRoutes from "./routes/diagnosis.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import carePlanRoutes from './routes/careplan.routes.js';
import enfermeroRoutes from "./routes/enfermero.routes.js";
import adminRoutes from "./routes/administrador.routes.js";
import admissionRoutes from './routes/admission.routes.js';
import dashboardConfigRoutes from './routes/dashboardConfig.routes.js';
import vitalSignsRoutes from './routes/vitalsigns.routes.js'
import jefeRoutes from "./routes/jefeEnfermeria.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// 🔴 2. Crear el servidor HTTP nativo y montar Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Ajusta esto a la URL de tu frontend en producción (ej. 'http://localhost:5173')
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }
});

// 🔴 3. Lógica de conexiones en tiempo real (Salas por Plan de Cuidado)
io.on('connection', (socket) => {
    console.log(`🟢 Usuario conectado al Socket: ${socket.id}`);

    // Cuando un usuario entra al detalle del plan
    socket.on('join_careplan_room', (planId) => {
        socket.join(planId);
        console.log(`Usuario ${socket.id} se unió a la sala del plan: ${planId}`);
    });

    // Cuando un usuario sale de la pantalla
    socket.on('leave_careplan_room', (planId) => {
        socket.leave(planId);
        console.log(`Usuario ${socket.id} abandonó la sala: ${planId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Usuario desconectado: ${socket.id}`);
    });
});

// 🔴 4. ¡Hacer 'io' accesible para todas las rutas!
// Esto permite que dentro de tus rutas (ej. guardando signos) puedas emitir eventos.
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(cors());
app.use(express.json()); 

connectDB();

// Tus rutas...
app.use("/api/nanda",     nandaRoutes);
app.use("/api/noc",       nocRoutes);
app.use("/api/nic",       nicRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use('/api/patients',  patientRoutes);
app.use('/api/careplans', carePlanRoutes);
app.use('/api/enfermero', enfermeroRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/dashboard-config', dashboardConfigRoutes);
app.use('/api/vitalsigns', vitalSignsRoutes);
app.use('/api/jefe', jefeRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

// 🔴 5. CAMBIO CLAVE: Usar 'httpServer.listen' en lugar de 'app.listen'
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor y WebSockets corriendo en el puerto ${PORT}`);
});