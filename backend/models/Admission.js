import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema({

  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // ── Datos de ingreso ───────────────────────────────────
  ingreso: {
    fecha:             { type: Date, required: true, default: Date.now },
    hora:              { type: String },
    servicio:          { type: String },
    cama:              { type: String },
    diagnosticoMedico: { type: String }
  },

  // ── Egreso (se llena al dar de alta) ──────────────────
  egreso: {
    fecha:     { type: Date },
    tipo:      { type: String, enum: ['Alta', 'Traslado', 'Defunción', 'Voluntaria'] },
    resumen:   { type: String }
  },

  estado: {
    type: String,
    enum: ['Activo', 'Egresado'],
    default: 'Activo'
  }

}, { timestamps: true });

export default mongoose.model("Admission", admissionSchema, "admissions");