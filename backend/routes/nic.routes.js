import express from "express";
import Nic from "../models/Nic.js";

const router = express.Router();

router.post("/list", async (req,res)=>{

 try{

  const { codigos } = req.body;

  const nics = await Nic.find({
    codigo: { $in: codigos }
  });

  res.json(nics);

 }catch(err){

  res.status(500).json({
   error:"error obteniendo NIC"
  });

 }

});

router.get("/:codigo", async (req, res) => {
  try {
    const nic = await Nic.findOne({ codigo: req.params.codigo });
    
    if (!nic) {
      return res.status(404).json({ error: "NIC no encontrado" });
    }
    
    res.json(nic);
  } catch (err) {
    console.error("Error buscando el NIC:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;