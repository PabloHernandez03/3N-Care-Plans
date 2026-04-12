import express from "express";
import JefeEnfermeria from "../models/JefeEnfermeria.js"; 
import Institucion from "../models/Institucion.js";
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

// ── POST /registro — Registro de nuevo Jefe y creación de su Institución
router.post("/registro", async (req, res) => {
    try {
        const {
            nombre, apellido_paterno, apellido_materno, cedula_profesional, curp_dni,
            telefono, calle, ciudad, estado,
            grado_academico, institucion_egreso,
            unidad_hospitalaria, area_asignada, turno,
            correo_electronico, password,
            nombre_institucion // 🟢 El campo especial que manda el frontend
        } = req.body;

        // 1. Verificar que el correo no esté en uso por otro Jefe
        const existeJefe = await JefeEnfermeria.findOne({ "cuenta.correo_electronico": correo_electronico });
        if (existeJefe) {
            return res.status(400).json({ error: "Este correo electrónico ya está registrado como Jefe." });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. 🟢 CREAR LA INSTITUCIÓN (Clínica/Hospital)
        const nuevaInstitucion = await Institucion.create({
            nombre: nombre_institucion || unidad_hospitalaria, // Usamos el nombre que puso en el form
            tipo: 'hospital', // Por defecto, o podrías pedirlo en el form
            direccion: { calle, ciudad, estado }
        });

        // 4. Calcular el id_interno secuencial
        const ultimoJefe = await JefeEnfermeria.findOne().sort({ "cuenta.id_interno": -1 });
        const nuevoIdInterno = (ultimoJefe?.cuenta?.id_interno || 0) + 1;

        // 5. 🟢 CREAR AL JEFE Y ENLAZARLO A LA INSTITUCIÓN CREADA
        const nuevoJefe = new JefeEnfermeria({
            cuenta: {
                id_interno: nuevoIdInterno,
                correo_electronico: correo_electronico,
                password_hash: password_hash,
                rol: "jefe",
                estado_cuenta: "activo"
            },
            identidad: {
                nombre, apellido_paterno, apellido_materno,
                cedula_profesional, curp_dni
            },
            contacto: { telefono },
            direccion: { calle, ciudad, estado },
            perfil_profesional: {
                grado_academico,
                especialidades: [],
                institucion_egreso
            },
            datos_laborales: {
                unidad_hospitalaria, 
                area_asignada, 
                turno,
                fecha_ingreso: new Date().toISOString().split('T')[0],
                esta_activo: true,
                // AQUÍ OCURRE EL ENLACE MÁGICO 👇
                institucionId: nuevaInstitucion._id, 
                enfermeros_a_cargo: []
            }
        });

        await nuevoJefe.save();
        res.status(201).json({ mensaje: "Jefatura e Institución creadas exitosamente." });

    } catch (error) {
        console.error("Error en registro de Jefe:", error);
        res.status(500).json({ error: "Falla interna del servidor al procesar el registro del Jefe." });
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