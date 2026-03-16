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

export default router;