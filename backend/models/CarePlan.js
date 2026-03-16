import mongoose from "mongoose";

const carePlanSchema = new mongoose.Schema({
  pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  fecha: { type: Date, default: Date.now },
  nanda: {
    codigo: String,
    nombre: String
  },
  nocsEvaluados: [{
    codigo: String,
    promedio: Number,
    indicadores: { type: Map, of: Number } 
  }],
  nicsSeleccionados: [{
    codigo: String,
    nombre: String
  }],
  estado: { type: String, default: "Activo" }
});

export default mongoose.model("CarePlan", carePlanSchema, "careplans");