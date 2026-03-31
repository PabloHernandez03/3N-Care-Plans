import express from "express";
import mongoose from "mongoose";
import Patient from "../models/Patient.js";
import ClinicalRecord from "../models/ClinicalRecord.js";
import Admission from "../models/Admission.js";
import CarePlan from "../models/CarePlan.js";

const router = express.Router();

// En patient.routes.js
router.get('/stats/expedientes', async (req, res) => {
    try {
        const records = await ClinicalRecord.find({});

        // Antecedentes
        const anteMap = {};
        records.forEach(r => {
            (r.antecedentes?.patologicos || []).forEach(a => {
                if (!a.startsWith('Otro:')) anteMap[a] = (anteMap[a] || 0) + 1;
            });
        });
        const antecedentes = Object.entries(anteMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        // Hábitos
        const tabMap  = { No: 0, Exfumador: 0, Sí: 0 };
        const alcMap  = { No: 0, Social: 0, Habitual: 0 };
        const dietMap = { Balanceada: 0, Deficiente: 0, Hipergrasas: 0 };
        records.forEach(r => {
            const h = r.habitos || {};
            if (h.tabaquismo  in tabMap)  tabMap[h.tabaquismo]++;
            if (h.alcoholismo in alcMap)  alcMap[h.alcoholismo]++;
            if (h.alimentacion in dietMap) dietMap[h.alimentacion]++;
        });

        res.json({ antecedentes, habitos: { tabaquismo: tabMap, alcoholismo: alcMap, alimentacion: dietMap } });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo estadísticas de expedientes' });
    }
});

// ── GET / — Todos los pacientes ────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo pacientes" });
  }
});

router.get("/with-admission", async (req, res) => {
  try {
    const patients = await Patient.find();

    // Una sola query para todos los últimos ingresos
    const ultimosIngresos = await Admission.aggregate([
      { $sort: { "ingreso.fecha": -1 } },
      { $group: { _id: "$pacienteId", ultimoIngreso: { $first: "$$ROOT" } } }
    ]);

    // Mapear por pacienteId para acceso O(1)
    const ingresoMap = Object.fromEntries(
      ultimosIngresos.map(u => [u._id.toString(), u.ultimoIngreso])
    );

    const result = patients.map(p => ({
      ...p.toJSON(),
      ultimoIngreso: ingresoMap[p._id.toString()] || null
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo pacientes" });
  }
});

// ── GET /:id — Un paciente con su expediente clínico ───────────────────────
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Paciente no encontrado" });

    // Traer expediente clínico e ingresos en paralelo
    const [clinicalRecord, admissions] = await Promise.all([
      ClinicalRecord.findOne({ pacienteId: req.params.id }),
      Admission.find({ pacienteId: req.params.id }).sort({ "ingreso.fecha": -1 })
    ]);

    res.json({ patient, clinicalRecord, admissions });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo paciente" });
  }
});

// ── POST / — Crear paciente + expediente clínico (transacción atómica) ─────
// Body esperado:
// {
//   nombre: { nombre, apellidoPaterno, apellidoMaterno },
//   curp,
//   demograficos: { fechaNacimiento, sexo, tipoSangre },
//   antecedentes: { ... },   ← van al ClinicalRecord
//   alergias: { ... },       ← van al ClinicalRecord
//   medicacionActual: [...], ← van al ClinicalRecord
//   habitos: { ... },        ← van al ClinicalRecord
//   redCuidados,             ← va al ClinicalRecord
//   ingreso: { ... }         ← opcional, crea Admission si viene
// }
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      nombre, curp, demograficos,           // → Patient
      antecedentes, alergias,               // → ClinicalRecord
      medicacionActual, habitos, redCuidados,
      ingreso                               // → Admission (opcional)
    } = req.body;

    // 1. Crear paciente
    const [savedPatient] = await Patient.create(
      [{ nombre, curp, demograficos }],
      { session }
    );

    // 2. Crear expediente clínico vinculado
    await ClinicalRecord.create(
      [{
        pacienteId: savedPatient._id,
        antecedentes,
        alergias,
        medicacionActual,
        habitos,
        redCuidados
      }],
      { session }
    );

    // 3. Crear ingreso si viene en el body
    let savedAdmission = null;
    if (ingreso) {
      [savedAdmission] = await Admission.create(
        [{ pacienteId: savedPatient._id, ingreso }],
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({
      patient: savedPatient,
      admission: savedAdmission ?? "Sin ingreso registrado"
    });

  } catch (error) {
    await session.abortTransaction();
    const esDuplicado = error.code === 11000;
    res.status(esDuplicado ? 409 : 500).json({
      error: esDuplicado ? "Ya existe un paciente con ese CURP" : "Error al crear el paciente"
    });
  } finally {
    session.endSession();
  }
});

// ── PUT /:id — Actualizar datos demográficos del paciente ──────────────────
router.put("/:id", async (req, res) => {
  try {
    const { nombre, curp, demograficos } = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { nombre, curp, demograficos },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) return res.status(404).json({ error: "Paciente no encontrado" });
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el paciente" });
  }
});

// ── PUT /:id/expediente — Actualizar expediente clínico ────────────────────
router.put("/:id/expediente", async (req, res) => {
  try {
    const updated = await ClinicalRecord.findOneAndUpdate(
      { pacienteId: req.params.id },
      { ...req.body, ultimaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Expediente no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el expediente" });
  }
});

router.delete("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    await Patient.findByIdAndDelete(id, { session });
    await ClinicalRecord.deleteMany({ pacienteId: id }, { session });
    await Admission.deleteMany({ pacienteId: id }, { session });
    await CarePlan.deleteMany({ pacienteId: id }, { session });
    
    await session.commitTransaction();
    res.json({ message: "Paciente y todos sus registros eliminados correctamente" });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: "Error al eliminar el paciente y sus registros" });
  } finally {
    session.endSession();
  }
});

export default router;