import { NavLink } from 'react-router-dom';

export default function NavMenu() {
    return (
        
        <nav className="flex gap-4 md:gap-10 text-gray-500 max-lg:backdrop-blur-lg max-lg:border max-lg:border-white/20 max-lg:rounded-full max-lg:p-4 max-lg:shadow-lg z-10">
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
                        : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:scale-105 hover:shadow-xl'
                    }`
                }
            >
                Inicio
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
                        : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:scale-105 hover:shadow-xl'
                    }`
                }
            >
                Pacientes
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
                        : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:scale-105 hover:shadow-xl'
                    }`
                }
                title="Planes de Cuidado"
                onClick={() => handleClick('care-plans')}
            >
                <span className="flex justify-center items-center w-8 h-8">
                    <FontAwesomeIcon size="lg" icon={faClipboardList} />
                </span>
                <span className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium whitespace-nowrap text-gray-500">
                    Planes de Cuidado
                </span>
                {/* Tooltip para pantallas pequeñas */}
                { active === 'care-plans' && showLabel && (
                    <span className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 text-primario text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fadeOut">
                        Planes
                    </span>
                )}
            </NavLink>
            <NavLink
                to="/dictionary"
                className={({ isActive }) =>
                    `p-2 xl:p-4 rounded-full
                    backdrop-blur-lg
                    border border-white/20
                    shadow-lg
                    transition-all duration-300
                    ${isActive
                        ? 'bg-primario text-white border-primario'
                        : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:scale-105 hover:shadow-xl'
                    }`
                }
            >
                Planes
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
                        : 'bg-white/50 text-gray-500 hover:bg-white/70 hover:scale-105 hover:shadow-xl'
                    }`
                }
            >
                Perfil
            </NavLink>
        </nav>
    );
}