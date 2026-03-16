import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faClipboardList, faUserCircle } from '@fortawesome/free-solid-svg-icons';

export default function NavMenu() {
    return (
        
        <nav className="flex gap-10 text-gray-500 max-lg:backdrop-blur-lg max-lg:border max-lg:border-white/20 max-lg:rounded-full max-lg:p-4 max-lg:shadow-lg">
            <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                    `p-2 xl:p-4 rounded-full
                    backdrop-blur-lg
                    border border-white/20
                    shadow-lg
                    transition-all duration-300
                    ${isActive
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'
                    }`
                }
                title="Dashboard"
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faHome} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Dashboard
                </span>
            </NavLink>
            <NavLink
                to="/patients"
                className={({ isActive }) =>
                    `p-2 xl:p-4 rounded-full
                    backdrop-blur-lg
                    border border-white/20
                    shadow-lg
                    transition-all duration-300
                    ${isActive
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'
                    }`
                }
                title="Pacientes"
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faUser} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Pacientes
                </span>
            </NavLink>
            <NavLink
                to="/care-plans"
                className={({ isActive }) =>
                    `p-2 xl:p-4 rounded-full
                    backdrop-blur-lg
                    border border-white/20
                    shadow-lg
                    transition-all duration-300
                    ${isActive
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'
                    }`
                }
                title="Planes de Cuidado"
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faClipboardList} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Planes de Cuidado
                </span>
            </NavLink>
            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `p-2 xl:p-4 rounded-full
                    backdrop-blur-lg
                    border border-white/20
                    shadow-lg
                    transition-all duration-300
                    ${isActive
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white/10 text-gray-500 hover:bg-white/20 hover:scale-105 hover:shadow-xl'
                    }`
                }
                title="Perfil"
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faUserCircle} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Perfil
                </span>
            </NavLink>
        </nav>
    );
}