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

    const rolUsuario = user?.cuenta?.rol;

    if (rolUsuario !== 'admin') {
        console.warn(`Acceso denegado a Admin: ${rolUsuario}. Redirigiendo según perfil.`);
        
        // REDIRECCIÓN INTELIGENTE:
        if (rolUsuario === 'jefe') {
            return <Navigate to="/team" replace />; // Elena va a su zona
        }
        return <Navigate to="/dashboard" replace />; // Kevin va a la suya
    }

    return <Outlet />;
}