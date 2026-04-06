import express from "express";
import JefeEnfermeria from "../models/JefeEnfermeria.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// POST /login — Login exclusivo para el rol de Jefe
router.post("/login", async (req, res) => {
  console.log(">>> ¡PETICIÓN RECIBIDA EN RUTA DE JEFE! <<<");
  try {
    const { email, password } = req.body;
    console.log("1. Intento de login para Jefe:", email);

    // Buscamos en la colección 'enfermeros' pero asegurándonos que el rol sea 'jefe'
    const jefe = await JefeEnfermeria.findOne({ 
      "cuenta.correo_electronico": email,
      "cuenta.rol": "jefe" 
    });

    if (!jefe) {
      return res.status(404).json({ error: "Jefe de enfermería no encontrado" });
    }

    const coinciden = await bcrypt.compare(password, jefe.cuenta.password_hash);
    console.log("5. ¿Coinciden credenciales de Jefe?:", coinciden);
    
    if (!coinciden) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Limpiamos el hash para no enviarlo al frontend
    const datosUsuario = jefe.toObject();
    delete datosUsuario.cuenta.password_hash;

    // GENERAMOS EL TOKEN JWT (Incluyendo ID y Rol)
    const token = jwt.sign(
      { id: jefe._id, rol: jefe.cuenta.rol }, 
      process.env.JWT_SECRET || 'secreto_de_desarrollo', 
      { expiresIn: "8h" }
    );

    res.json({
      mensaje: "Bienvenido al panel de Jefatura",
      user: datosUsuario,
      token: token
    });

  } catch (error) {
    console.error("Error en Login Jefe:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /perfil/:id — Obtener datos del jefe
router.get("/perfil/:id", async (req, res) => {
  try {
    const jefe = await JefeEnfermeria.findById(req.params.id).select("-cuenta.password_hash");
    
    if (!jefe) {
      return res.status(404).json({ error: "Jefe no encontrado" });
    }
    
    res.json(jefe);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil del jefe" });
  }
});

export default router;