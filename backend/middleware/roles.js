export const soloRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.rol))
        return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    next();
};