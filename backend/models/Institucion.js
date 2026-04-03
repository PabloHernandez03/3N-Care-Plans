import mongoose from 'mongoose';

const institucionSchema = new mongoose.Schema({
    nombre:   { type: String, required: true },
    tipo:     { type: String, enum: ['hospital', 'clinica_privada', 'otro'], required: true },
    direccion: { calle: String, ciudad: String, estado: String },
    activa:   { type: Boolean, default: true },
    metadatos: { creado_el: { type: Date, default: Date.now } }
});

export default mongoose.model('Institucion', institucionSchema, 'instituciones');