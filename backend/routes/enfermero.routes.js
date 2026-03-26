import express from "express";
import Enfermero from "../models/Enfermeros.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("1. Intento de login para:", email);
    const enfermero = await Enfermero.findOne({ "cuenta.correo_electronico": email });

    if (!enfermero) {
      return res.status(404).json({ error: "Las credenciales son incorrectas" });
    }

    console.log("3. Hash almacenado en la DB:", enfermero.cuenta.password_hash);

    const salt = await bcrypt.genSalt(10);
    const hashGeneradoAhora = await bcrypt.hash(password, salt);
    
    const coinciden = await bcrypt.compare(password, enfermero.cuenta.password_hash);
    console.log("5. ¿Coinciden según bcrypt?:", coinciden);
    
    if (!coinciden) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const datosUsuario = enfermero.toObject();

    delete datosUsuario.cuenta.password_hash;

    res.json({
      mensaje: "Bienvenido al sistema",
      user: datosUsuario 
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

router.post("/registro", async (req, res) => {
    try {
        const { 
            nombre, apellido_paterno, apellido_materno, cedula_profesional, curp_dni,
            telefono, calle, ciudad, estado, 
            grado_academico, institucion_egreso, 
            unidad_hospitalaria, area_asignada, turno, 
            correo_electronico, password 
        } = req.body;

        // Validar si el correo ya existe
        const existeEnfermero = await Enfermero.findOne({ "cuenta.correo_electronico": correo_electronico });
        if (existeEnfermero) {
            return res.status(400).json({ error: "Este correo electrónico ya está registrado." });
        }

        // LÓGICA DE AUTO-INCREMENTO (ID Interno)
        const ultimoEnfermero = await Enfermero.findOne().sort({ "cuenta.id_interno": -1 });
        const nuevoIdInterno = ultimoEnfermero && ultimoEnfermero.cuenta && ultimoEnfermero.cuenta.id_interno 
            ? ultimoEnfermero.cuenta.id_interno + 1 
            : 1;

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Construcción del JSON final
        const nuevoEnfermero = new Enfermero({
            cuenta: {
                id_interno: nuevoIdInterno,
                correo_electronico: correo_electronico,
                password_hash: password_hash,
                rol: "enfermero",
                estado_cuenta: "activo"
            },
            identidad: {
                nombre: nombre,
                apellido_paterno: apellido_paterno,
                apellido_materno: apellido_materno,
                cedula_profesional: cedula_profesional,
                curp_dni: curp_dni
            },
            contacto: {
                telefono: telefono
            },
            direccion: {
                calle: calle,
                ciudad: ciudad,
                estado: estado
            },
            perfil_profesional: {
                grado_academico: grado_academico,
                especialidades: [], 
                institucion_egreso: institucion_egreso
            },
            datos_laborales: {
                unidad_hospitalaria: unidad_hospitalaria,
                area_asignada: area_asignada,
                turno: turno,
                fecha_ingreso: new Date().toISOString().split('T')[0],
                esta_activo: true 
            },
            metadatos: {
                creado_el: new Date().toISOString()
            }
        });

        await nuevoEnfermero.save();
        res.status(201).json({ mensaje: "Nodo registrado exitosamente en la red." });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Falla interna del servidor al procesar el registro." });
    }
});

router.get("/todos", async (req, res) => {
    try {
        const todosLosEnfermeros = await Enfermero.find().select("-cuenta.password_hash");
        res.json(todosLosEnfermeros);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener enfermeros" });
    }
});

export default router;