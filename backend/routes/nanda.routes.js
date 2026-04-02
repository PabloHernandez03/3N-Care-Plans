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

    // Normalizar: quitar acentos y pasar a minúsculas
    const normalizar = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Construir regex que acepta vocales con o sin acento
    const toFlexibleRegex = (token) => {
      const norm = normalizar(token);
      // Reemplazar cada vocal por un grupo que acepta con/sin acento
      const patron = norm
        .replace(/a/g, '[aá]')
        .replace(/e/g, '[eé]')
        .replace(/i/g, '[ií]')
        .replace(/o/g, '[oó]')
        .replace(/u/g, '[uú]')
        .replace(/n/g, '[nñ]');
      return new RegExp(patron, 'i');
    };

    const tokens = palabra.split(/\s+/).filter(Boolean);

    // Si es solo números, buscar por código
    const esCodigo = /^\d+$/.test(palabra.trim());
    if (esCodigo) {
      const resultados = await Nanda.find({ codigo: { $regex: palabra, $options: 'i' } })
        .select('codigo nombre dominio clase definicion')
        .limit(20);
      return res.json(resultados);
    }

    const condiciones = tokens.map(token => {
      const regex = toFlexibleRegex(token);
      return {
        $or: [
          { codigo:                     { $regex: regex } },
          { nombre:                     { $regex: regex } },
          { definicion:                 { $regex: regex } },
          { caracteristicas_definitorias: { $regex: regex } },
          { factores_relacionados:      { $regex: regex } },
        ]
      };
    });

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