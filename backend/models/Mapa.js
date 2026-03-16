import mongoose from "mongoose";

const mapaSchema = new mongoose.Schema({
  nanda_codigo: String,
  nanda_nombre: String,
  dominio: String,
  noc_sugeridos: [{ codigo: String, coincidencia: Number }],
  nic_sugeridos: [{ 
    codigo: String, 
    coincidencia: Number,
    nocs_asociados: [{ codigo_noc: String, afinidad: Number }] }],
  score_confianza: Number
});

export default mongoose.model("Mapa", mapaSchema, "mapa");