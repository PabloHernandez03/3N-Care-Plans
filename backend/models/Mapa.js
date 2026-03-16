import mongoose from "mongoose";

const mapaSchema = new mongoose.Schema({
  nanda_codigo: String,
  nanda_nombre: String,
  dominio: String,
  noc_sugeridos: [String],
  nic_sugeridos: [String],
  score_confianza: Number
});

export default mongoose.model("Mapa", mapaSchema, "mapa");