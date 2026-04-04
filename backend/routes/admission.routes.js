import express from "express";
import Admission from "../models/Admission.js";
import ClinicalRecord from '../models/ClinicalRecord.js';
import mongoose from "mongoose";

const router = express.Router();

// ── GET /stats/medicamentos ────────────────────────────────────────────────
router.get('/stats/medicamentos', async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    const result = await ClinicalRecord.aggregate([
      {
        $lookup: {
          from: "patients",
          localField: "pacienteId",
          foreignField: "_id",
          as: "patient"
        }
      },
      { $unwind: "$patient" },
      { $match: { "patient.ownerId": ownerId } }, // 🔥 FILTRO REAL

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

// ── GET /stats/reingresos ──────────────────────────────────────────────────
router.get('/stats/reingresos', async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    const result = await Admission.aggregate([
      { $match: { ownerId } }, // 🔥 FILTRO
      { $group: { _id: '$pacienteId', total: { $sum: 1 } } },
      { $group: {
          _id: null,
          unIngreso:    { $sum: { $cond: [{ $eq: ['$total', 1] }, 1, 0] } },
          dosIngresos:  { $sum: { $cond: [{ $eq: ['$total', 2] }, 1, 0] } },
          tresMas:      { $sum: { $cond: [{ $gte: ['$total', 3] }, 1, 0] } },
      }},
      { $project: { _id: 0, unIngreso: 1, dosIngresos: 1, tresMas: 1 } }
    ]);

    res.json(result[0] || { unIngreso: 0, dosIngresos: 0, tresMas: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo reingresos' });
  }
});

// ── GET /stats/estancia ────────────────────────────────────────────────────
router.get('/stats/estancia', async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    const result = await Admission.aggregate([
      { $match: { ownerId, 'egreso.fecha': { $exists: true }, 'ingreso.fecha': { $exists: true } } }, // 🔥
      { $project: {
          servicio: '$ingreso.servicio',
          dias: { $divide: [
              { $subtract: ['$egreso.fecha', '$ingreso.fecha'] },
              1000 * 60 * 60 * 24
          ]}
      }},
      { $match: { dias: { $gt: 0 } } },
      { $group: {
          _id: { $ifNull: ['$servicio', 'Sin servicio'] },
          promedio: { $avg: '$dias' },
          total:    { $sum: 1 }
      }},
      { $sort: { promedio: -1 } },
      { $limit: 8 },
      { $project: { name: '$_id', promedio: { $round: ['$promedio', 1] }, total: 1, _id: 0 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estancias' });
  }
});

// GET /diagnosticos — top diagnósticos más frecuentes
router.get('/diagnosticos', async (req, res) => {
    try {
        const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

        const result = await Admission.aggregate([
            { $match: { ownerId, 'ingreso.diagnosticoMedico': { $exists: true, $ne: '' } } }, // 🔥
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
// ── GET /tendencia — Fechas de todos los ingresos (para dashboard) ─────────
router.get("/tendencia", async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    const admissions = await Admission.find(
      { ownerId }, // 🔥 FILTRO REAL
      { "ingreso.fecha": 1, _id: 0 }
    );

    res.json(
      admissions
        .map(a => ({ fecha: a.ingreso?.fecha }))
        .filter(a => a.fecha)
    );

  } catch (error) {
    res.status(500).json({ error: "Error obteniendo tendencia" });
  }
});

// ── POST / — Nuevo ingreso para un paciente existente ──────────────────────
router.post("/", async (req, res) => {
  try {
    const { pacienteId, ingreso } = req.body;

    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);

    const newAdmission = await Admission.create({
      pacienteId,
      ingreso,
      ownerId
    });

    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar ingreso" });
  }
});

// ── GET /paciente/:id — Todos los ingresos de un paciente ─────────────────
router.get("/paciente/:id", async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.institucionId || req.enfermeroId);
    const admissions = await Admission.find({ pacienteId: req.params.id, ownerId })
      .sort({ "ingreso.fecha": -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo ingresos" });
  }
});

// ── PUT /:id/egreso — Dar de alta al paciente ─────────────────────────────
router.put("/:id/egreso", async (req, res) => {
  try {
    const updated = await Admission.findByIdAndUpdate(
      req.params.id,
      { egreso: req.body.egreso, estado: "Egresado" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Ingreso no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar egreso" });
  }
});

export default router;