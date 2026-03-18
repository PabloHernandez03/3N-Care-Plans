import express from "express";
import Enfermero from "../models/Enfermeros.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("1. Intento de login para:", email);
    console.log("2. Contraseña escrita en el formulario:", password);
    const enfermero = await Enfermero.findOne({ "cuenta.correo_electronico": email });

    if (!enfermero) {
      return res.status(404).json({ error: "Las credenciales son incorrectas" });
    }

    console.log("3. Hash almacenado en la DB:", enfermero.cuenta.password_hash);


    const salt = await bcrypt.genSalt(10);
    const hashGeneradoAhora = await bcrypt.hash(password, salt);
    console.log("4. Hash generado de lo que escribiste (nuevo salt):", hashGeneradoAhora);
    

    const coinciden = await bcrypt.compare(password, enfermero.cuenta.password_hash);
    console.log("5. ¿Coinciden según bcrypt?:", coinciden);
    
    if (!coinciden) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }


    res.json({
      mensaje: "Bienvenido al sistema",
      user: {
        nombre: enfermero.identidad.nombre,
        unidad: enfermero.datos_laborales.unidad_hospitalaria
      }
    });

  } catch (error) {
    console.error("Error en Login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. Obtener el perfil completo del enfermero logeado
router.get("/perfil/:id", async (req, res) => {
  try {
    // Buscamos por ID y excluimos el hash de la contraseña por seguridad
    const enfermero = await Enfermero.findById(req.params.id).select("-cuenta.password_hash");
    
    if (!enfermero) {
      return res.status(404).json({ error: "Enfermero no encontrado" });
    }
    
    res.json(enfermero);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

export default router;