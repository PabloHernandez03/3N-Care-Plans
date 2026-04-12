import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faUserCheck, faClipboardList,
    faDroplet, faVenusMars, faChartBar,
    faSpinner, faArrowTrendUp, faDna,
    faStethoscope, faSlidersH, faXmark,
    faNotesMedical, faLeaf, faPills, faRotate, faBed
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
function getInitials(nombre = {}) {
    return ((nombre.apellidoPaterno?.[0] || '') + (nombre.nombre?.[0] || '')).toUpperCase() || '?';
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

const WIDGET_META = {
    tendencia:    { label: 'Tendencia de ingresos',     icon: faArrowTrendUp },
    edad:         { label: 'Distribución por edad',     icon: faChartBar     },
    sangre:       { label: 'Tipo de sangre',            icon: faDroplet      },
    sexo:         { label: 'Distribución por sexo',     icon: faVenusMars    },
    edadSexo:     { label: 'Cruce edad × sexo',         icon: faDna          },
    diagnosticos: { label: 'Top diagnósticos',          icon: faStethoscope  },
    recientes:    { label: 'Pacientes recientes',       icon: faArrowTrendUp },
    antecedentes: { label: 'Antecedentes patológicos',  icon: faNotesMedical  },
    habitos:      { label: 'Distribución de hábitos',   icon: faLeaf          },
    medicamentos: { label: 'Medicamentos más recetados',    icon: faPills         },
    reingresos:   { label: 'Reingresos',                     icon: faRotate        },
    estancia:     { label: 'Tiempo promedio de estancia',    icon: faBed           },
};

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

/* ─── Panel de personalización ───────────────────────────────────────────── */
function CustomizePanel({ widgets, onToggle, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faSlidersH} className="text-[#0f3460]" />
                        <h2 className="font-semibold text-gray-800">Personalizar dashboard</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                    <p className="text-xs text-gray-400 mb-3">Activa o desactiva las secciones que quieres ver en tu panel.</p>
                    {widgets.map(w => {
                        const meta = WIDGET_META[w.key];
                        if (!meta) return null;
                        return (
                            <div key={w.key}
                                 className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs
                                        ${w.visible ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <FontAwesomeIcon icon={meta.icon} />
                                    </div>
                                    <span className={`text-sm font-medium ${w.visible ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {meta.label}
                                    </span>
                                </div>
                                {/* Toggle */}
                                <button onClick={() => onToggle(w.key)}
                                        className={`relative w-10 h-5 rounded-full transition-colors duration-200
                                            ${w.visible ? 'bg-[#0f3460]' : 'bg-gray-200'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
                                        ${w.visible ? 'left-5' : 'left-0.5'}`} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function DashboardView() {
    const [patients,     setPatients]     = useState([]);
    const [withAdm,      setWithAdm]      = useState([]);
    const [carePlans,    setCarePlans]    = useState([]);
    const [admissions,   setAdmissions]   = useState([]);
    const [diagnosticos, setDiagnosticos] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [tendencia,    setTendencia]    = useState('mes');
    const [showCustomize, setShowCustomize] = useState(false);
    const [widgets,      setWidgets]      = useState([]);
    const [savingConfig, setSavingConfig] = useState(false);
    const [medicamentos, setMedicamentos] = useState([]);
    const [reingresos, setReingresos] = useState(null);
    const [estancia, setEstancia] = useState([]);
    const [expedienteStats, setExpedientesStats] = useState(null);

    const user       = JSON.parse(sessionStorage.getItem('user') || '{}');
    const enfermeroId = user?._id;

    /* ── Cargar datos + config ── */
    useEffect(() => {
        Promise.all([
            api.get(`/api/patients`).catch(() => ({ data: [] })),
            api.get(`/api/patients/with-admission`).catch(() => ({ data: [] })),
            api.get(`/api/careplans`).catch(() => ({ data: [] })),
            api.get(`/api/admissions/tendencia`).catch(() => ({ data: [] })),
            api.get(`/api/admissions/diagnosticos`).catch(() => ({ data: [] })),
            api.get(`/api/dashboard-config/${enfermeroId}`).catch(() => ({ data: null })),
            api.get(`/api/admissions/stats/medicamentos`).catch(() => ({ data: [] })),
            api.get(`/api/admissions/stats/reingresos`).catch(() => ({ data: null })),
            api.get(`/api/admissions/stats/estancia`).catch(() => ({ data: [] })),
            api.get(`/api/patients/stats/expedientes`).catch(() => ({ data: null })),
        ]).then(([pRes, aRes, cRes, admRes, diagRes, cfgRes, medRes, reinRes, estRes, expRes]) => {
            setPatients(pRes.data     || []);
            setWithAdm(aRes.data      || []);
            setCarePlans(cRes.data    || []);
            setAdmissions(admRes.data || []);
            setDiagnosticos(diagRes.data || []);
            setMedicamentos(medRes.data  || []);
            setReingresos(reinRes.data   || null);
            setEstancia(estRes.data      || []);
            setExpedientesStats(expRes.data || null);
            setWidgets(cfgRes.data?.widgets || Object.keys(WIDGET_META).map(key => ({ key, visible: true })));
        }).finally(() => setLoading(false));
    }, [enfermeroId]);

    /* ── Guardar config en MongoDB ── */
    const saveConfig = useCallback(async (newWidgets) => {
        setSavingConfig(true);
        try {
            await api.put(`/api/dashboard-config/${enfermeroId}`, { widgets: newWidgets });
        } catch {
            console.error('Error guardando configuración');
            console.log('Config que se intentó guardar:', newWidgets);
        } finally {
            setSavingConfig(false);
        }
    }, [enfermeroId, api]);

    function toggleWidget(key) {
        const updated = widgets.map(w => w.key === key ? { ...w, visible: !w.visible } : w);
        setWidgets(updated);
        saveConfig(updated);
    }

    function isVisible(key) {
        return widgets.find(w => w.key === key)?.visible ?? true;
    }

    /* ── Stats calculados ── */
    const stats = useMemo(() => {
        const total   = patients.length;
        const activos = withAdm.filter(p => p.ultimoIngreso?.estado === 'Activo').length;  
        const planes = Array.isArray(carePlans) ? carePlans.length : 0;

        /* ── Hábitos ── */
        const habitosMap = {
            tabaquismo:   { No: 0, Exfumador: 0, Sí: 0 },
            alcoholismo:  { No: 0, Social: 0, Habitual: 0 },
            alimentacion: { Balanceada: 0, Deficiente: 0, Hipergrasas: 0 },
        };

        // Sexo
        const sexoMap = { M: 0, F: 0, N: 0 };
        patients.forEach(p => { const s = p.demograficos?.sexo; if (s in sexoMap) sexoMap[s]++; });
        const sexoData = [
            { name: 'Masculino', value: sexoMap.M, key: 'M' },
            { name: 'Femenino',  value: sexoMap.F, key: 'F' },
            { name: 'Otro',      value: sexoMap.N, key: 'N' },
        ].filter(d => d.value > 0);

        const sangreMap = {};
        patients.forEach(p => { const t = p.demograficos?.tipoSangre; if (t) sangreMap[t] = (sangreMap[t] || 0) + 1; });
        const sangreData = Object.entries(sangreMap)
            .map(([name, value]) => ({ name, value, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
            .sort((a, b) => b.value - a.value);

        const rangosMap = Object.fromEntries(RANGOS_ORDEN.map(r => [r, 0]));
        patients.forEach(p => { const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento)); if (r) rangosMap[r]++; });
        const edadData = RANGOS_ORDEN.map(r => ({ name: r, label: RANGOS_LABEL[r], value: rangosMap[r] }));

        const edadSexoMap = Object.fromEntries(RANGOS_ORDEN.map(r => [r, { M: 0, F: 0, N: 0 }]));
        patients.forEach(p => {
            const r = getRangoEdad(calcularEdad(p.demograficos?.fechaNacimiento));
            const s = p.demograficos?.sexo;
            if (r && s in edadSexoMap[r]) edadSexoMap[r][s]++;
        });
        const edadSexoData = RANGOS_ORDEN.map(r => ({ name: r, Masculino: edadSexoMap[r].M, Femenino: edadSexoMap[r].F, Otro: edadSexoMap[r].N }));

        /* ── Antecedentes ── */
        const anteMap = {};

        // Tendencia + regresión lineal
        const ahora  = new Date();
        const keyFn  = {
            dia:    (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
            semana: (d) => { const s = new Date(d.getFullYear(), 0, 1); const w = Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7); return `Sem ${w}`; },
            mes:    (d) => d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        };
        const nSlots   = { dia: 14, semana: 8, mes: 6 }[tendencia];
        const nPredict = { dia: 3,  semana: 2, mes: 2  }[tendencia];
        const tendMap = {};

        // 1. Inicializamos los slots (esto crea los ceros en la gráfica)
        for (let i = nSlots - 1; i >= 0; i--) {
            const d = new Date(ahora);
            if (tendencia === 'dia')     d.setDate(d.getDate() - i);
            if (tendencia === 'semana')  d.setDate(d.getDate() - i * 7);
            if (tendencia === 'mes')     d.setMonth(d.getMonth() - i);
            
            const label = keyFn[tendencia](d);
            tendMap[label] = 0;
        }

        // 2. Llenamos con datos REALES (aquí está el fix de la propiedad)
        admissions.forEach(a => {
            // Buscamos la fecha en 'fecha' O en 'ingreso.fecha' por si acaso
            const f = a.fecha || a.ingreso?.fecha;
            if (!f) return;

            const dateObj = new Date(f);
            if (isNaN(dateObj)) return;

            const key = keyFn[tendencia](dateObj);
            if (key in tendMap) {
                tendMap[key]++;
            }
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

        const recientes = [...patients]
            .sort((a, b) => new Date(b.fechaRegistro || b.createdAt || 0) - new Date(a.fechaRegistro || a.createdAt || 0))
            .slice(0, 5);

        return { total, activos, planes, sexoData, sangreData, edadData, edadSexoData, tendenciaData, recientes };
    }, [patients, withAdm, carePlans, admissions, tendencia]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-3" />
            <span className="text-sm">Cargando panel…</span>
        </div>
    );

    const visibleCount = widgets.filter(w => w.visible).length;
    
    // Máximos para el cálculo de las barras de progreso
    const maxDiag = Math.max(...diagnosticos.map(d => d.value), 1);
    const maxMed = Math.max(...medicamentos.map(m => m.value), 1);
    const maxEstancia = Math.max(...estancia.map(e => e.promedio), 1);
    const maxAnt = Math.max(...(expedienteStats?.antecedentes || []).map(a => a.value), 1);

    return (
        <div className="space-y-6 pb-10">

            {/* Panel personalización */}
            {showCustomize && (
                <CustomizePanel
                    widgets={widgets}
                    onToggle={toggleWidget}
                    onClose={() => setShowCustomize(false)}
                />
            )}

            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel de control</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button onClick={() => setShowCustomize(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-[#0f3460]/30 transition-all">
                    <FontAwesomeIcon icon={faSlidersH} className="text-[#0f3460]" />
                    <span className="hidden sm:inline">Personalizar</span>
                    {savingConfig && <FontAwesomeIcon icon={faSpinner} spin className="text-xs text-gray-400" />}
                    {visibleCount < Object.keys(WIDGET_META).length && (
                        <span className="w-4 h-4 rounded-full bg-[#0f3460] text-white text-[10px] flex items-center justify-center">
                            {Object.keys(WIDGET_META).length - visibleCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Stat cards — siempre visibles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={faUsers}        label="Pacientes registrados" value={stats.total}   sub="Total en el sistema"   color="blue"   />
                <StatCard icon={faUserCheck}     label="Ingresos activos"      value={stats.activos} sub="Con admisión en curso" color="teal"   />
                <StatCard icon={faClipboardList} label="Planes de cuidado"     value={stats.planes}  sub="Registrados"           color="indigo" />
            </div>

            {/* Fila 1: Tendencia + Edad */}
            {(isVisible('tendencia') || isVisible('edad')) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {isVisible('tendencia') && (
                        <Card className="p-5">
                            <SectionHeader icon={faArrowTrendUp} title="Tendencia de ingresos">
                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                    {[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([key, label]) => (
                                        <button key={key} onClick={() => setTendencia(key)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all
                                                    ${tendencia === key ? 'bg-white text-[#0f3460] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
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
                                            <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                                                <p className="font-semibold text-gray-700 mb-1">{label}</p>
                                                {ing  && <p style={{ color: AREA_COLOR }}>Ingresos: <span className="font-bold">{ing.value}</span></p>}
                                                {pred && <p style={{ color: '#16a09e' }}>Predicción: <span className="font-bold">{pred.value}</span></p>}
                                            </div>
                                        );
                                    }} />
                                    <Area type="monotone" dataKey="ingresos"   stroke={AREA_COLOR} strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: AREA_COLOR }} connectNulls={false} />
                                    <Area type="monotone" dataKey="prediccion" stroke="#16a09e" strokeWidth={2} strokeDasharray="5 4" fill="url(#predGrad)" dot={{ r: 3, fill: '#16a09e', strokeWidth: 0 }} connectNulls={true} />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="w-6 h-0.5 bg-[#0f3460] inline-block rounded" /> Ingresos reales
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="w-6 border-t-2 border-dashed border-[#16a09e] inline-block" /> Predicción
                                </div>
                            </div>
                        </Card>
                    )}

                    {isVisible('edad') && (
                        <Card className="p-5">
                            <SectionHeader icon={faChartBar} title="Distribución por edad" />
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={stats.edadData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload;
                                        return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs"><p className="font-bold text-gray-700">{d.label}</p><p className="text-blue-600">{d.value} pacientes</p></div>;
                                    }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {stats.edadData.map((_, i) => <Cell key={i} fill={AGE_COLORS[i]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                {stats.edadData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: AGE_COLORS[i] }} />
                                        <span className="text-gray-500">{d.name} <span className="text-gray-400">({RANGOS_LABEL[d.name]})</span></span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Fila 2: Sangre + Sexo */}
            {(isVisible('sangre') || isVisible('sexo')) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {isVisible('sangre') && (
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
                                                return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs"><p className="font-bold" style={{ color: BLOOD_COLORS[label] || '#6b7280' }}>{label}</p><p className="text-gray-600">{d.value} pacientes · <span className="font-bold">{d.pct}%</span></p></div>;
                                            }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {stats.sangreData.map((d, i) => <Cell key={i} fill={BLOOD_COLORS[d.name] || '#6b7280'} />)}
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
                    )}

                    {isVisible('sexo') && (
                        <Card className="p-5">
                            <SectionHeader icon={faVenusMars} title="Distribución por sexo" />
                            {stats.sexoData.length === 0
                                ? <p className="text-xs text-gray-400 italic">Sin datos</p>
                                : <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={stats.sexoData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {stats.sexoData.map((d, i) => <Cell key={i} fill={SEX_COLORS[d.key] || '#6b7280'} />)}
                                        </Pie>
                                        <Tooltip content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const d = payload[0];
                                            const pct = stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0;
                                            return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs"><p className="font-bold text-gray-700">{d.name}</p><p style={{ color: SEX_COLORS[d.payload.key] }}>{d.value} pacientes · <span className="font-bold">{pct}%</span></p></div>;
                                        }} />
                                        <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                        </Card>
                    )}
                </div>
            )}

            {/* Fila 3: Edad × Sexo */}
            {isVisible('edadSexo') && (
                <Card className="p-5">
                    <SectionHeader icon={faDna} title="Cruce edad × sexo" />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.edadSexoData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                            <Bar dataKey="Masculino" stackId="a" fill={SEX_COLORS.M} />
                            <Bar dataKey="Femenino"  stackId="a" fill={SEX_COLORS.F} />
                            <Bar dataKey="Otro"      stackId="a" fill={SEX_COLORS.N} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Fila de Datos Clínicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Diagnósticos */}
                {isVisible('diagnosticos') && (
                    <Card className="p-5">
                        <SectionHeader icon={faStethoscope} title="Top diagnósticos más frecuentes" />
                        {diagnosticos.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No hay datos suficientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {diagnosticos.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-[#16a09e]">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-[#16a09e] h-2 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxDiag) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Antecedentes patológicos */}
                {isVisible('antecedentes') && (
                    <Card className="p-5">
                        <SectionHeader icon={faNotesMedical} title="Antecedentes patológicos más comunes" />
                        {!expedienteStats?.antecedentes?.length ? (
                            <p className="text-sm text-gray-400 italic">No hay datos suficientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {expedienteStats.antecedentes.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-red-500">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxAnt) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Medicamentos */}
                {isVisible('medicamentos') && (
                    <Card className="p-5">
                        <SectionHeader icon={faPills} title="Medicamentos más recetados" />
                        {medicamentos.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No hay datos suficientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {medicamentos.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-gray-700 truncate pr-4">{item.name}</span>
                                            <span className="font-black text-indigo-500">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(item.value / maxMed) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Reingresos */}
                {isVisible('reingresos') && reingresos && (
                    <Card className="p-5">
                        <SectionHeader icon={faRotate} title="Reingresos" />
                        <div className="grid grid-cols-3 gap-4">
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

            {/* Estancia promedio (Ancho completo) */}
            {isVisible('estancia') && (
                <div className="bg-[#0f3460] rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <FontAwesomeIcon icon={faBed} className="absolute -right-4 -bottom-4 text-8xl text-white opacity-5" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                        Promedio de Estancia por Servicio (Días)
                    </h3>
                    {estancia.length === 0 ? (
                        <p className="text-sm text-white/50 italic relative z-10">No hay egresos registrados suficientes para calcular la estancia.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 relative z-10">
                            {estancia.map((item, idx) => (
                                <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10">
                                    <div className="flex justify-between text-xs mb-2 text-white">
                                        <span className="font-semibold truncate pr-4">{item.name}</span>
                                        <span className="font-black text-amber-400">{item.promedio} días</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1.5">
                                        <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(item.promedio / maxEstancia) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Hábitos */}
            {isVisible('habitos') && expedienteStats?.habitos && (
                <Card className="p-5">
                    <SectionHeader icon={faLeaf} title="Distribución de hábitos" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            ['Tabaquismo',  expedienteStats.habitos.tabaquismo,  { No: '#22c55e', Exfumador: '#f59e0b', Sí: '#ef4444' }],
                            ['Alcoholismo', expedienteStats.habitos.alcoholismo, { No: '#22c55e', Social: '#f59e0b',    Habitual: '#ef4444' }],
                            ['Alimentación',expedienteStats.habitos.alimentacion,{ Balanceada: '#22c55e', Deficiente: '#f59e0b', Hipergrasas: '#ef4444' }],
                        ].map(([title, data, colors]) => {
                            const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
                            const total = chartData.reduce((s, d) => s + d.value, 0);
                            return (
                                <div key={title}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 text-center">{title}</p>
                                    <ResponsiveContainer width="100%" height={140}>
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={60} dataKey="value" paddingAngle={2}>
                                                {chartData.map((d, i) => <Cell key={i} fill={colors[d.name] || '#6b7280'} />)}
                                            </Pie>
                                            <Tooltip content={({ active, payload }) => {
                                                if (!active || !payload?.length) return null;
                                                const d = payload[0];
                                                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                                return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs"><p style={{ color: colors[d.name] }} className="font-bold">{d.name}</p><p className="text-gray-600">{d.value} pacientes · {pct}%</p></div>;
                                            }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
                                        {chartData.map(d => (
                                            <div key={d.name} className="flex items-center gap-1 text-xs">
                                                <span className="w-2 h-2 rounded-full" style={{ background: colors[d.name] || '#6b7280' }} />
                                                <span className="text-gray-500">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Pacientes recientes */}
            {isVisible('recientes') && (
                <Card className="p-5">
                    <SectionHeader icon={faArrowTrendUp} title="Pacientes recientes" />
                    {stats.recientes.length === 0
                        ? <p className="text-xs text-gray-400 italic">Sin pacientes registrados</p>
                        : <div className="divide-y divide-gray-50">
                            {stats.recientes.map(p => {
                                const sexo   = p.demograficos?.sexo;
                                const edad   = calcularEdad(p.demograficos?.fechaNacimiento);
                                const sangre = p.demograficos?.tipoSangre;
                                const avatarBg = sexo === 'M' ? 'bg-blue-100 text-blue-600' : sexo === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500';
                                const nombreCompleto = [p.nombre?.apellidoPaterno, p.nombre?.apellidoMaterno, p.nombre?.nombre].filter(Boolean).join(' ');
                                return (
                                    <div key={p._id} className="flex items-center gap-3 py-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg}`}>
                                            {getInitials(p.nombre)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{nombreCompleto}</p>
                                            <p className="text-xs text-gray-400">{sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Otro'}{edad !== null && ` · ${edad} años`}</p>
                                        </div>
                                        {sangre && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
                                                  style={{ background: (BLOOD_COLORS[sangre] || '#6b7280') + '20', color: BLOOD_COLORS[sangre] || '#6b7280' }}>
                                                {sangre}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-300 font-mono shrink-0">#{p._id?.slice(-5).toUpperCase()}</span>
                                    </div>
                                );
                            })}
                          </div>
                    }
                </Card>
            )}

            {/* Estado vacío si todo está desactivado */}
            {widgets.length > 0 && widgets.every(w => !w.visible) && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                    <FontAwesomeIcon icon={faSlidersH} className="text-4xl text-gray-200" />
                    <p className="text-sm">No hay gráficas activas.</p>
                    <button onClick={() => setShowCustomize(true)}
                            className="text-xs text-[#16a09e] underline underline-offset-2">
                        Activar gráficas
                    </button>
                </div>
            )}
        </div>
    );
}