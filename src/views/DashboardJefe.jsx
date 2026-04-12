import React, { useEffect, useState, useMemo } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faUserCheck, faChartLine,
    faDroplet, faVenusMars, faChartBar,
    faSpinner, faArrowTrendUp, faDna,
    faStethoscope, faNotesMedical, faLeaf, faPills, faRotate, faBed, faHospital, faUserNurse
} from '@fortawesome/free-solid-svg-icons';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
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

function getRangoEdad(edad) {
    if (edad === null) return null;
    if (edad <= 12) return '0–12';
    if (edad <= 18) return '13–18';
    if (edad <= 40) return '19–40';
    if (edad <= 60) return '41–60';
    return '60+';
}

const RANGOS_ORDEN = ['0–12', '13–18', '19–40', '41–60', '60+'];
const RANGOS_LABEL = { '0–12': 'Niños', '13–18': 'Adolescentes', '19–40': 'Adultos jóvenes', '41–60': 'Adultos', '60+': 'Adultos mayores' };
const BLOOD_COLORS = { 'O+': '#2563eb', 'O-': '#1d4ed8', 'A+': '#dc2626', 'A-': '#b91c1c', 'B+': '#d97706', 'B-': '#b45309', 'AB+': '#7c3aed', 'AB-': '#6d28d9' };
const SEX_COLORS   = { M: '#2563eb', F: '#ec4899', N: '#6b7280' };
const AREA_COLOR   = '#0f3460';
const AGE_COLORS   = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];

/* ─── Sub-componentes ────────────────────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>
);

const SectionHeader = ({ icon, title, children }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0f3460] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={icon} className="text-white text-xs" />
            </div>
            <h2 className="text-sm font-semibold text-[#0f3460] uppercase tracking-wide">{title}</h2>
        </div>
        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }}>
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function DashboardJefe() {
    const [rawStats, setRawStats] = useState({
        patients: [],
        withAdm: [],
        admissions: [],
        diagnosticos: [],
        medicamentos: [],
        reingresos: null,
        estancia: [],
        expedientes: null,
        equipoSize: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [tendencia, setTendencia] = useState('mes');

    /* ── Cargar datos masivos ── */
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pRes, aRes, admRes, diagRes, medRes, reinRes, estRes, expRes, eqRes] = await Promise.all([
                    api.get(`/api/patients`).catch(() => ({ data: [] })),
                    api.get(`/api/patients/with-admission`).catch(() => ({ data: [] })),
                    api.get(`/api/admissions/tendencia`).catch(() => ({ data: [] })),
                    api.get(`/api/admissions/diagnosticos`).catch(() => ({ data: [] })),
                    api.get(`/api/admissions/stats/medicamentos`).catch(() => ({ data: [] })),
                    api.get(`/api/admissions/stats/reingresos`).catch(() => ({ data: { unIngreso: 0, dosIngresos: 0, tresMas: 0 } })),
                    api.get(`/api/admissions/stats/estancia`).catch(() => ({ data: [] })),
                    api.get(`/api/patients/stats/expedientes`).catch(() => ({ data: null })),
                    api.get(`/api/enfermero/equipo`).catch(() => ({ data: [] }))
                ]);

                setRawStats({
                    patients: pRes.data || [],
                    withAdm: aRes.data || [],
                    admissions: admRes.data || [],
                    diagnosticos: diagRes.data || [],
                    medicamentos: medRes.data || [],
                    reingresos: reinRes.data,
                    estancia: estRes.data || [],
                    expedientes: expRes.data || null,
                    equipoSize: (eqRes.data || []).length
                });
            } catch (error) {
                console.error("Error cargando datos de jefatura", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /* ── Stats calculados locales (Demografía) ── */
    const stats = useMemo(() => {
        const total = rawStats.patients.length;
        const activos = rawStats.withAdm.filter(p => p.ultimoIngreso?.estado === 'Activo').length;
        
        // Sexo
        const sexoMap = { M: 0, F: 0, N: 0 };
        rawStats.patients.forEach(p => { const s = p.demograficos?.sexo; if (s in sexoMap) sexoMap[s]++; });
        const sexoData = [
            { name: 'Masculino', value: sexoMap.M, key: 'M' },
            { name: 'Femenino',  value: sexoMap.F, key: 'F' },
            { name: 'Otro',      value: sexoMap.N, key: 'N' },
        ].filter(d => d.value > 0);

        // Sangre
        const sangreMap = {};
        rawStats.patients.forEach(p => { const t = p.demograficos?.tipoSangre; if (t) sangreMap[t] = (sangreMap[t] || 0) + 1; });
        const sangreData = Object.entries(sangreMap)
            .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
            .sort((a, b) => b.value - a.value);

        // Edad
        const rangosMap = Object.fromEntries(RANGOS_ORDEN.map(r => [r, 0]));
        rawStats.patients.forEach(p => { const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento)); if (r) rangosMap[r]++; });
        const edadData = RANGOS_ORDEN.map(r => ({ name: r, label: RANGOS_LABEL[r], value: rangosMap[r] }));

        // Cruce Edad x Sexo
        const edadSexoMap = Object.fromEntries(RANGOS_ORDEN.map(r => [r, { M: 0, F: 0, N: 0 }]));
        rawStats.patients.forEach(p => {
            const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento));
            const s = p.demograficos?.sexo;
            if (r && s in edadSexoMap[r]) edadSexoMap[r][s]++;
        });
        const edadSexoData = RANGOS_ORDEN.map(r => ({ name: r, Masculino: edadSexoMap[r].M, Femenino: edadSexoMap[r].F, Otro: edadSexoMap[r].N }));

        // Tendencia + Regresión Lineal
        const ahora = new Date();
        const keyFn = {
            dia:    (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            semana: (d) => { const s = new Date(d.getFullYear(), 0, 1); const w = Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7); return `Sem ${w}`; },
            mes:    (d) => d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        };
        const nSlots = { dia: 14, semana: 8, mes: 6 }[tendencia];
        const nPredict = { dia: 3,  semana: 2, mes: 2  }[tendencia];
        const tendMap = {};

        for (let i = nSlots - 1; i >= 0; i--) {
            const d = new Date(ahora);
            if (tendencia === 'dia')    d.setDate(d.getDate() - i);
            if (tendencia === 'semana') d.setDate(d.getDate() - i * 7);
            if (tendencia === 'mes')    d.setMonth(d.getMonth() - i);
            tendMap[keyFn[tendencia](d)] = 0;
        }

        rawStats.admissions.forEach(a => {
            const f = a.fecha || a.ingreso?.fecha;
            if (!f) return;
            const dateObj = new Date(f);
            if (isNaN(dateObj)) return;
            const key = keyFn[tendencia](dateObj);
            if (key in tendMap) tendMap[key]++;
        });

        const historico = Object.entries(tendMap).map(([name, ingresos], idx) => ({ name, ingresos, idx, prediccion: null }));
        const n = historico.length;
        const xs = historico.map(d => d.idx), ys = historico.map(d => d.ingresos);
        const sumX = xs.reduce((a, b) => a + b, 0), sumY = ys.reduce((a, b) => a + b, 0);
        const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0), sumX2 = xs.reduce((s, x) => s + x * x, 0);
        const denom = n * sumX2 - sumX * sumX;
        const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
        const inter = (sumY - slope * sumX) / n;
        const futuros = [];

        for (let i = 1; i <= nPredict + 1; i++) {
            const d = new Date(ahora);
            if (tendencia === 'dia')    d.setDate(d.getDate() + i);
            if (tendencia === 'semana') d.setDate(d.getDate() + i * 7);
            if (tendencia === 'mes')    d.setMonth(d.getMonth() + i);
            futuros.push({ name: keyFn[tendencia](d), ingresos: null, prediccion: Math.max(0, Math.round(slope * (n - 1 + i) + inter)), idx: n - 1 + i });
        }
        
        const prediccionConexion = Math.max(0, Math.round(slope * (n - 1) + inter));
        const tendenciaData = [...historico, { ingresos: null, prediccion: prediccionConexion }, ...futuros];

        return { total, activos, sexoData, sangreData, edadData, edadSexoData, tendenciaData };
    }, [rawStats, tendencia]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[#16a09e]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl mb-4" />
                <p className="font-semibold text-gray-500">Recopilando datos de la institución...</p>
            </div>
        );
    }

    const { diagnosticos, medicamentos, estancia, reingresos, expedientes, equipoSize } = rawStats;
    const maxDiag = Math.max(...diagnosticos.map(d => d.value), 1);
    const maxMed = Math.max(...medicamentos.map(m => m.value), 1);
    const maxEstancia = Math.max(...estancia.map(e => e.promedio), 1);
    const maxAnt = Math.max(...(expedientes?.antecedentes || []).map(a => a.value), 1);

    return (
        <div className="space-y-6 pb-10 font-sans animate-fade-in">
            
            {/* ── ENCABEZADO ── */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#0f3460]/10">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f3460] tracking-tight flex items-center gap-3">
                        <FontAwesomeIcon icon={faHospital} className="text-[#16a09e]" />
                        Inteligencia Institucional
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Análisis macro de pacientes, estancias y tratamientos de tu hospital.
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-400">
                        {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ── TARJETAS TOTALES ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 flex items-center gap-4 bg-white">
                    <div className={`w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0`}>
                        <FontAwesomeIcon icon={faUsers} className="text-xl text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">Pacientes Históricos</p>
                        <p className="text-2xl font-bold text-blue-700 leading-tight">{stats.total}</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-4 bg-white">
                    <div className={`w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0`}>
                        <FontAwesomeIcon icon={faUserCheck} className="text-xl text-teal-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">Ingresos Activos</p>
                        <p className="text-2xl font-bold text-teal-700 leading-tight">{stats.activos}</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-4 bg-white">
                    <div className={`w-12 h-12 rounded-xl bg-[#0f3460]/10 flex items-center justify-center shrink-0`}>
                        <FontAwesomeIcon icon={faUserNurse} className="text-xl text-[#0f3460]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 truncate">Equipo de Enfermería</p>
                        <p className="text-2xl font-bold text-[#0f3460] leading-tight">{equipoSize}</p>
                    </div>
                </Card>
            </div>

            {/* ── TENDENCIA DE INGRESOS (Ancho completo) ── */}
            <Card className="p-5">
                <SectionHeader icon={faArrowTrendUp} title="Volumen de Admisiones Histórico y Proyección">
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        {[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([key, label]) => (
                            <button key={key} onClick={() => setTendencia(key)}
                                    className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all
                                        ${tendencia === key ? 'bg-white text-[#0f3460] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </SectionHeader>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.tendenciaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={AREA_COLOR} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#16a09e" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#16a09e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const ing  = payload.find(p => p.dataKey === 'ingresos'   && p.value != null);
                            const pred = payload.find(p => p.dataKey === 'prediccion' && p.value != null);
                            return (
                                <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
                                    <p className="font-semibold text-gray-700 mb-2 border-b border-gray-100 pb-1">{label}</p>
                                    {ing  && <p style={{ color: AREA_COLOR }} className="flex justify-between gap-4">Ingresos reales: <span className="font-bold">{ing.value}</span></p>}
                                    {pred && <p style={{ color: '#16a09e' }} className="flex justify-between gap-4">Proyección: <span className="font-bold">{pred.value}</span></p>}
                                </div>
                            );
                        }} />
                        <Area type="monotone" dataKey="ingresos"   stroke={AREA_COLOR} strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: AREA_COLOR }} connectNulls={false} />
                        <Area type="monotone" dataKey="prediccion" stroke="#16a09e" strokeWidth={2} strokeDasharray="5 4" fill="url(#predGrad)" dot={{ r: 3, fill: '#16a09e', strokeWidth: 0 }} connectNulls={true} />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-8 h-1 bg-[#0f3460] inline-block rounded" /> Registros confirmados
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-8 border-t-2 border-dashed border-[#16a09e] inline-block" /> Proyección estimada
                    </div>
                </div>
            </Card>

            {/* ── BLOQUE CLÍNICO: Diagnósticos, Medicamentos, Antecedentes y Reingresos ── */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">
                

                {/* Fila de Datos Clínicos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Diagnósticos */}
                    <Card className="p-5 border-none shadow-sm">
                        <SectionHeader icon={faStethoscope} title="Diagnósticos Frecuentes" />
                        {diagnosticos.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-10">Sin datos registrados.</p>
                        ) : (
                            <div className="space-y-5">
                                {diagnosticos.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-[#16a09e]">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-[#16a09e] h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxDiag) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Antecedentes patológicos */}
                    <Card className="p-5 border-none shadow-sm">
                        <SectionHeader icon={faNotesMedical} title="Antecedentes Comunes" />
                        {!expedientes?.antecedentes?.length ? (
                            <p className="text-sm text-gray-400 italic text-center py-10">Sin datos registrados.</p>
                        ) : (
                            <div className="space-y-5">
                                {expedientes.antecedentes.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-red-500">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxAnt) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Medicamentos */}
                    <Card className="p-5 border-none shadow-sm">
                        <SectionHeader icon={faPills} title="Farmacología (Top 5)" />
                        {medicamentos.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-10">Sin datos registrados.</p>
                        ) : (
                            <div className="space-y-5">
                                {medicamentos.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-indigo-500">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxMed) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                        {reingresos && (
                        <Card className="p-5">
                            <SectionHeader icon={faRotate} title="Reingresos" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    ['1 ingreso',   reingresos.unIngreso,   'bg-green-50  text-green-700',  'Primer ingreso'],
                                    ['2 ingresos',  reingresos.dosIngresos, 'bg-amber-50  text-amber-700',  'Reingresó una vez'],
                                    ['3+ ingresos', reingresos.tresMas,     'bg-red-50    text-red-700',    'Reingresos múltiples'],
                                ].map(([label, value, cls, sub]) => (
                                    <div key={label} className={`rounded-xl p-4 text-center border border-white/50 ${cls}`}>
                                    <p className="text-3xl font-bold">{value}</p>
                                    <p className="text-xs font-bold uppercase tracking-wide mt-1">{label}</p>
                                    <p className="text-xs opacity-70 mt-0.5 hidden md:block">{sub}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {/* ── FIN DEL BLOQUE CLÍNICO ── */}

            {/* ── DEMOGRAFÍA Y ESTANCIA ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* ── EDAD ── */}
                <Card className="p-5">
                    <SectionHeader icon={faChartBar} title="Pirámide de Edades" />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.edadData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm"><p className="font-bold text-gray-700">{d.label}</p><p className="text-blue-600">{d.value} pacientes</p></div>;
                            }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {stats.edadData.map((_, i) => <Cell key={i} fill={AGE_COLORS[i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* ── SANGRE ── */}
                <Card className="p-5">
                    <SectionHeader icon={faDroplet} title="Tipo de sangre" />
                    {stats.sangreData.length === 0
                        ? <p className="text-sm text-gray-400 italic text-center py-10">Sin datos registrados.</p>
                        : <>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={stats.sangreData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm"><p className="font-bold" style={{ color: BLOOD_COLORS[label] || '#6b7280' }}>{label}</p><p className="text-gray-600">{d.value} pacientes · <span className="font-bold">{d.pct}%</span></p></div>;
                                    }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {stats.sangreData.map((d, i) => <Cell key={i} fill={BLOOD_COLORS[d.name] || '#6b7280'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                                {stats.sangreData.map(d => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-sm">
                                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: BLOOD_COLORS[d.name] || '#6b7280' }} />
                                        <span className="text-gray-600 font-semibold">{d.name}</span>
                                        <span className="text-gray-400">({d.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    }
                </Card>

                {/* ── SEXO ── */}
                <Card className="p-5">
                    <SectionHeader icon={faVenusMars} title="Distribución por sexo" />
                    {stats.sexoData.length === 0
                        ? <p className="text-sm text-gray-400 italic text-center py-10">Sin datos registrados.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={stats.sexoData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {stats.sexoData.map((d, i) => <Cell key={i} fill={SEX_COLORS[d.key] || '#6b7280'} />)}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0];
                                    const pct = stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0;
                                    return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm"><p className="font-bold text-gray-700">{d.name}</p><p style={{ color: SEX_COLORS[d.payload.key] }}>{d.value} pacientes · <span className="font-bold">{pct}%</span></p></div>;
                                }} />
                                <Legend iconType="circle" iconSize={12} wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </Card>

                {/* ── EDAD X SEXO ── */}
                <Card className="p-5">
                    <SectionHeader icon={faDna} title="Cruce edad × sexo" />
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.edadSexoData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={12} wrapperStyle={{ fontSize: '14px', color: '#4b5563' }} />
                            <Bar dataKey="Masculino" stackId="a" fill={SEX_COLORS.M} />
                            <Bar dataKey="Femenino"  stackId="a" fill={SEX_COLORS.F} />
                            <Bar dataKey="Otro"      stackId="a" fill={SEX_COLORS.N} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* ── HÁBITOS ── */}
            {expedientes?.habitos && (
                <Card className="p-6 bg-white border border-gray-200">
                    <SectionHeader icon={faLeaf} title="Hábitos de la Población Hospitalaria" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-4">
                        {[
                            ['Tabaquismo',  expedientes.habitos.tabaquismo,  { No: '#22c55e', Exfumador: '#f59e0b', Sí: '#ef4444' }],
                            ['Alcoholismo', expedientes.habitos.alcoholismo, { No: '#22c55e', Social: '#f59e0b',    Habitual: '#ef4444' }],
                            ['Alimentación',expedientes.habitos.alimentacion,{ Balanceada: '#22c55e', Deficiente: '#f59e0b', Hipergrasas: '#ef4444' }],
                        ].map(([title, data, colors]) => {
                            const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
                            const total = chartData.reduce((s, d) => s + d.value, 0);
                            return (
                                <div key={title} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 text-center">{title}</p>
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                                                {chartData.map((d, i) => <Cell key={i} fill={colors[d.name] || '#6b7280'} />)}
                                            </Pie>
                                            <Tooltip content={({ active, payload }) => {
                                                if (!active || !payload?.length) return null;
                                                const d = payload[0];
                                                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                                return <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm"><p style={{ color: colors[d.name] }} className="font-bold">{d.name}</p><p className="text-gray-600 mt-1">{d.value} pacientes <span className="font-black">({pct}%)</span></p></div>;
                                            }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
                                        {chartData.map(d => (
                                            <div key={d.name} className="flex items-center gap-1.5 text-sm">
                                                <span className="w-3 h-3 rounded-full" style={{ background: colors[d.name] || '#6b7280' }} />
                                                <span className="text-gray-600 font-medium">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* ── TIEMPO DE ESTANCIA POR SERVICIO (Ancho completo, footer visual) ── */}
            <div className="bg-[#0f3460] rounded-3xl p-8 shadow-xl relative overflow-hidden mt-8">
                <FontAwesomeIcon icon={faBed} className="absolute -right-10 -bottom-10 text-9xl text-white opacity-5" />
                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8 relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faBed} className="text-white text-sm" />
                    </div>
                    Promedio de Estancia por Servicio (Días)
                </h3>
                
                {estancia.length === 0 ? (
                    <p className="text-sm text-white/50 italic relative z-10 bg-white/5 p-4 rounded-xl inline-block">No hay egresos registrados suficientes para calcular la estancia.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 relative z-10">
                        {estancia.map((item, idx) => (
                            <div key={idx} className="bg-white/10 p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                                <div className="flex justify-between items-end mb-3 text-white">
                                    <span className="font-bold text-lg truncate pr-4">{item.name}</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-amber-400 leading-none block">{item.promedio}</span>
                                        <span className="text-[10px] text-amber-400/80 uppercase tracking-widest">Días</span>
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                    <div className="bg-amber-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${(item.promedio / maxEstancia) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-white/60 font-medium">{item.total} pacientes egresados</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}