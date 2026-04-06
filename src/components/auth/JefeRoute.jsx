// src/components/auth/JefeRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const JefeRoute = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const rol = user?.cuenta?.rol;

    // Permitimos el paso si es jefe O admin
    if (rol === 'jefe' || rol === 'admin') {
        return <Outlet />;
    }

    return <Navigate to="/" replace />;
};

export default JefeRoute;