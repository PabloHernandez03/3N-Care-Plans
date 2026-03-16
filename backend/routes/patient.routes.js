import express from "express";
import Patient from "../models/Patient.js";

const router = express.Router();

// Obtener todos los pacientes
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo pacientes" });
  }
});

// Crear un nuevo paciente
router.post("/", async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el paciente" });
  }
});

// Ruta para actualizar un paciente existente
router.put("/:id", async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // Devuelve el documento ya actualizado
    );
    if (!updatedPatient) return res.status(404).json({ error: "Paciente no encontrado" });
    
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
});
export default router;