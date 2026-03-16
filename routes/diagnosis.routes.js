import express from "express";
import Mapa from "../models/Mapa.js";

const router = express.Router();


router.get("/:nanda", async (req, res) => {

  try {

    const mapa = await Mapa.findOne({
      nanda_codigo: req.params.nanda
    });

    if (!mapa) {
      return res.status(404).json({
        error: "Diagnóstico no encontrado"
      });
    }

    res.json(mapa);

  } catch (error) {

    res.status(500).json({
      error: "Error en consulta"
    });

  }

});

export default router;