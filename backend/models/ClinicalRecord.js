import mongoose from "mongoose";

const clinicalRecordSchema = new mongoose.Schema({

  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    unique: true  // Un expediente clínico por paciente
  },

  // ── Antecedentes ───────────────────────────────────────
  antecedentes: {
    patologicos:   [String],
    noPatologicos: [String],
    quirurgicos:   [String]
  },

  // ── Alergias ───────────────────────────────────────────
  alergias: {
    ninguna:      { type: Boolean, default: false },
    medicamentos: { type: String },
    alimentos:    { type: String },
    ambientales:  { type: String }
  },

  // ── Medicación actual ──────────────────────────────────
  medicacionActual: [{
    nombre:     { type: String },
    dosis:      { type: String },
    frecuencia: { type: String },
    via:        { type: String }
  }],

  // ── Hábitos ────────────────────────────────────────────
  habitos: {
    tabaquismo:   { type: String },
    alcoholismo:  { type: String },
    alimentacion: { type: String }
  },

  redCuidados: { type: String },

  ultimaActualizacion: { type: Date, default: Date.now }

}, { timestamps: true });

export default mongoose.model("ClinicalRecord", clinicalRecordSchema, "clinicalrecords");