import { Navigate, Outlet } from 'react-router-dom';

const EnfermeroRoute = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const rol = user?.cuenta?.rol;

    if (rol !== 'enfermero') {
        if (rol === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (rol === 'jefe') return <Navigate to="/team" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default EnfermeroRoute;