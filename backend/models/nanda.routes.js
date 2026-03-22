import express from "express";
import Nanda from "../models/Nanda.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const lista = await Nanda.find().select("codigo nombre dominio clase definicion caracteristicas_definitorias factores_relacionados factores_riesgo poblacion_en_riesgo problemas_asociados");
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo NANDA" });
  }
});

router.get("/search/:query", async (req, res) => {
  try {
    const palabra = req.params.query;

    const resultados = await Nanda.find(
      { $text: { $search: palabra } },
      { score: { $meta: "textScore" } } 
    )
    .sort({ score: { $meta: "textScore" } }) 
    .select("codigo nombre dominio clase definicion"); 

    res.json(resultados);
  } catch (error) {
    console.error("Error en búsqueda inteligente:", error);
    res.status(500).json({ error: "Error en la búsqueda de texto" });
  }
});

// 3. Ruta para obtener un NANDA específico por código
router.get("/:codigo", async (req, res) => {
  try {
    const nanda = await Nanda.findOne({ codigo: req.params.codigo });
    if (!nanda) {
      return res.status(404).json({ error: "NANDA no encontrado" });
    }
    res.json(nanda);
  } catch (error) {
    res.status(500).json({ error: "Error en consulta" });
  }
});

export default router;