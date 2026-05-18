import express from "express";
import Admin from "../models/Admins.js"; 
import Enfermero from "../models/Enfermeros.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ── LOGIN ADMINISTRATIVO ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("1. Intento de login administrativo para:", email);

    const admin = await Admin.findOne({ "cuenta.correo_electronico": email });

    if (!admin) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coinciden = await bcrypt.compare(password, admin.cuenta.password_hash);
    
    if (!coinciden) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const datosUsuario = admin.toObject();
    delete datosUsuario.cuenta.password_hash;

    const token = jwt.sign(
      { id: admin._id, rol: admin.cuenta.rol }, 
      process.env.JWT_SECRET || 'secreto_de_desarrollo', 
      { expiresIn: "8h" }
    );

    res.json({
      mensaje: "Bienvenido al panel administrativo",
      user: datosUsuario,
      token: token
    });

  } catch (error) {
    console.error("Error en Login Admin:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ── PERFIL ADMINISTRADOR ──────────────────────────────────────
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


// ==============================================================
// 🔴 NUEVAS RUTAS CRUD PARA GESTIÓN DE PERSONAL (STAFF)
// ==============================================================

// 1. OBTENER TODO EL PERSONAL (Enfermeros y Jefes)
router.get("/staff", async (req, res) => {
    try {
        // Buscamos a todo el personal y omitimos las contraseñas por seguridad
        const staff = await Enfermero.find().select("-cuenta.password_hash");
        res.json(staff);
    } catch (error) {
        console.error("Error obteniendo staff:", error);
        res.status(500).json({ error: "Error al cargar la lista del personal" });
    }
});

// 2. DAR DE ALTA NUEVO PERSONAL
router.post("/staff", async (req, res) => {
    try {
        const { identidad, cuenta, datos_laborales } = req.body;

        // Validar si el correo ya existe
        const existe = await Enfermero.findOne({ "cuenta.correo_electronico": cuenta.correo_electronico });
        if (existe) {
            return res.status(400).json({ error: "Ya existe un usuario con este correo" });
        }

        // Hashear la contraseña temporal
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(cuenta.password, salt);

        const nuevoPersonal = new Enfermero({
            identidad,
            cuenta: {
                correo_electronico: cuenta.correo_electronico,
                rol: cuenta.rol,
                estado_cuenta: cuenta.estado_cuenta,
                password_hash
            },
            datos_laborales
        });

        await nuevoPersonal.save();
        res.status(201).json({ mensaje: "Personal registrado exitosamente" });

    } catch (error) {
        console.error("Error creando personal:", error);
        res.status(500).json({ error: "Error interno al crear el personal" });
    }
});

// 3. EDITAR / DAR DE BAJA PERSONAL EXISTENTE
router.put("/staff/:id", async (req, res) => {
    try {
        const { identidad, cuenta, datos_laborales } = req.body;

        // Preparamos los datos a actualizar
        const updateData = {
            "identidad.nombre": identidad.nombre,
            "identidad.apellido_paterno": identidad.apellido_paterno,
            "identidad.apellido_materno": identidad.apellido_materno,
            "identidad.cedula_profesional": identidad.cedula_profesional,
            
            "cuenta.correo_electronico": cuenta.correo_electronico,
            "cuenta.rol": cuenta.rol,
            "cuenta.estado_cuenta": cuenta.estado_cuenta,
            
            "datos_laborales.area_asignada": datos_laborales.area_asignada,
            "datos_laborales.turno": datos_laborales.turno
        };

        // Si el admin escribió una nueva contraseña, la hasheamos y la actualizamos
        if (cuenta.password && cuenta.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData["cuenta.password_hash"] = await bcrypt.hash(cuenta.password, salt);
        }

        // Buscamos y actualizamos
        const personalActualizado = await Enfermero.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select("-cuenta.password_hash");

        if (!personalActualizado) {
            return res.status(404).json({ error: "Personal no encontrado" });
        }

        res.json(personalActualizado);

    } catch (error) {
        console.error("Error actualizando personal:", error);
        res.status(500).json({ error: "Error interno al actualizar el personal" });
    }
});

export default router;