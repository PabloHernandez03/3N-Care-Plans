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
      indicadores: Object,
      // ← nuevo: historial de evaluaciones anteriores
      historial: [{
          promedio:    Number,
          indicadores: Object,
          fecha:       { type: Date, default: Date.now }
      }]
  }],
nicsSeleccionados: [{
  codigo: String,
  nombre: String,
  actividades: [{
    descripcion: String,
    realizado: { type: Boolean, default: false },
    fechaRealizacion: Date,
    enfermeroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enfermero' }
  }]
}],

notasEnfermeria: [{
  fecha: { type: Date, default: Date.now },
  nota: String,
  enfermeroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enfermero' }
}],

  estado: { type: String, enum: ['Activo', 'Completado', 'Cancelado'], default: "Activo" }

}, { timestamps: true });

export default mongoose.model("CarePlan", carePlanSchema, "careplans");