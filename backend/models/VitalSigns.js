import mongoose from "mongoose";

const vitalSignsSchema = new mongoose.Schema({

  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // ── Signos vitales ─────────────────────────────
  signos: {
    frecuenciaCardiaca: { type: Number },   // bpm
    presionArterial: {
      sistolica:  { type: Number },
      diastolica: { type: Number }
    },
    frecuenciaRespiratoria: { type: Number }, // rpm
    temperatura: { type: Number },            // °C
    saturacionOxigeno: { type: Number },      // %
    
    // opcionales
    glucosa: { type: Number },
    peso: { type: Number }, // kg
    talla: { type: Number }, // cm
    dolor: { type: Number, min: 0, max: 10 }
  },

  observaciones: { type: String },

  registradoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enfermero"
  },

  fecha: {
    type: Date,
    default: Date.now
  },

  editado: { type: Boolean, default: false },
  fechaEdicion: { type: Date }

}, { timestamps: true });

export default mongoose.model("VitalSigns", vitalSignsSchema, "vitalsigns");