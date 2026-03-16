import mongoose from "mongoose";

const nandaSchema = new mongoose.Schema({

  codigo: String,

  nombre: String,

  definicion: String,

  dominio: {
    codigo: String,
    nombre: String
  },

  clase: {
    codigo: String,
    nombre: String
  },

  caracteristicas_definitorias: [String],

  factores_relacionados: [String],

  factores_de_riesgo: [String],

  poblacion_en_riesgo: [String],

  condiciones_asociadas: [String]

});

export default mongoose.model("Nanda", nandaSchema, "nanda");