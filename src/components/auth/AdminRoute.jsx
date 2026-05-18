import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
    const userString = sessionStorage.getItem('user');
    
    if (!userString) return <Navigate to="/" replace />;

    let user;
    try {
        user = JSON.parse(userString);
    } catch (error) {
        return <Navigate to="/" replace />;
    }

    // Extracción segura del rol (por si viene anidado en 'cuenta' o directo en la raíz)
    const rolUsuario = user?.cuenta?.rol || user?.rol;

    // 🔴 LA SOLUCIÓN: Dejar pasar tanto a 'admin' como a 'superadmin'
    if (rolUsuario !== 'admin' && rolUsuario !== 'superadmin') {
        console.warn(`Acceso denegado a Admin: ${rolUsuario}. Redirigiendo según perfil.`);
        
        // REDIRECCIÓN INTELIGENTE:
        if (rolUsuario === 'jefe') {
            return <Navigate to="/team" replace />; // Elena va a su zona
        }
        return <Navigate to="/dashboard" replace />; // Kevin va a la suya
    }

    // Si es admin o superadmin, renderiza la ruta (lo deja pasar)
    return <Outlet />;
}