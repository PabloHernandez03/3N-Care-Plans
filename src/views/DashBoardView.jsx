import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faUserCheck, faClipboardList,
    faDroplet, faVenusMars, faChartBar,
    faSpinner, faArrowTrendUp, faDna
} from '@fortawesome/free-solid-svg-icons';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    CartesianGrid, AreaChart, Area
} from 'recharts';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const nac = new Date(fechaNacimiento);
    if (isNaN(nac)) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

function getInitials(nombre = {}) {
    const n  = nombre.nombre?.[0]         || '';
    const ap = nombre.apellidoPaterno?.[0] || '';
    return (ap + n).toUpperCase() || '?';
}

function getRangoEdad(edad) {
    if (edad === null) return null;
    if (edad <= 12)  return '0–12';
    if (edad <= 18)  return '13–18';
    if (edad <= 40)  return '19–40';
    if (edad <= 60)  return '41–60';
    return '60+';
}

const RANGOS_ORDEN = ['0–12', '13–18', '19–40', '41–60', '60+'];
const RANGOS_LABEL = {
    '0–12':  'Niños',
    '13–18': 'Adolescentes',
    '19–40': 'Adultos jóvenes',
    '41–60': 'Adultos',
    '60+':   'Adultos mayores',
};

const BLOOD_COLORS = {
    'O+': '#2563eb', 'O-': '#1d4ed8',
    'A+': '#dc2626', 'A-': '#b91c1c',
    'B+': '#d97706', 'B-': '#b45309',
    'AB+':'#7c3aed', 'AB-':'#6d28d9',
};

const SEX_COLORS  = { M: '#2563eb', F: '#ec4899', N: '#6b7280' };
const AREA_COLOR  = '#0f3460';
const AGE_COLORS  = ['#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#1d4ed8'];

/* ─── Tooltip personalizado ──────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: <span className="font-bold">{p.value}{suffix}</span>
                </p>
            ))}
        </div>
    );
};

/* ─── Sub-componentes ────────────────────────────────────────────────────── */

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon, title, children }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primario flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={icon} className="text-white text-xs" />
            </div>
            <h2 className="text-sm font-semibold text-[#0f3460] uppercase tracking-wide">{title}</h2>
        </div>
        {children}
    </div>
);

function StatCard({ icon, label, value, sub, color }) {
    const colors = {
        blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
        teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   val: 'text-teal-700'   },
        indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', val: 'text-indigo-700' },
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

/* ─── Vista principal ────────────────────────────────────────────────────── */

export default function DashboardView() {
    const [patients,  setPatients]  = useState([]);
    const [withAdm,   setWithAdm]   = useState([]);
    const [carePlans, setCarePlans] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [tendencia, setTendencia] = useState('mes');

    useEffect(() => {
        const api = import.meta.env.VITE_API_URL;
        Promise.all([
            axios.get(`${api}/api/patients`).catch(() => ({ data: [] })),
            axios.get(`${api}/api/patients/with-admission`).catch(() => ({ data: [] })),
            axios.get(`${api}/api/careplans`).catch(() => ({ data: [] })),
        ]).then(([pRes, aRes, cRes]) => {
            setPatients(pRes.data  || []);
            setWithAdm(aRes.data   || []);
            setCarePlans(cRes.data || []);
        }).finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const total   = patients.length;
        const activos = withAdm.filter(p => p.ultimoIngreso?.estado === 'Activo').length;
        const planes  = Array.isArray(carePlans) ? carePlans.length : 0;

        /* ── Sexo ── */
        const sexoMap = { M: 0, F: 0, N: 0 };
        patients.forEach(p => {
            const s = p.demograficos?.sexo;
            if (s in sexoMap) sexoMap[s]++;
        });
        const sexoData = [
            { name: 'Masculino', value: sexoMap.M, key: 'M' },
            { name: 'Femenino',  value: sexoMap.F, key: 'F' },
            { name: 'Otro',      value: sexoMap.N, key: 'N' },
        ].filter(d => d.value > 0);

        /* ── Sangre ── */
        const sangreMap = {};
        patients.forEach(p => {
            const t = p.demograficos?.tipoSangre;
            if (t) sangreMap[t] = (sangreMap[t] || 0) + 1;
        });
        const sangreData = Object.entries(sangreMap)
            .map(([name, value]) => ({
                name,
                value,
                pct: total > 0 ? Math.round((value / total) * 100) : 0,
            }))
            .sort((a, b) => b.value - a.value);

        /* ── Rangos de edad ── */
        const rangosMap = Object.fromEntries(RANGOS_ORDEN.map(r => [r, 0]));
        patients.forEach(p => {
            const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento));
            if (r) rangosMap[r]++;
        });
        const edadData = RANGOS_ORDEN.map(r => ({
            name:  r,
            label: RANGOS_LABEL[r],
            value: rangosMap[r],
        }));

        /* ── Edad × Sexo ── */
        const edadSexoMap = Object.fromEntries(
            RANGOS_ORDEN.map(r => [r, { M: 0, F: 0, N: 0 }])
        );
        patients.forEach(p => {
            const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento));
            const s = p.demograficos?.sexo;
            if (r && s in edadSexoMap[r]) edadSexoMap[r][s]++;
        });
        const edadSexoData = RANGOS_ORDEN.map(r => ({
            name:      r,
            Masculino: edadSexoMap[r].M,
            Femenino:  edadSexoMap[r].F,
            Otro:      edadSexoMap[r].N,
        }));

        /* ── Tendencia de registros ── */
        const ahora  = new Date();
        const keyFn  = {
            dia:    (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            semana: (d) => {
                const startOfYear = new Date(d.getFullYear(), 0, 1);
                const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                return `Sem ${week}`;
            },
            mes:    (d) => d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        };
        const nSlots = { dia: 14, semana: 8, mes: 6 }[tendencia];
        const tendMap = {};
        for (let i = nSlots - 1; i >= 0; i--) {
            const d = new Date(ahora);
            if (tendencia === 'dia')    d.setDate(d.getDate() - i);
            if (tendencia === 'semana') d.setDate(d.getDate() - i * 7);
            if (tendencia === 'mes')    d.setMonth(d.getMonth() - i);
            tendMap[keyFn[tendencia](d)] = 0;
        }
        patients.forEach(p => {
            if (!p.fechaRegistro && !p.createdAt) return;
            const d   = new Date(p.fechaRegistro || p.createdAt);
            const key = keyFn[tendencia](d);
            if (key in tendMap) tendMap[key]++;
        });
        const tendenciaData = Object.entries(tendMap).map(([name, value]) => ({ name, value }));

        /* ── Recientes ── */
        const recientes = [...patients]
            .sort((a, b) => new Date(b.fechaRegistro || b.createdAt || 0) - new Date(a.fechaRegistro || a.createdAt || 0))
            .slice(0, 5);

        return { total, activos, planes, sexoData, sangreData, edadData, edadSexoData, tendenciaData, recientes };
    }, [patients, withAdm, carePlans, tendencia]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-3" />
            <span className="text-sm">Cargando panel…</span>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">

            {/* Encabezado */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Panel de control</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={faUsers}        label="Pacientes registrados" value={stats.total}   sub="Total en el sistema"   color="blue"   />
                <StatCard icon={faUserCheck}     label="Ingresos activos"      value={stats.activos} sub="Con admisión en curso" color="teal"   />
                <StatCard icon={faClipboardList} label="Planes de cuidado"     value={stats.planes}  sub="Registrados"           color="indigo" />
            </div>

            {/* Fila 1: Tendencia + Edad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Tendencia */}
                <Card className="p-5">
                    <SectionHeader icon={faArrowTrendUp} title="Tendencia de registros">
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            {[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([key, label]) => (
                                <button key={key} onClick={() => setTendencia(key)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all
                                            ${tendencia === key
                                                ? 'bg-white text-[#0f3460] shadow-sm'
                                                : 'text-gray-400 hover:text-gray-600'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </SectionHeader>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={stats.tendenciaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={AREA_COLOR} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0}    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip suffix=" pacientes" />} />
                            <Area type="monotone" dataKey="value" name="Registros"
                                  stroke={AREA_COLOR} strokeWidth={2}
                                  fill="url(#areaGrad)" dot={{ r: 3, fill: AREA_COLOR }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Distribución por edad */}
                <Card className="p-5">
                    <SectionHeader icon={faChartBar} title="Distribución por edad" />
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={stats.edadData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                                        <p className="font-bold text-gray-700">{d.label}</p>
                                        <p className="text-blue-600">{d.value} pacientes</p>
                                    </div>
                                );
                            }} />
                            <Bar dataKey="value" name="Pacientes" radius={[4, 4, 0, 0]}>
                                {stats.edadData.map((_, i) => (
                                    <Cell key={i} fill={AGE_COLORS[i]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    {/* Leyenda rangos */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {stats.edadData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: AGE_COLORS[i] }} />
                                <span className="text-gray-500">{d.name} <span className="text-gray-400">({RANGOS_LABEL[d.name]})</span></span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Fila 2: Sangre + Sexo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Tipo de sangre */}
                <Card className="p-5">
                    <SectionHeader icon={faDroplet} title="Tipo de sangre" />
                    {stats.sangreData.length === 0
                        ? <p className="text-xs text-gray-400 italic">Sin datos</p>
                        : <>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={stats.sangreData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                                                <p className="font-bold" style={{ color: BLOOD_COLORS[label] || '#6b7280' }}>{label}</p>
                                                <p className="text-gray-600">{d.value} pacientes · <span className="font-bold">{d.pct}%</span></p>
                                            </div>
                                        );
                                    }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {stats.sangreData.map((d, i) => (
                                            <Cell key={i} fill={BLOOD_COLORS[d.name] || '#6b7280'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                {stats.sangreData.map(d => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: BLOOD_COLORS[d.name] || '#6b7280' }} />
                                        <span className="text-gray-600 font-semibold">{d.name}</span>
                                        <span className="text-gray-400">{d.pct}%</span>
                                    </div>
                                ))}
                            </div>
                          </>
                    }
                </Card>

                {/* Sexo */}
                <Card className="p-5">
                    <SectionHeader icon={faVenusMars} title="Distribución por sexo" />
                    {stats.sexoData.length === 0
                        ? <p className="text-xs text-gray-400 italic">Sin datos</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={stats.sexoData} cx="50%" cy="50%"
                                     innerRadius={55} outerRadius={80}
                                     paddingAngle={3} dataKey="value">
                                    {stats.sexoData.map((d, i) => (
                                        <Cell key={i} fill={SEX_COLORS[d.key] || '#6b7280'} />
                                    ))}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d   = payload[0];
                                    const pct = stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0;
                                    return (
                                        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                                            <p className="font-bold text-gray-700">{d.name}</p>
                                            <p style={{ color: SEX_COLORS[d.payload.key] }}>
                                                {d.value} pacientes · <span className="font-bold">{pct}%</span>
                                            </p>
                                        </div>
                                    );
                                }} />
                                <Legend iconType="circle" iconSize={10}
                                        formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                    }
                </Card>
            </div>

            {/* Fila 3: Edad × Sexo */}
            <Card className="p-5">
                <SectionHeader icon={faDna} title="Cruce edad × sexo" />
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.edadSexoData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={10}
                                formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                        <Bar dataKey="Masculino" stackId="a" fill={SEX_COLORS.M} />
                        <Bar dataKey="Femenino"  stackId="a" fill={SEX_COLORS.F} />
                        <Bar dataKey="Otro"      stackId="a" fill={SEX_COLORS.N} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Pacientes recientes */}
            <Card className="p-5">
                <SectionHeader icon={faArrowTrendUp} title="Pacientes recientes" />
                {stats.recientes.length === 0
                    ? <p className="text-xs text-gray-400 italic">Sin pacientes registrados</p>
                    : <div className="divide-y divide-gray-50">
                        {stats.recientes.map(p => {
                            const sexo   = p.demograficos?.sexo;
                            const edad   = calcularEdad(p.demograficos?.fechaNacimiento);
                            const sangre = p.demograficos?.tipoSangre;
                            const avatarBg = sexo === 'M'
                                ? 'bg-blue-100 text-blue-600'
                                : sexo === 'F'
                                ? 'bg-pink-100 text-pink-600'
                                : 'bg-gray-100 text-gray-500';
                            const nombreCompleto = [
                                p.nombre?.apellidoPaterno,
                                p.nombre?.apellidoMaterno,
                                p.nombre?.nombre,
                            ].filter(Boolean).join(' ');

                            return (
                                <div key={p._id} className="flex items-center gap-3 py-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg}`}>
                                        {getInitials(p.nombre)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{nombreCompleto}</p>
                                        <p className="text-xs text-gray-400">
                                            {sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Otro'}
                                            {edad !== null && ` · ${edad} años`}
                                        </p>
                                    </div>
                                    {sangre && (
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
                                              style={{
                                                  background: (BLOOD_COLORS[sangre] || '#6b7280') + '20',
                                                  color: BLOOD_COLORS[sangre] || '#6b7280',
                                              }}>
                                            {sangre}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-300 font-mono shrink-0">
                                        #{p._id?.slice(-5).toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                      </div>
                }
            </Card>
        </div>
    );
}