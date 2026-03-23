import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Agregué faUserShield para el icono del Admin
import { faHome, faUser, faClipboardList, faBook, faUserCircle, faUserShield } from '@fortawesome/free-solid-svg-icons';

export default function NavMenu() {
    const [active, setActive] = useState(null);
    const [showLabel, setShowLabel] = useState(false);

    // 1. LEEMOS EL ROL DEL USUARIO DESDE LA SESIÓN
    const storedUser = sessionStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const rol = user?.cuenta?.rol || 'enfermero'; // Por defecto lo tratamos como enfermero

    const handleClick = (option) => {
        setActive(option);
        setShowLabel(true);
    };

    useEffect(() => {
        if (showLabel) {
            const timer = setTimeout(() => {
                setShowLabel(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [active, showLabel]);

    // Función auxiliar para no repetir tantas veces las clases de Tailwind
    const getNavLinkClass = (isActive) => `p-2 xl:p-4 rounded-full backdrop-blur-lg border border-white/20 shadow-lg transition-all duration-300 ${isActive ? 'bg-primario text-white border-primario' : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'}`;

    return (
        <nav className="flex gap-4 md:gap-10 text-gray-500 max-lg:backdrop-blur-lg max-lg:border max-lg:border-white/20 max-lg:rounded-full max-lg:p-4 max-lg:shadow-lg">
            
            {/* RUTAS EXCLUSIVAS DE ADMIN */}
            {rol === 'admin' && (
                <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) => getNavLinkClass(isActive)}
                    title="Panel de Admin"
                    onClick={() => handleClick('admin-dashboard')}
                >
                    <span className="flex justify-center items-center w-8 h-8">
                        <FontAwesomeIcon size="lg" icon={faUserShield} />
                    </span>
                    <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500 ">
                        Panel Admin
                    </span>
                    {active === 'admin-dashboard' && showLabel && (
                        <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                            Panel Admin
                        </span>
                    )}
                </NavLink>
            )}

            {/* RUTAS EXCLUSIVAS DE ENFERMEROS */}
            {rol === 'enfermero' && (
                <>
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => getNavLinkClass(isActive)}
                        title="Dashboard"
                        onClick={() => handleClick('dashboard')}
                    >
                        <span className="flex justify-center items-center w-8 h-8">
                            <FontAwesomeIcon size="lg" icon={faHome} />
                        </span>
                        <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500 ">
                            Dashboard
                        </span>
                        {active === 'dashboard' && showLabel && (
                            <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                                Dashboard
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/patients"
                        className={({ isActive }) => getNavLinkClass(isActive)}
                        title="Pacientes"
                        onClick={() => handleClick('patients')}
                    >
                        <span className="flex justify-center items-center w-8 h-8">
                            <FontAwesomeIcon size="lg" icon={faUser} />
                        </span>
                        <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                            Pacientes
                        </span>
                        {active === 'patients' && showLabel && (
                            <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                                Pacientes
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/care-plans"
                        className={({ isActive }) => getNavLinkClass(isActive)}
                        title="Planes de Cuidado"
                        onClick={() => handleClick('care-plans')}
                    >
                        <span className="flex justify-center items-center w-8 h-8">
                            <FontAwesomeIcon size="lg" icon={faClipboardList} />
                        </span>
                        <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                            Planes
                        </span>
                        {active === 'care-plans' && showLabel && (
                            <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                                Planes
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/dictionary"
                        className={({ isActive }) => getNavLinkClass(isActive)}
                        title="Diccionario"
                        onClick={() => handleClick('dictionary')}
                    >
                        <span className="flex justify-center items-center w-8 h-8">
                            <FontAwesomeIcon size="lg" icon={faBook} />
                        </span>
                        <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                            Diccionario
                        </span>
                        {active === 'dictionary' && showLabel && (
                            <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                                Diccionario
                            </span>
                        )}
                    </NavLink>
                </>
            )}

            {/* RUTAS Compartidas */}
            <NavLink
                to="/profile"
                className={({ isActive }) => getNavLinkClass(isActive)}
                title="Perfil"
                onClick={() => handleClick('profile')}
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faUserCircle} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Perfil
                </span>
                {active === 'profile' && showLabel && (
                    <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                        Perfil
                    </span>
                )}
            </NavLink>
        </nav>
    );
}