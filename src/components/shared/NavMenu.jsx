import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUser, faClipboardList, faBook,
    faUserCircle, faUserShield, faUsers
} from '@fortawesome/free-solid-svg-icons';

export default function NavMenu() {
    const [active, setActive]     = useState(null);
    const [showLabel, setShowLabel] = useState(false);

    const storedUser = sessionStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const rol  = user?.cuenta?.rol || 'enfermero';

    // ACL CORREGIDA: Marcus es 'admin', no 'superadmin'
    const esAdmin = rol === 'admin';
    const esJefe  = rol === 'jefe';
    const esEnfermero = rol === 'enfermero';

    const handleClick = (option) => {
        setActive(option);
        setShowLabel(true);
    };

    useEffect(() => {
        if (showLabel) {
            const timer = setTimeout(() => setShowLabel(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [active, showLabel]);

    const getNavLinkClass = (isActive) =>
        `p-2 xl:p-4 rounded-full backdrop-blur-lg border border-white/20 shadow-lg transition-all duration-300
        ${isActive
            ? 'bg-primario text-white border-primario'
            : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'}`;

    const NavItem = ({ to, icon, label }) => (
        <NavLink to={to} className={({ isActive }) => getNavLinkClass(isActive)}
                  title={label} onClick={() => handleClick(to)}>
            <span className="flex justify-center items-center w-8 h-8">
                <FontAwesomeIcon size="lg" icon={icon} />
            </span>
            <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                {label}
            </span>
            {active === to && showLabel && (
                <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded animate-fadeOut">
                    {label}
                </span>
            )}
        </NavLink>
    );

    return (
        <nav className="flex gap-4 md:gap-10 text-gray-500 max-lg:backdrop-blur-lg max-lg:border max-lg:border-white/20 max-lg:rounded-full max-lg:p-4 max-lg:shadow-lg">

            {/* --- VISTA PARA ENFERMEROS Y JEFES --- */}
            {(esEnfermero) && (
                <>
                    <NavItem to="/dashboard"   icon={faHome}          label="Dashboard"  />
                    <NavItem to="/patients"    icon={faUser}          label="Pacientes"  />
                    <NavItem to="/care-plans"  icon={faClipboardList} label="Planes"     />
                    <NavItem to="/dictionary"  icon={faBook}          label="Diccionario"/>
                </>
            )}

            {/* --- VISTA PARA JEFE (Gestionar su equipo) --- */}
            {esJefe && (
                <NavItem to="/team" icon={faUsers} label="Equipo" />
            )}

            {/* --- VISTA EXCLUSIVA PARA ADMIN (Marcus Fenix) --- */}
            {esAdmin && (
                <>
                    <NavItem to="/admin-dashboard" icon={faUserShield} label="Admin" />
                    <NavItem to="/team" icon={faUsers} label="Personal" />
                </>
            )}

            {/* Perfil — Disponible para todos */}
            <NavItem to="/profile" icon={faUserCircle} label="Perfil" />
        </nav>
    );
}