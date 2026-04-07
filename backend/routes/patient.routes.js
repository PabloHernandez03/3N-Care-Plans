import express from "express";
import mongoose from "mongoose";
import Patient from "../models/Patient.js";
import ClinicalRecord from "../models/ClinicalRecord.js";
import Admission from "../models/Admission.js";
import CarePlan from "../models/CarePlan.js";
import authMiddleware from "../middleware/auth.js"; // ← nuevo

const router = express.Router();

// Proteger todas las rutas
router.use(authMiddleware);

// ── Helper: construir filtro según rol ────────────────────────────────────
function filtroAcceso(req) {
    if (req.rol === 'superadmin') return {};

    const ownerId = req.institucionId || req.enfermeroId;
    return { ownerId };
}

// ── GET / ─────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        let filtro = filtroAcceso(req);
        // Jefe puede filtrar por enfermero específico
        if (req.query.enfermeroId && (req.rol === 'jefe' || req.rol === 'superadmin')) {
            filtro = { ...filtro, enfermeroId: req.query.enfermeroId };
        }
        const patients = await Patient.find(filtro);
        res.json(patients);
    } catch {
        res.status(500).json({ error: "Error obteniendo pacientes" });
    }
});

// ── GET /with-admission ───────────────────────────────────────────────────
router.get("/with-admission", async (req, res) => {
    try {
        const patients = await Patient.find(filtroAcceso(req));

        const ultimosIngresos = await Admission.aggregate([
            { $sort: { "ingreso.fecha": -1 } },
            { $group: { _id: "$pacienteId", ultimoIngreso: { $first: "$$ROOT" } } }
        ]);

        const ingresoMap = Object.fromEntries(
            ultimosIngresos.map(u => [u._id.toString(), u.ultimoIngreso])
        );

        const result = patients.map(p => ({
            ...p.toJSON(),
            ultimoIngreso: ingresoMap[p._id.toString()] || null
        }));

        res.json(result);
    } catch {
        res.status(500).json({ error: "Error obteniendo pacientes" });
    }
});

// ── GET /:id ──────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        // Verificar que el paciente pertenece al enfermero/institución
        const patient = await Patient.findOne({
            _id: req.params.id,
            ...filtroAcceso(req)
        });
        if (!patient) return res.status(404).json({ error: "Paciente no encontrado" });

        const [clinicalRecord, admissions] = await Promise.all([
            ClinicalRecord.findOne({ pacienteId: req.params.id }),
            Admission.find({ pacienteId: req.params.id }).sort({ "ingreso.fecha": -1 })
        ]);

        res.json({ patient, clinicalRecord, admissions });
    } catch {
        res.status(500).json({ error: "Error obteniendo paciente" });
    }
});

// ── POST / ────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const ownerId = req.institucionId || req.enfermeroId;
        const curpUpper = req.body.curp.toUpperCase();

        // 1. 🛡️ BARRERA DE SEGURIDAD: Checar si la CURP ya existe para este enfermero/institución
        const pacienteExistente = await Patient.findOne({ curp: curpUpper, ownerId });
        
        if (pacienteExistente) {
            // Mandamos código 400 (Bad Request) con un mensaje claro para el frontend
            return res.status(400).json({ 
                error: `Ya existe un paciente registrado con la CURP ${curpUpper} en tu cuenta.` 
            });
        }

        // 2. Aquí creas al Paciente (ya sabemos que es seguro)
        const newPatient = await Patient.create({
            nombre: req.body.nombre,
            curp: curpUpper, // Lo guardamos siempre en mayúsculas por consistencia
            demograficos: req.body.demograficos,
            ownerId: ownerId,
            enfermeroId: req.enfermeroId,
            institucionId: req.institucionId
        });

        // 3. Creas el Expediente Clínico (ClinicalRecord)
        const newRecord = await ClinicalRecord.create({
            pacienteId: newPatient._id,
            antecedentes: req.body.antecedentes,
            alergias: req.body.alergias,
            medicacionActual: req.body.medicacionActual,
            habitos: req.body.habitos,
            redCuidados: req.body.redCuidados
        });

        // 4. Creas el ingreso asegurando todos los IDs
        const newAdmission = await Admission.create({
            pacienteId: newPatient._id,
            ingreso: req.body.ingreso,
            registradoPor: req.enfermeroId,
            institucionId: req.institucionId,
            ownerId: ownerId
        });

        // 5. Retornas el éxito al frontend
        res.status(201).json({
            patient: newPatient,
            clinicalRecord: newRecord,
            admission: newAdmission
        });

    } catch (error) {
        console.error("Error en POST /patients:", error); 
        res.status(500).json({ error: "Error en el servidor al intentar crear el paciente." });
    }
});

// ── PUT /:id ──────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.id, ...filtroAcceso(req) });
        if (!patient) return res.status(404).json({ error: "Paciente no encontrado" });

        const { nombre, curp, demograficos } = req.body;
        const updated = await Patient.findByIdAndUpdate(
            req.params.id,
            { nombre, curp, demograficos },
            { new: true, runValidators: true }
        );
        res.json(updated);
    } catch {
        res.status(500).json({ error: "Error al actualizar el paciente" });
    }
});

// ── PUT /:id/expediente ───────────────────────────────────────────────────
router.put("/:id/expediente", async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.params.id, ...filtroAcceso(req) });
        if (!patient) return res.status(404).json({ error: "Paciente no encontrado" });

        const updated = await ClinicalRecord.findOneAndUpdate(
            { pacienteId: req.params.id },
            { ...req.body, ultimaActualizacion: new Date() },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ error: "Expediente no encontrado" });
        res.json(updated);
    } catch {
        res.status(500).json({ error: "Error al actualizar el expediente" });
    }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const patient = await Patient.findOne({ _id: req.params.id, ...filtroAcceso(req) });
        if (!patient) return res.status(404).json({ error: "No autorizado" });

        const { id } = req.params;
        await Patient.findByIdAndDelete(id, { session });
        await ClinicalRecord.deleteMany({ pacienteId: id }, { session });
        await Admission.deleteMany({ pacienteId: id }, { session });
        await CarePlan.deleteMany({ pacienteId: id }, { session });

        await session.commitTransaction();
        res.json({ message: "Paciente eliminado correctamente" });
    } catch {
        await session.abortTransaction();
        res.status(500).json({ error: "Error al eliminar el paciente" });
    } finally {
        session.endSession();
    }
});

// ── Stats endpoints (sin cambios en lógica, pero respetan filtro) ─────────
router.get("/stats/expedientes", async (req, res) => {
    try {
        const patients = await Patient.find(filtroAcceso(req)).select('_id');
        const ids = patients.map(p => p._id);

        const records = await ClinicalRecord.find({ pacienteId: { $in: ids } });

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

        const tabMap  = { No: 0, Exfumador: 0, Sí: 0 };
        const alcMap  = { No: 0, Social: 0, Habitual: 0 };
        const dietMap = { Balanceada: 0, Deficiente: 0, Hipergrasas: 0 };
        records.forEach(r => {
            const h = r.habitos || {};
            if (h.tabaquismo   in tabMap)  tabMap[h.tabaquismo]++;
            if (h.alcoholismo  in alcMap)  alcMap[h.alcoholismo]++;
            if (h.alimentacion in dietMap) dietMap[h.alimentacion]++;
        });

        res.json({ antecedentes, habitos: { tabaquismo: tabMap, alcoholismo: alcMap, alimentacion: dietMap } });
    } catch {
        res.status(500).json({ error: "Error obteniendo estadísticas" });
    }
});

export default router;