import jwt from 'jsonwebtoken';
import Enfermero from '../models/Enfermeros.js';

export default async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token requerido' });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const enfermero = await Enfermero.findById(decoded.id)
            .select('cuenta.rol cuenta.estado_cuenta institucionId');

        if (!enfermero || enfermero.cuenta.estado_cuenta !== 'activo')
            return res.status(401).json({ error: 'Cuenta inactiva o no encontrada' });

        req.enfermeroId   = decoded.id;
        req.rol           = enfermero.cuenta.rol;
        req.institucionId = enfermero.institucionId?.toString() || null;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}