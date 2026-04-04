import express from "express";
import Enfermero from "../models/Enfermeros.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import authMiddleware from '../middleware/auth.js';
import { soloRoles } from '../middleware/roles.js';

const router = express.Router();

// GET /equipo — enfermeros de la institución del jefe
router.get('/equipo', authMiddleware, soloRoles('jefe', 'superadmin'), async (req, res) => {
    try {
        const filtro = req.rol === 'jefe'
            ? { institucionId: req.institucionId }
            : {};
        const equipo = await Enfermero.find(filtro).select('-cuenta.password_hash');

        // Contar pacientes por enfermero
        const ids = equipo.map(e => e._id);
        const conteos = await Patient.aggregate([
            { $match: { enfermeroId: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: '$enfermeroId', total: { $sum: 1 } } }
        ]);
        const conteoMap = Object.fromEntries(conteos.map(c => [c._id.toString(), c.total]));

        const resultado = equipo.map(e => ({
            ...e.toObject(),
            totalPacientes: conteoMap[e._id.toString()] || 0
        }));

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo equipo' });
    }
});

// POST /crear — jefe crea un enfermero en su institución
router.post('/crear', authMiddleware, soloRoles('jefe', 'superadmin'), async (req, res) => {
    try {
        const {
            nombre, apellido_paterno, apellido_materno,
            cedula_profesional, curp_dni,
            telefono, calle, ciudad, estado,
            grado_academico, institucion_egreso,
            unidad_hospitalaria, area_asignada, turno,
            correo_electronico, password
        } = req.body;

        const existe = await Enfermero.findOne({ 'cuenta.correo_electronico': correo_electronico });
        if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });

        const ultimo   = await Enfermero.findOne().sort({ 'cuenta.id_interno': -1 });
        const nuevoId  = (ultimo?.cuenta?.id_interno || 0) + 1;
        const hash     = await bcrypt.hash(password, 10);

        const nuevo = await Enfermero.create({
            cuenta: {
                id_interno:         nuevoId,
                correo_electronico,
                password_hash:      hash,
                rol:                'enfermero',
                estado_cuenta:      'activo'
            },
            identidad: { nombre, apellido_paterno, apellido_materno },
            datos_laborales: { turno, area_asignada, esta_activo: true },
            institucionId: req.rol === 'jefe' ? req.institucionId : req.body.institucionId || null,
            metadatos: { creado_el: new Date() }
        });

        const datos = nuevo.toObject();
        delete datos.cuenta.password_hash;
        res.status(201).json(datos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear enfermero' });
    }
});

// PATCH /:id/estado — activar o desactivar cuenta
router.patch('/:id/estado', authMiddleware, soloRoles('jefe', 'superadmin'), async (req, res) => {
    try {
        const enfermero = await Enfermero.findById(req.params.id);
        if (!enfermero) return res.status(404).json({ error: 'No encontrado' });

        if (req.rol === 'jefe' && enfermero.institucionId?.toString() !== req.institucionId)
            return res.status(403).json({ error: 'No pertenece a tu institución' });

        enfermero.cuenta.estado_cuenta = req.body.estado;
        await enfermero.save();
        res.json({ ok: true, estado: req.body.estado });
    } catch {
        res.status(500).json({ error: 'Error actualizando estado' });
    }
});

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