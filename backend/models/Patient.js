import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  curp: { type: String, required: true, unique: true },
  fechaNacimiento: { type: String, required: true },
  edad: { type: Number, required: true },
  sexo: { type: String, enum: ['M', 'F', 'N'], required: true },
  sangre: { type: String, required: true },
  
  ingreso: {
    fecha: { type: String },
    hora: { type: String },
    servicioCama: { type: String },
    diagnosticoMedico: { type: String }
  },

  antecedentes: {
    patologicos: [String],
    noPatologicos: [String], 
    quirurgicos: [String],   
    alergias: {             
      ninguna: { type: Boolean, default: false },
      medicamentos: { type: String },
      alimentos: { type: String },
      ambientales: { type: String }
    },
    medicacionActual: {      
      ninguna: { type: Boolean, default: false },
      nombre: { type: String },
      dosis: { type: String },
      frecuencia: { type: String },
      via: { type: String }
    },
    habitos: {              
      tabaquismo: { type: String },
      alcoholismo: { type: String },
      alimentacion: { type: String }
    },
    redCuidados: { type: String } 
  },

  fechaRegistro: { type: Date, default: Date.now }
});

export default mongoose.model("Patient", patientSchema, "patients");