import express from "express";
import Admission from "../models/Admission.js";
import ClinicalRecord from '../models/ClinicalRecord.js';
import Patient from '../models/Patient.js';
import CarePlan from '../models/CarePlan.js';
import mongoose from "mongoose";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

// ── Helper 1: Filtro directo ultra-rápido para Ingresos (Soporta datos viejos y nuevos) ──
const getDashboardFilter = (req) => {
    if (req.rol === 'superadmin') return {};
    
    const userId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    if (req.rol === 'jefe' && req.institucionId) {
        return { $or: [{ institucionId: userId }, { ownerId: userId }] };
    }
    
    // Si es enfermero, busca sus ingresos nuevos o los viejos (ownerId)
    return { $or: [{ registradoPor: userId }, { ownerId: userId }] };
};

// ── Helper 2: Obtener IDs de pacientes (Solo usado para Medicamentos) ────────────
async function getPacientesIds(req) {
    if (req.rol === 'superadmin') {
        const pacientes = await Patient.find({}).select('_id');
        return pacientes.map(p => p._id);
    }
    const userId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);
    
    // Filtro tolerante para pacientes viejos y nuevos
    const filtro = { $or: [{ ownerId: userId }, { enfermeroId: userId }, { institucionId: userId }] };
    const pacientes = await Patient.find(filtro).select('_id');
    return pacientes.map(p => p._id);
}


// ── GET /tendencia ────────────────────────────────────────────────────────
router.get("/tendencia", async (req, res) => {
    try {
        const filter = getDashboardFilter(req);
        const admissions = await Admission.find(filter, { "ingreso.fecha": 1, _id: 0 });
        
        res.json(admissions.map(a => ({ fecha: a.ingreso?.fecha })).filter(a => a.fecha));
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo tendencia" });
    }
});

// ── GET /diagnosticos ─────────────────────────────────────────────────────
router.get('/diagnosticos', async (req, res) => {
    try {
        const filter = getDashboardFilter(req);
        const result = await Admission.aggregate([
            // Filtramos directamente en Admission (mucho más rápido)
            { $match: { ...filter, 'ingreso.diagnosticoMedico': { $exists: true, $ne: '' } } },
            { $group: { _id: '$ingreso.diagnosticoMedico', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 8 },
            { $project: { name: '$_id', value: '$total', _id: 0 } }
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo diagnósticos' });
    }
});

// ── GET /stats/medicamentos ───────────────────────────────────────────────
router.get('/stats/medicamentos', async (req, res) => {
    try {
        // Medicamentos vive en ClinicalRecord, por lo que aquí sí necesitamos los IDs de los pacientes
        const ids = await getPacientesIds(req);
        const result = await ClinicalRecord.aggregate([
            { $match: { pacienteId: { $in: ids } } },
            { $unwind: '$medicacionActual' },
            { $match: {
                'medicacionActual.nombre': { $exists: true, $ne: '' },
                'medicacionActual.ninguna': { $ne: true }
            }},
            { $group: { _id: '$medicacionActual.nombre', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', value: '$total', _id: 0 } }
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo medicamentos' });
    }
});

// ── GET /stats/reingresos ─────────────────────────────────────────────────
router.get('/stats/reingresos', async (req, res) => {
    try {
        const filter = getDashboardFilter(req);
        const result = await Admission.aggregate([
            { $match: filter }, // Filtro directo
            { $group: { _id: '$pacienteId', total: { $sum: 1 } } },
            { $group: {
                _id: null,
                unIngreso:   { $sum: { $cond: [{ $eq: ['$total', 1] }, 1, 0] } },
                dosIngresos: { $sum: { $cond: [{ $eq: ['$total', 2] }, 1, 0] } },
                tresMas:     { $sum: { $cond: [{ $gte: ['$total', 3] }, 1, 0] } },
            }},
            { $project: { _id: 0, unIngreso: 1, dosIngresos: 1, tresMas: 1 } }
        ]);
        res.json(result[0] || { unIngreso: 0, dosIngresos: 0, tresMas: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo reingresos' });
    }
});

// ── GET /stats/estancia ───────────────────────────────────────────────────
// ── GET /stats/estancia ───────────────────────────────────────────────────
router.get('/stats/estancia', async (req, res) => {
    try {
        const filter = getDashboardFilter(req);
        const result = await Admission.aggregate([
            { $match: {
                ...filter, // Filtro directo
                'egreso.fecha': { $exists: true },
                'ingreso.fecha': { $exists: true }
            }},
            { $project: {
                servicio: '$ingreso.servicio',
                // Calculamos la diferencia real
                diasCalculados: { $divide: [
                    { $subtract: ['$egreso.fecha', '$ingreso.fecha'] },
                    1000 * 60 * 60 * 24
                ]}
            }},
            { $project: {
                servicio: 1,
                // 🟢 FIX: Si el paciente entró y salió el mismo día (0 días) o en menos de 24 hrs (< 1), lo contamos como 1 día de estancia.
                dias: { 
                    $cond: [ { $lt: ['$diasCalculados', 1] }, 1, '$diasCalculados' ] 
                }
            }},
            { $group: {
                _id: { $ifNull: ['$servicio', 'Sin servicio'] },
                promedio: { $avg: '$dias' },
                total: { $sum: 1 }
            }},
            { $sort: { promedio: -1 } },
            { $limit: 8 },
            { $project: { name: '$_id', promedio: { $round: ['$promedio', 1] }, total: 1, _id: 0 } }
        ]);
        res.json(result);
    } catch (error) {
        console.error("Error en estancia:", error);
        res.status(500).json({ error: 'Error obteniendo estancias' });
    }
});

// ── POST / ────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { pacienteId, ingreso } = req.body;
        const newAdmission = await Admission.create({
            pacienteId,
            ingreso,
            registradoPor: req.enfermeroId,
            institucionId: req.institucionId,
            ownerId: req.institucionId || req.enfermeroId // Mantenemos ownerId para evitar fallos futuros
        });
        res.status(201).json(newAdmission);
    } catch (error) {
        res.status(500).json({ error: "Error al registrar ingreso" });
    }
});

// ── GET /paciente/:id ─────────────────────────────────────────────────────
router.get("/paciente/:id", async (req, res) => {
    try {
        const filter = getDashboardFilter(req);
        const admissions = await Admission.find({
            pacienteId: req.params.id,
            ...filter // verifica acceso
        }).sort({ "ingreso.fecha": -1 });
        res.json(admissions);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo ingresos" });
    }
});

// ── PUT /:id/egreso ───────────────────────────────────────────────────────
router.put("/:id/egreso", async (req, res) => {
    try {
        // 1. Actualizamos el ingreso con los datos de salida
        const updated = await Admission.findByIdAndUpdate(
            req.params.id,
            { egreso: req.body.egreso, estado: "Egresado" },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Ingreso no encontrado" });

        await CarePlan.updateMany(
            { ingresoId: req.params.id, estado: "Activo" },
            { $set: { estado: "Finalizado" } }
        );

        res.json(updated);
    } catch (error) {
        console.error("Error en el egreso:", error);
        res.status(500).json({ error: "Error al registrar egreso" });
    }
});

export default router;