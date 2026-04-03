import mongoose from 'mongoose';

const enfermeroSchema = new mongoose.Schema({
  cuenta: {
      id_interno:          { type: Number, unique: true },
      correo_electronico:  { type: String, required: true, unique: true },
      password_hash:       { type: String, required: true },
      rol:                 { type: String, enum: ['superadmin', 'jefe', 'enfermero'], default: 'enfermero' },
      estado_cuenta:       { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
  },
  institucionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institucion',
    default: null  // null = enfermero independiente (clínica privada)
  },
  identidad: {
    nombre: String,
    apellido_paterno: String,
    apellido_materno: String,
    cedula_profesional: String,
    curp_dni: String
  },
  contacto: {
    telefono: String
  },
  direccion: {
    calle: String,
    ciudad: String,
    estado: String
  },
  perfil_profesional: {
    grado_academico: String,
    especialidades: [String],
    institucion_egreso: String
  },
  datos_laborales: {
    unidad_hospitalaria: String,
    area_asignada: String,
    turno: String,
    fecha_ingreso: String,
    esta_activo: { type: Boolean, default: true }
  },
  metadatos: {
    creado_el: { type: Date, default: Date.now }
  }
});

export default mongoose.model('Enfermero', enfermeroSchema, "enfermeros");