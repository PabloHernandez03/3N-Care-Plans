import mongoose from "mongoose";

const nocSchema = new mongoose.Schema({
  codigo: String,
  nombre: String,
  definicion: String,
  dominio: String,
  clase: String,
  escalas: [String],
  tipo_escala: String,
  indicadores: [
    {
      codigo: String,
      texto: String
    }
  ]
});

export default mongoose.model("Noc", nocSchema, "noc");