import express from "express";
import Admission from "../models/Admission.js";

const router = express.Router();

// ── POST / — Nuevo ingreso para un paciente existente ──────────────────────
router.post("/", async (req, res) => {
  try {
    const { pacienteId, ingreso } = req.body;
    const newAdmission = await Admission.create({ pacienteId, ingreso });
    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar ingreso" });
  }
});

// ── GET /paciente/:id — Todos los ingresos de un paciente ─────────────────
router.get("/paciente/:id", async (req, res) => {
  try {
    const admissions = await Admission.find({ pacienteId: req.params.id })
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