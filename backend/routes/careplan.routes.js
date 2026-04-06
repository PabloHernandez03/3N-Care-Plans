import express from "express";
import CarePlan from "../models/CarePlan.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware); // ← protege todas las rutas

// Helper igual que en patients
function filtroAcceso(req) {
    if (req.rol === 'superadmin') return {};
    if (req.rol === 'jefe')       return { institucionId: req.institucionId };
    return { enfermeroId: req.enfermeroId };
}

router.post("/", async (req, res) => {
    try {
        const nuevoPlan = new CarePlan({
            ...req.body,
            enfermeroId:   req.enfermeroId,   // ← quién lo creó
            institucionId: req.institucionId, // ← null si independiente
        });
        await nuevoPlan.save();
        res.status(201).json(nuevoPlan);
    } catch (error) {
        console.error("Error guardando plan:", error);
        res.status(500).json({ error: "Error al guardar el plan en la BD" });
    }
});

router.get("/", async (req, res) => {
    try {
        const planes = await CarePlan.find(filtroAcceso(req))
            .populate('pacienteId', 'nombre curp demograficos')
            .populate('ingresoId')
            .sort({ fecha: -1 });
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener planes" });
    }
});

router.get("/patient/:id", async (req, res) => {
    try {
        const planes = await CarePlan.find({
            pacienteId: req.params.id,
            ...filtroAcceso(req)
        })
            .populate('pacienteId', 'nombre curp demograficos')
            .populate('ingresoId')
            .sort({ fecha: -1 });
        res.json(planes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener planes" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const plan = await CarePlan.findOne({
            _id: req.params.id,
            ...filtroAcceso(req)
        });
        if (!plan) return res.status(404).json({ error: "Plan no encontrado" });

        // Si viene actualización de NOCs, preservar historial
        if (req.body.nocsEvaluados) {
            req.body.nocsEvaluados = req.body.nocsEvaluados.map(nocNuevo => {
                const nocAnterior = plan.nocsEvaluados.find(n => n.codigo === nocNuevo.codigo);
                if (!nocAnterior) return nocNuevo;

                // Solo agregar al historial si el promedio cambió
                const historialPrevio = nocAnterior.historial || [];
                const cambio = nocAnterior.promedio !== nocNuevo.promedio;

                return {
                    ...nocNuevo,
                    historial: cambio ? [
                        ...historialPrevio,
                        {
                            promedio:    nocAnterior.promedio,
                            indicadores: nocAnterior.indicadores,
                            fecha:       new Date()
                        }
                    ] : historialPrevio
                };
            });
        }

        const planActualizado = await CarePlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(planActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el plan" });
    }
});

export default router;