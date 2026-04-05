import mongoose from "mongoose";

const carePlanSchema = new mongoose.Schema({

  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  ingresoId: {               // ← nuevo vínculo al ingreso específico
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
    required: true
  },

  fecha: { type: Date, default: Date.now },

  enfermeroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enfermero',
      default: null
  },
  institucionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institucion',
      default: null
  },

  // ── NANDA ──────────────────────────────────────────────
  nanda: {
    codigo: String,
    nombre: String
  },

  // ── NOC ────────────────────────────────────────────────
  nocsEvaluados: [{
    codigo:      String,
    promedio:    Number,
    indicadores: { type: Map, of: Number }
  }],

  // ── NIC ────────────────────────────────────────────────
  nicsSeleccionados: [{
    codigo: String,
    nombre: String
  }],

  estado: { type: String, enum: ['Activo', 'Completado', 'Cancelado'], default: "Activo" }

}, { timestamps: true });

export default mongoose.model("CarePlan", carePlanSchema, "careplans");