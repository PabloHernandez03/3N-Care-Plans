import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({

  nombre: {
    nombre:          { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: { type: String, required: true }
  },

  curp: { type: String, required: true },

  enfermeroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enfermero',
    required: true
  },

  institucionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institucion',
    default: null
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  demograficos: {
    fechaNacimiento: { type: Date, required: true },
    sexo:            { type: String, enum: ['M', 'F', 'N'], required: true },
    tipoSangre:      { type: String, required: true }
  },

  fechaRegistro: { type: Date, default: Date.now },

  }, { 
    timestamps: true,
    toJSON: { virtuals: true },   // Para que la edad aparezca en las respuestas
    toObject: { virtuals: true }
  });

patientSchema.virtual("edad").get(function () {
  const hoy = new Date();
  const nacimiento = this.demograficos.fechaNacimiento;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
});

patientSchema.index({ curp: 1, ownerId: 1 }, { unique: true });

export default mongoose.model("Patient", patientSchema, "patients");