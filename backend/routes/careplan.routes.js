import express from "express";
import CarePlan from "../models/CarePlan.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware); // ← protege todas las rutas

// Helper igual que en patients
function filtroAcceso(req) {
    if (req.rol === 'superadmin') return {};

    if (req.institucionId) {
        return { institucionId: req.institucionId };
    }

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

// Agregar una nota de enfermería al plan
// ── AGREGAR NOTA ──────────────────────────────────────────────
router.post("/:id/notas", async (req, res) => {
    const { nota } = req.body;
    if (!nota) return res.status(400).json({ error: "La nota no puede estar vacía" });

    try {
        const plan = await CarePlan.findOneAndUpdate(
            { _id: req.params.id, ...filtroAcceso(req) },
            { 
                $push: { 
                    notasEnfermeria: {
                        nota,
                        enfermeroId: req.enfermeroId,
                        fecha: new Date()
                    } 
                } 
            },
            { new: true }
        ).populate('notasEnfermeria.enfermeroId', 'identidad');

        // 🔴 EMITIR POR SOCKET: Avisar a todos los que estén viendo este plan
        req.io.to(req.params.id).emit('nota_agregada', plan);

        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la nota" });
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

// ── ACTUALIZAR PLAN (Evaluaciones NOC) ─────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const plan = await CarePlan.findOne({ _id: req.params.id, ...filtroAcceso(req) });
        if (!plan) return res.status(404).json({ error: "Plan no encontrado" });

        // (Tu lógica de historial de NOCs se queda igual...)
        if (req.body.nocsEvaluados) {
            req.body.nocsEvaluados = req.body.nocsEvaluados.map(nocNuevo => {
                const nocAnterior = plan.nocsEvaluados.find(n => n.codigo === nocNuevo.codigo);
                if (!nocAnterior) return nocNuevo;

                const historialPrevio = nocAnterior.historial || [];
                const cambio = nocAnterior.promedio !== nocNuevo.promedio;

                return {
                    ...nocNuevo,
                    historial: cambio ? [
                        ...historialPrevio,
                        { promedio: nocAnterior.promedio, indicadores: nocAnterior.indicadores, fecha: new Date() }
                    ] : historialPrevio
                };
            });
        }

        const planActualizado = await CarePlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // 🔴 EMITIR POR SOCKET: Alguien actualizó una evaluación
        req.io.to(req.params.id).emit('plan_actualizado', planActualizado);

        res.json(planActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el plan" });
    }
});

router.patch("/:id/actividad", async (req, res) => {
    const { nicCodigo, descripcionActividad, realizado } = req.body;
    
    try {
        const plan = await CarePlan.findOne({ _id: req.params.id, ...filtroAcceso(req) });
        if (!plan) return res.status(404).json({ error: "Plan no encontrado" });

        const nicIndex = plan.nicsSeleccionados.findIndex(n => n.codigo === nicCodigo);
        if (nicIndex === -1) return res.status(404).json({ error: "NIC no encontrado en este plan" });

        const actividades = plan.nicsSeleccionados[nicIndex].actividades || [];
        const actIndex = actividades.findIndex(a => a.descripcion === descripcionActividad);

        if (actIndex > -1) {
            plan.nicsSeleccionados[nicIndex].actividades[actIndex].realizado = realizado;
            plan.nicsSeleccionados[nicIndex].actividades[actIndex].fechaRealizacion = realizado ? new Date() : null;
            plan.nicsSeleccionados[nicIndex].actividades[actIndex].enfermeroId = req.enfermeroId;
        } else {
            plan.nicsSeleccionados[nicIndex].actividades.push({
                descripcion: descripcionActividad,
                realizado: realizado,
                fechaRealizacion: realizado ? new Date() : null,
                enfermeroId: req.enfermeroId
            });
        }

        await plan.save();

        // 🔴 EMITIR POR SOCKET: Alguien marcó/desmarcó una actividad
        req.io.to(req.params.id).emit('actividad_modificada', plan);

        res.json(plan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar actividad" });
    }
});

export default router;