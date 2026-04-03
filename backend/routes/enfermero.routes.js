import express from "express";
import Enfermero from "../models/Enfermeros.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const enfermero = await Enfermero.findOne({ "cuenta.correo_electronico": email });

        if (!enfermero)
            return res.status(404).json({ error: "Las credenciales son incorrectas" });

        const coinciden = await bcrypt.compare(password, enfermero.cuenta.password_hash);
        if (!coinciden)
            return res.status(401).json({ error: "Contraseña incorrecta" });

        // Generar token JWT
        const token = jwt.sign(
            { id: enfermero._id },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        const datosUsuario = enfermero.toObject();
        delete datosUsuario.cuenta.password_hash;

        res.json({
            mensaje: "Bienvenido al sistema",
            token,
            user: datosUsuario
        });

    } catch (error) {
        console.error("Error en Login:", error);
        res.status(500).json({ error: "Error interno del servidor" });
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

        const existeEnfermero = await Enfermero.findOne({ "cuenta.correo_electronico": correo_electronico });
        if (existeEnfermero)
            return res.status(400).json({ error: "Este correo electrónico ya está registrado." });

        const ultimoEnfermero = await Enfermero.findOne().sort({ "cuenta.id_interno": -1 });
        const nuevoIdInterno = (ultimoEnfermero?.cuenta?.id_interno || 0) + 1;

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoEnfermero = new Enfermero({
            cuenta: {
                id_interno:         nuevoIdInterno,
                correo_electronico: correo_electronico,
                password_hash:      password_hash,
                rol:                "enfermero",
                estado_cuenta:      "activo"
            },
            identidad: {
                nombre, apellido_paterno, apellido_materno,
                cedula_profesional, curp_dni
            },
            contacto:  { telefono },
            direccion: { calle, ciudad, estado },
            perfil_profesional: {
                grado_academico,
                especialidades:    [],
                institucion_egreso
            },
            datos_laborales: {
                unidad_hospitalaria, area_asignada, turno,
                fecha_ingreso: new Date().toISOString().split('T')[0],
                esta_activo:   true
            },
            metadatos:    { creado_el: new Date() },
            institucionId: null   // ← independiente por defecto
        });

        await nuevoEnfermero.save();
        res.status(201).json({ mensaje: "Cuenta registrada exitosamente." });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ error: "Falla interna del servidor al procesar el registro." });
    }
});

router.get("/perfil/:id", async (req, res) => {
    try {
        const enfermero = await Enfermero.findById(req.params.id)
            .select("-cuenta.password_hash");
        if (!enfermero)
            return res.status(404).json({ error: "Enfermero no encontrado" });
        res.json(enfermero);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
});

router.get("/todos", async (req, res) => {
    try {
        const todos = await Enfermero.find().select("-cuenta.password_hash");
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener enfermeros" });
    }
});

export default router;