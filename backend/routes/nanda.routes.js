import express from "express";
import Nanda from "../models/Nanda.js";

const router = express.Router();


router.get("/", async (req, res) => {

  try {

    const lista = await Nanda.find().select("codigo nombre");

    res.json(lista);

  } catch (error) {

    res.status(500).json({
      error: "Error obteniendo NANDA"
    });

  }

});


router.get("/:codigo", async (req, res) => {

  try {

    const nanda = await Nanda.findOne({
      codigo: req.params.codigo
    });

    if (!nanda) {
      return res.status(404).json({
        error: "NANDA no encontrado"
      });
    }

    res.json(nanda);

  } catch (error) {

    res.status(500).json({
      error: "Error en consulta"
    });

  }

});

export default router;