import mongoose from "mongoose";

const nicSchema = new mongoose.Schema({
  codigo: String,
  nombre: String,
  clase: [String],
  dominio: String,
  definicion: String,
  actividades: [String]
});

export default mongoose.model("Nic", nicSchema, "nic");