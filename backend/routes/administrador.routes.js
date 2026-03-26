import express from "express";
import Admin from "../models/Admins.js"; 
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("1. Intento de login administrativo para:", email);

    const admin = await Admin.findOne({ "cuenta.correo_electronico": email });

    if (!admin) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("3. Hash administrativo en DB:", admin.cuenta.password_hash);

    const coinciden = await bcrypt.compare(password, admin.cuenta.password_hash);
    console.log("5. ¿Coinciden admin?:", coinciden);
    
    if (!coinciden) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const datosUsuario = admin.toObject();
    delete datosUsuario.cuenta.password_hash;

    res.json({
      mensaje: "Bienvenido al panel administrativo",
      user: datosUsuario 
    });

  } catch (error) {
    console.error("Error en Login Admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/perfil/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-cuenta.password_hash");
    
    if (!admin) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

export default router;