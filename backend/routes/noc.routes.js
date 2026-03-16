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

    const mapa = await Mapa.findOne({
      nanda_codigo: req.params.codigo
    });

    if (!mapa) {
      return res.status(404).json({
        error: "NANDA no encontrado en mapa"
      });
    }

    const noc = await Noc.find({
      codigo: { $in: mapa.noc_sugeridos }
    });

    res.json({
      nanda: mapa.nanda_nombre,
      noc_sugeridos: noc
    });

  } catch (error) {

    res.status(500).json({
      error: "Error obteniendo NOC"
    });

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

export default router;