import express from "express";
import CarePlan from "../models/CarePlan.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const nuevoPlan = new CarePlan(req.body);
    await nuevoPlan.save();
    res.status(201).json(nuevoPlan);
  } catch (error) {
    console.error("Error guardando plan:", error);
    res.status(500).json({ error: "Error al guardar el plan en la BD" });
  }
});

router.get("/", async (req, res) => {
  try {
    const planes = await CarePlan.find()
      .populate('pacienteId', 'nombre curp demograficos')
      .populate('ingresoId')
      .sort({ fecha: -1 });
    res.json(planes); // ← antes decía "planes" pero la variable era "plans"
  } catch (error) {
    res.status(500).json({ error: "Error al obtener planes" });
  }
});

router.get("/patient/:id", async (req, res) => {
  try {
    const planes = await CarePlan.find({ pacienteId: req.params.id })
      .populate('pacienteId', 'nombre curp demograficos')
      .populate('ingresoId') // ← faltaba este
      .sort({ fecha: -1 });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener planes" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const planActualizado = await CarePlan.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true }
    );
    res.json(planActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el plan" });
  }
});


export default router;