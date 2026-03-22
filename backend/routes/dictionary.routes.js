import express from "express";
const router = express.Router();

import Nanda from "../models/Nanda.js"; 
import Noc from "../models/Noc.js";
import Nic from "../models/Nic.js";

router.get("/nanda", async (req, res) => {
  try {
    const data = await Nanda.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener NANDA", error: err.message });
  }
});

// GET /api/dictionary/noc
router.get("/noc", async (req, res) => {
  try {
    const data = await Noc.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener NOC", error: err.message });
  }
});

// GET /api/dictionary/nic
router.get("/nic", async (req, res) => {
  try {
    const data = await Nic.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener NIC", error: err.message });
  }
});

export default router;