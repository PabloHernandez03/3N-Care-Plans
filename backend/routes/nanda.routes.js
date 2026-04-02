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
    const palabra = req.params.query.trim();
    if (!palabra) return res.json([]);

    // Dividir en tokens para buscar cada palabra por separado
    const tokens = palabra.split(/\s+/).filter(Boolean);

    // Cada token se convierte en un regex que busca en nombre, definicion,
    // caracteristicas_definitorias y factores_relacionados
    const condiciones = tokens.map(token => ({
      $or: [
        { nombre:                     { $regex: token, $options: 'i' } },
        { definicion:                 { $regex: token, $options: 'i' } },
        { caracteristicas_definitorias: { $regex: token, $options: 'i' } },
        { factores_relacionados:      { $regex: token, $options: 'i' } },
      ]
    }));

    const resultados = await Nanda.find({ $and: condiciones })
      .select('codigo nombre dominio clase definicion')
      .limit(20);

    res.json(resultados);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
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