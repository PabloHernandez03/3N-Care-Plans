import express from "express";
import VitalSigns from "../models/VitalSigns.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// Helper
const getOwnerId = (req) => req.institucionId || req.enfermeroId;


// ── POST / ─────────────────────────────
router.post("/", async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const newVS = await VitalSigns.create({
      ...req.body,
      ownerId,
      registradoPor: req.enfermeroId
    });

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
        // ERROR AQUÍ: Era VitalSigns (con s)
        const signoActualizado = await VitalSigns.findByIdAndUpdate(
            req.params.id,
            { 
                signos: req.body.signos, 
                observaciones: req.body.observaciones,
                // IMPORTANTE: Agregamos estos campos al esquema si quieres usarlos
                editado: true, 
                fechaEdicion: new Date()
            },
            { new: true }
        );
        
        if (!signoActualizado) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json(signoActualizado);
    } catch (error) {
        console.error("Error en PUT /vitalsigns:", error);
        res.status(500).json({ error: "Error al actualizar signos vitales" });
    }
});

export default router;