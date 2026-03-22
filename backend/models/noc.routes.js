import express from "express";
import Noc from "../models/Noc.js";
import Mapa from "../models/Mapa.js";

const router = express.Router();


router.get("/:codigo", async (req, res) => {

  try {

    const noc = await Noc.findOne({
      codigo: req.params.codigo
    });

    if (!noc) {
      return res.status(404).json({
        error: "NOC no encontrado"
      });
    }

    res.json(noc);

  } catch (error) {

    res.status(500).json({
      error: "Error obteniendo NOC"
    });

  }

});


router.get("/from-nanda/:codigo", async (req, res) => {
  try {
    const mapa = await Mapa.findOne({ nanda_codigo: req.params.codigo });
    if (!mapa) {
      return res.status(404).json({ error: "NANDA no encontrado en mapa" });
    }

    const codigosNoc = mapa.noc_sugeridos.map(n => n.codigo);
    const nocsEncontrados = await Noc.find({ codigo: { $in: codigosNoc } });

    const nocsConPorcentaje = nocsEncontrados.map(nocBD => {

      const infoMapa = mapa.noc_sugeridos.find(n => n.codigo === nocBD.codigo);
      return {
        ...nocBD.toObject(),
        coincidencia: infoMapa ? infoMapa.coincidencia : 0
      };
    });

    nocsConPorcentaje.sort((a, b) => b.coincidencia - a.coincidencia);

    res.json({
      nanda: mapa.nanda_nombre,
      noc_sugeridos: nocsConPorcentaje
    });

  } catch (error) {
    res.status(500).json({ error: "Error obteniendo NOC" });
  }
});


router.post("/evaluate", async (req, res) => {

  const { noc, indicadores } = req.body;

  const valores = Object.values(indicadores);

  if (valores.length === 0) {
    return res.status(400).json({
      error: "No hay indicadores"
    });
  }

  const suma = valores.reduce((a,b)=>a+b,0);
  const promedio = suma / valores.length;

  res.json({
    noc,
    score: promedio,
    nivel:
      promedio >= 4 ? "alto" :
      promedio >= 3 ? "adecuado" :
      promedio >= 2 ? "bajo" :
      "critico"
  });

});

router.get("/:codigo", async (req, res) => {
    try {
        const noc = await Noc.findOne({ codigo: req.params.codigo });
        if (!noc) return res.status(404).json({ error: "NOC no encontrado" });
        res.json(noc);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar el NOC" });
    }
});

router.get("/", async (req, res) => {
  try {
    const lista = await Noc.find().select("codigo nombre dominio clase definicion indicadores");
    res.json(lista);
  } catch (error) {
    console.error("Error en GET /noc:", error);
    res.status(500).json({ error: "Error obteniendo NOC" });
  }
});

export default router;