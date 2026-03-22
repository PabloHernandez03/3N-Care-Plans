import { Navigate, Outlet } from 'react-router-dom';

const ProtegerRutas = () => {
    const storedUser = sessionStorage.getItem('user'); 
    
    let user = null;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        user = null; 
    }

    if (!user || Object.keys(user).length === 0) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtegerRutas;