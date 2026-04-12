import jwt from 'jsonwebtoken';
import Enfermero from '../models/Enfermeros.js';
import JefeEnfermeria from '../models/JefeEnfermeria.js'; // 🟢 1. IMPORTAMOS EL MODELO DEL JEFE

export default async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token requerido' });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 🟢 2. BUSCAMOS PRIMERO EN ENFERMEROS
        let usuario = await Enfermero.findById(decoded.id)
            .select('cuenta.rol cuenta.estado_cuenta institucionId');

        // 🟢 3. SI NO ESTÁ AHÍ, BUSCAMOS EN JEFES
        if (!usuario) {
            usuario = await JefeEnfermeria.findById(decoded.id)
                .select('cuenta.rol cuenta.estado_cuenta datos_laborales.institucionId institucionId');
        }

        // 🟢 4. VALIDAMOS SI EXISTE Y ESTÁ ACTIVO
        if (!usuario || usuario.cuenta?.estado_cuenta !== 'activo')
            return res.status(401).json({ error: 'Cuenta inactiva o no encontrada' });

        // 🟢 5. EXTRAEMOS LA INSTITUCIÓN (El Jefe la guarda dentro de datos_laborales)
        const instId = usuario.datos_laborales?.institucionId || usuario.institucionId;

        // Asignamos las variables globales para las rutas
        req.enfermeroId   = decoded.id; // Mantenemos este nombre para no romper tus otras rutas
        req.user          = { id: decoded.id }; 
        req.rol           = usuario.cuenta.rol;
        req.institucionId = instId ? instId.toString() : null;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}