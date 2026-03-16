import express from "express";
import CarePlan from "../models/CarePlan.js";

const router = express.Router();

// Recibir y guardar el plan
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

export default router;