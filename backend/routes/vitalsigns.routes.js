import express from "express";
import VitalSigns from "../models/VitalSigns.js";
import CarePlan from "../models/CarePlan.js"; // 🔴 IMPORTANTE: Necesitamos el plan para saber a qué sala emitir
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Helper
const getOwnerId = (req) => req.institucionId || req.enfermeroId;

// 🔴 NUEVA FUNCIÓN HELPER PARA SOCKETS
const notificarSignos = async (req, pacienteId, ownerId) => {
    try {
        // 1. Buscamos el plan activo de este paciente (esa es nuestra "sala" de Socket)
        const planActivo = await CarePlan.findOne({ pacienteId, estado: 'Activo' });
        
        if (planActivo) {
            // 2. Traemos todos los signos ordenados (exactamente igual que tu GET)
            const signosActualizados = await VitalSigns.find({ pacienteId, ownerId }).sort({ fecha: -1 });
            
            // 3. Emitimos el arreglo completo a la sala del plan
            req.io.to(planActivo._id.toString()).emit('signos_actualizados', signosActualizados);
        }
    } catch (error) {
        console.error("Error al emitir signos por socket:", error);
    }
};

// ── POST / ─────────────────────────────
router.post("/", async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const newVS = await VitalSigns.create({
      ...req.body,
      ownerId,
      registradoPor: req.enfermeroId
    });

    // 🔴 AVISAR POR SOCKET (Creación)
    await notificarSignos(req, req.body.pacienteId, ownerId);

    res.status(201).json(newVS);
  } catch (error) {
    console.error("Error guardando signos vitales:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// ── GET /paciente/:id ─────────────────
router.get("/paciente/:id", async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const data = await VitalSigns.find({
      pacienteId: req.params.id,
      ownerId
    }).sort({ fecha: -1 });

    res.json(data);
  } catch {
    res.status(500).json({ error: "Error obteniendo signos vitales" });
  }
});

router.put("/:id", async (req, res) => {
    try {
        const signoActualizado = await VitalSigns.findByIdAndUpdate(
            req.params.id,
            { 
                signos: req.body.signos, 
                observaciones: req.body.observaciones,
                editado: true, 
                fechaEdicion: new Date()
            },
            { new: true }
        );
        
        if (!signoActualizado) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        // 🔴 AVISAR POR SOCKET (Edición)
        await notificarSignos(req, signoActualizado.pacienteId, getOwnerId(req));

        res.json(signoActualizado);
    } catch (error) {
        console.error("Error en PUT /vitalsigns:", error);
        res.status(500).json({ error: "Error al actualizar signos vitales" });
    }
});

export default router;