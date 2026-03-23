import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
    const userString = sessionStorage.getItem('user');
    
    if (!userString) {
        return <Navigate to="/" replace />;
    }

    const user = JSON.parse(userString);

    // REGLA DE ACCESO (ACL): Si no es admin, lo rebotamos a su dashboard normal
    if (user.cuenta.rol !== 'admin') {
        console.warn("Intento de acceso no autorizado. Redirigiendo a VLAN de Enfermería.");
        return <Navigate to="/dashboard" replace />;
    }

    // Si es admin, le abrimos el puerto y mostramos la vista
    return <Outlet />;
}