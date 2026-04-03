import { useEffect, useState, useMemo } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, faUserCheck, faUserXmark, 
    faSpinner, faUserPlus 
} from '@fortawesome/free-solid-svg-icons';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon, title, colorClass = "bg-[#0f3460]" }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
            <FontAwesomeIcon icon={icon} className="text-white text-xs" />
        </div>
        <h2 className="text-sm font-semibold text-[#0f3460] uppercase tracking-wide">{title}</h2>
    </div>
);

function StatCard({ icon, label, value, sub, color }) {
    const colors = {
        blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
        green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
        red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700'    },
    };
    const c = colors[color] || colors.blue;
    return (
        <Card className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                <FontAwesomeIcon icon={icon} className={`text-xl ${c.icon}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">{label}</p>
                <p className={`text-2xl font-bold ${c.val} leading-tight`}>{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </Card>
    );
}

const StaffTable = ({ data, emptyMessage, statusColor }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="text-[10px] text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-2 font-semibold">Enfermero</th>
                    <th className="pb-2 font-semibold">Área / Turno</th>
                    <th className="pb-2 text-right">Acción</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.length === 0 ? (
                    <tr><td colSpan="3" className="py-4 text-center text-xs text-gray-400 italic">{emptyMessage}</td></tr>
                ) : (
                    data.map(enf => (
                        <tr key={enf._id} className="text-sm hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-2">
                                <p className="font-bold text-gray-700">{enf.identidad.nombre} {enf.identidad.apellido_paterno}</p>
                                <p className="text-[10px] text-gray-400 uppercase">{enf.identidad.cedula_profesional}</p>
                            </td>
                            <td className="py-3 px-2">
                                <p className="text-xs text-gray-600">{enf.datos_laborales.area_asignada}</p>
                                <p className="text-[10px] font-bold text-blue-500 uppercase">{enf.datos_laborales.turno}</p>
                            </td>
                            <td className="py-3 px-2 text-right">
                                <button className={`text-xs font-bold hover:underline ${statusColor}`}>
                                    Gestionar
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

export default function AdminDashboardView() {
    const [enfermeros, setEnfermeros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const api = import.meta.env.VITE_API_URL;
        axios.get(`${api}/api/enfermero/todos`)
            .then(res => setEnfermeros(res.data || []))
            .catch(err => console.error("Error obteniendo personal:", err))
            .finally(() => setLoading(false));
    }, []);

    const { activos, inactivos } = useMemo(() => {
        return {
            activos: enfermeros.filter(e => e.datos_laborales?.esta_activo === true),
            inactivos: enfermeros.filter(e => e.datos_laborales?.esta_activo === false)
        };
    }, [enfermeros]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen text-gray-400 bg-gray-50">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-3" />
            <span className="text-sm font-semibold uppercase tracking-widest">Cargando panel de control...</span>
        </div>
    );

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen pb-20">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Administración de Personal</h1>
                    <p className="text-sm text-gray-400">Control de accesos y estatus laboral</p>
                </div>
                <button className="bg-[#0f3460] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-blue-900 transition-all flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faUserPlus} />
                    Registrar Enfermero
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={faUsers} label="Total Registrados" value={enfermeros.length} color="blue" />
                <StatCard icon={faUserCheck} label="Personal Activo" value={activos.length} color="green" />
                <StatCard icon={faUserXmark} label="Personal Inactivo" value={inactivos.length} color="red" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                
                {/* PERSONAL ACTIVO */}
                <Card className="p-6 border-l-4 border-l-green-500">
                    <SectionHeader icon={faUserCheck} title="Personal en Turno (Activos)" colorClass="bg-green-500" />
                    <StaffTable 
                        data={activos} 
                        emptyMessage="No hay personal activo actualmente." 
                        statusColor="text-green-600"
                    />
                </Card>

                {/* PERSONAL INACTIVO */}
                <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/10">
                    <SectionHeader icon={faUserXmark} title="Personal Inactivo / Suspendido" colorClass="bg-red-500" />
                    <StaffTable 
                        data={inactivos} 
                        emptyMessage="No hay personal inactivo en el sistema." 
                        statusColor="text-red-600"
                    />
                </Card>

            </div>
        </div>
    );
}