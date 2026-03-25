import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faUser, faStethoscope, faBullseye, faHandHoldingMedical, faChevronDown, faChevronUp, 
    faCheckCircle, faListCheck, faChartBar, faTimes, faCakeCandles, faVenusMars, faDroplet, faIdCard, 
    faHospital, faNotesMedical, faLeaf, faPeopleRoof, faTriangleExclamation, faBed, faCalendarDay, 
    faClock, faPrint, faCalendarAlt, faHistory, faCircleXmark
} from '@fortawesome/free-solid-svg-icons';

// ─── Utilidades Visuales y Mapeos ───────────────────────────────────────────
const bloodColors = { 'A+': 'bg-red-100 text-red-700', 'A-': 'bg-red-100 text-red-700', 'O+': 'bg-blue-100 text-blue-700', 'O-': 'bg-blue-100 text-blue-700', 'B+': 'bg-orange-100 text-orange-700', 'B-': 'bg-orange-100 text-orange-700', 'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-100 text-purple-700' };

function getInitials(nombre = {}) {
    const n = nombre.nombre?.[0] || '';
    const ap = nombre.apellidoPaterno?.[0] || '';
    return (ap + n).toUpperCase() || '?';
}

function formatFechaMexicana(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getAge(fechaNacStr) {
    if (!fechaNacStr) return '?';
    const d = new Date(fechaNacStr);
    if (isNaN(d)) return '?';
    const hoy = new Date();
    let edad = hoy.getFullYear() - d.getFullYear();
    const m = hoy.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
    return edad;
}

// ─── Sub-componentes Reutilizables de UI ──────────────────────────────────────
const SectionCard = ({ icon, title, children, defaultOpen = true, titleColor = "text-[#0f3460]", count = null }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5 print:mb-3 print:border-gray-300 print:shadow-none print:break-inside-avoid">
            <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 md:px-6 print:py-2.5 print:px-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#16a09e] flex items-center justify-center text-white text-sm shrink-0 shadow-sm print:shadow-none print:w-6 print:h-6 print:text-xs">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-sm md:text-base font-bold tracking-wide uppercase ${titleColor} print:text-sm`}>{title}</h2>
                        {count !== null && <span className="text-xs bg-gray-100 text-gray-500 font-black rounded-md px-1.5 py-0.5 print:bg-transparent print:border print:border-gray-300">{count}</span>}
                    </div>
                </div>
                {/* Ocultar chevron en impresión */}
                <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-gray-400 text-xs print:hidden" />
            </button>
            {/* Mantener siempre abierto en impresión */}
            <div className={`px-5 pb-5 border-t border-gray-50 pt-4 md:px-6 print:p-3 print:pt-3 print:border-gray-200 ${open ? '' : 'hidden print:block'}`}>{children}</div>
        </div>
    );
};

const DataField = ({ label, value }) => (
    <div className="print:break-inside-avoid">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5 print:text-[9px] print:text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800 leading-snug print:text-xs">{value || '—'}</p>
    </div>
);

const Tag = ({ children, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-600 print:border-gray-300',
        red: 'bg-red-50 text-red-600 border border-red-100 print:border-red-300',
        green: 'bg-green-50 text-green-700 border border-green-100 print:border-green-300',
        amber: 'bg-amber-50 text-amber-700 border border-amber-100 print:border-amber-300',
        blue: 'bg-blue-50 text-blue-700 border border-blue-100 print:border-blue-300',
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold print:px-2 print:py-0.5 print:text-[10px] print:bg-transparent print:border ${colors[color]}`}>
            {children}
        </span>
    );
};

const EstadoBadge = ({ estado }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold print:px-2 print:py-0.5 print:text-[10px] print:border ${estado === 'Activo' ? 'bg-green-100 text-green-700 print:border-green-400' : 'bg-gray-100 text-gray-500 print:border-gray-400'}`}>
        <FontAwesomeIcon icon={estado === 'Activo' ? faCheckCircle : faCircleXmark} className="text-[10px]" />
        {estado}
    </span>
);

// ─── Componente Principal CarePlanDetail ──────────────────────────────────────
export default function CarePlanDetail({ plan, onBack, showToast }) {
    const [planData, setPlanData] = useState(plan);
    const [clinicalRecord, setClinicalRecord] = useState(null); 
    const [patientData, setPatientData] = useState(null); 
    const [admissions, setAdmissions] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [nocNames, setNocNames] = useState({});
    const [nicActivities, setNicActivities] = useState({});

    // ESTADOS PARA RE-EVALUAR
    const [evaluatingNoc, setEvaluatingNoc] = useState(null);
    const [currentScores, setCurrentScores] = useState({});
    const [isSavingEval, setIsSavingEval] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resPatient = await axios.get(`${import.meta.env.VITE_API_URL}/api/patients/${planData.pacienteId._id}`);
                setPatientData(resPatient.data.patient || resPatient.data);
                setClinicalRecord(resPatient.data.clinicalRecord || null);
                setAdmissions(resPatient.data.admissions || []);

                const codigosNoc = planData.nocsEvaluados?.map(n => n.codigo) || [];
                const nombresNoc = {};
                for (const cod of codigosNoc) {
                    const resNoc = await fetch(`${import.meta.env.VITE_API_URL}/api/noc/${cod}`);
                    if (resNoc.ok) {
                        const dataNoc = await resNoc.json();
                        nombresNoc[cod] = dataNoc.nombre;
                    }
                }
                setNocNames(nombresNoc);
            } catch (error) { console.error("Error al cargar detalles:", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [planData]);

    const toggleNicActivities = async (codigoNic) => {
        if (nicActivities[codigoNic]) {
            setNicActivities(prev => { const n = {...prev}; delete n[codigoNic]; return n; });
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nic/${codigoNic}`);
            if (res.ok) {
                const data = await res.json();
                setNicActivities(prev => ({ ...prev, [codigoNic]: data.actividades || [] }));
            }
        } catch (e) { console.error(e); }
    };

    const openNocEvaluation = async (nocEval) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/noc/${nocEval.codigo}`);
            if (res.ok) {
                const fullNoc = await res.json();
                setEvaluatingNoc(fullNoc);
                setCurrentScores(nocEval.indicadores || {});
            }
        } catch (e) { console.error("Error al cargar NOC:", e); }
    };

    const handleScoreChange = (indicadorCodigo, score) => {
        setCurrentScores(prev => ({ ...prev, [indicadorCodigo]: score }));
    };

    const handleSaveEvaluation = async () => {
        setIsSavingEval(true);
        const totalIndicadores = evaluatingNoc.indicadores.length;
        let suma = 0;
        Object.values(currentScores).forEach(val => suma += val);
        const nuevoPromedio = parseFloat((suma / totalIndicadores).toFixed(2));

        const updatedNocs = planData.nocsEvaluados.map(n => 
            n.codigo === evaluatingNoc.codigo 
                ? { ...n, promedio: nuevoPromedio, indicadores: currentScores }
                : n
        );

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/careplans/${planData._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nocsEvaluados: updatedNocs })
            });

            if (res.ok) {
                setPlanData(prev => ({ ...prev, nocsEvaluados: updatedNocs }));
                setEvaluatingNoc(null);
                if (showToast) showToast("Evaluación actualizada correctamente", "success");
            } else {
                if (showToast) showToast("Error al guardar la evaluación", "error");
            }
        } catch (error) {
            if (showToast) showToast("Error de red", "error");
        } finally {
            setIsSavingEval(false);
        }
    };

    const handlePrintPlan = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-[#16a09e] rounded-full"></div></div>;

    const { nombre, curp, demograficos } = patientData || {};
    const nombreCompleto = [nombre?.apellidoPaterno, nombre?.apellidoMaterno, nombre?.nombre].filter(Boolean).join(' ');
    const edadP = getAge(demograficos?.fechaNacimiento);
    const avatarBg = demograficos?.sexo === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600';

    const ant = clinicalRecord?.antecedentes || {};
    const alergias = clinicalRecord?.alergias || {};
    const meds = clinicalRecord?.medicacionActual || [];
    const habitos = clinicalRecord?.habitos || {};
    const redCuidados = clinicalRecord?.redCuidados || '';

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto relative px-4 md:px-0 print:space-y-3 print:pb-0">
            {/* 🟢 Estilos CSS dedicados a ajustar la hoja de impresión */}
            <style type="text/css" media="print">
                {`
                  @page { size: auto; margin: 10mm; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                `}
            </style>

            {/* ── CABECERA PRINCIPAL ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 mb-6 gap-4 print:pb-3 print:mb-3 print:border-gray-300">
                <div className="flex items-start gap-4 flex-1">
                    <button onClick={onBack} className="mt-1 p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:shadow-sm transition-all shrink-0 print:hidden">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm print:shadow-none print:w-14 print:h-14 print:text-2xl print:border print:border-gray-200 ${avatarBg}`}>
                            {getInitials(nombre)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl md:text-3xl font-bold text-[#0f3460] leading-tight truncate print:text-2xl print:whitespace-normal">{nombreCompleto}</h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 md:mt-2 text-gray-500 print:text-gray-700">
                                <span className="text-xs font-mono tracking-widest print:font-bold">{curp}</span>
                                <span className="flex items-center gap-1.5 text-xs font-medium">
                                    <FontAwesomeIcon icon={demograficos?.sexo === 'M' ? faVenusMars : faVenusMars} className="text-xs text-gray-400 print:text-gray-600" />
                                    {demograficos?.sexo === 'M' ? 'Masculino' : demograficos?.sexo === 'F' ? 'Femenino' : 'Otro'}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-medium">
                                    <FontAwesomeIcon icon={faDroplet} className="text-red-400 print:text-red-600" />
                                    {demograficos?.tipoSangre || '?'}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-bold">
                                    <FontAwesomeIcon icon={faCakeCandles} className="text-gray-400 print:text-gray-600" />
                                    {edadP} años
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-t-0 print:hidden">
                    <button onClick={handlePrintPlan} className="px-6 py-3 bg-[#16a09e] hover:bg-[#128a88] text-white rounded-xl shadow-md font-bold transition-all text-sm flex items-center gap-2 justify-center">
                        <FontAwesomeIcon icon={faPrint} />
                        Imprimir Diagnóstico
                    </button>
                    <button onClick={onBack} className="md:hidden px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">
                        Volver al listado
                    </button>
                </div>
            </div>

            {/* ══ SECCIÓN I: PLAN DE CUIDADOS (NANDA) ══ */}
            <div className="bg-[#0f3460] p-6 md:p-8 rounded-3xl shadow-lg mt-6 relative overflow-hidden text-center md:text-left print:bg-white print:border-2 print:border-[#0f3460] print:shadow-none print:p-4 print:mt-3 print:rounded-xl">
                <FontAwesomeIcon icon={faStethoscope} className="absolute -right-10 -bottom-10 text-9xl text-white opacity-5 print:hidden" />
                <div className="relative z-10">
                    <span className="text-[10px] font-bold text-[#16a09e] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg print:bg-[#16a09e]/10">Diagnóstico NANDA Actual</span>
                    <h2 className="text-xl md:text-3xl font-bold text-white mt-3 leading-tight pr-0 md:pr-10 print:text-[#0f3460] print:text-xl">{planData.nanda?.nombre}</h2>
                    <div className="mt-4 flex flex-col md:flex-row gap-x-6 gap-y-2 text-white/70 text-sm justify-center md:justify-start print:text-gray-600 print:text-xs print:mt-2">
                        <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Inició: {new Date(planData.fecha).toLocaleDateString('es-MX')}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider print:bg-transparent print:border ${planData.estado === 'Activo' ? 'bg-green-100 text-green-700 print:border-green-500' : 'bg-gray-200 text-gray-600 print:border-gray-400'}`}>
                            {planData.estado}
                        </span>
                    </div>
                </div>
            </div>

            {/* NOCs (Arreglado a 1 sola columna ocupando el 100%) */}
            <SectionCard icon={faBullseye} title="Resultados Esperados (NOC)" titleColor="text-[#16a09e]">
                <div className="grid grid-cols-1 gap-4 pt-1 print:gap-3">
                    {planData.nocsEvaluados?.map((noc, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-gray-200 transition-colors print:p-3 print:border-gray-300 print:shadow-none print:break-inside-avoid print:rounded-xl">
                            <div className="flex justify-between items-start mb-4 print:mb-2">
                                <span className="font-bold text-[#0f3460] text-sm md:text-base leading-snug pr-4 print:text-sm">{nocNames[noc.codigo] || `Cargando...`}</span>
                                <span className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 print:px-2 print:py-0.5 print:text-[10px] print:border ${noc.promedio >= 4 ? 'bg-red-100 text-red-700 print:border-red-300' : noc.promedio >= 3 ? 'bg-amber-100 text-amber-700 print:border-amber-300' : 'bg-green-100 text-green-700 print:border-green-300'}`}>
                                    {noc.promedio}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 pt-4 gap-2 print:pt-2 print:border-gray-200">
                                <p className="text-xs text-gray-500 font-medium whitespace-nowrap print:text-[10px]">Indicadores: {Object.keys(noc.indicadores || {}).length}</p>
                                {/* Ocultar en impresión */}
                                {planData.estado === 'Activo' && (
                                    <button 
                                        onClick={() => openNocEvaluation(noc)} 
                                        className="px-4 py-2 bg-[#16a09e]/10 hover:bg-[#16a09e] text-[#16a09e] hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap print:hidden"
                                    >
                                        <FontAwesomeIcon icon={faChartBar} /> Ver / Evaluar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* NICs */}
            <SectionCard icon={faHandHoldingMedical} title="Intervenciones de Enfermería (NIC)" titleColor="text-[#16a09e]">
                <div className="grid grid-cols-1 gap-4 pt-1 print:gap-3">
                    {planData.nicsSeleccionados?.map((nic, idx) => {
                        const isOpen = !!nicActivities[nic.codigo];
                        return (
                            <div key={idx} className={`border rounded-2xl overflow-hidden transition-all print:break-inside-avoid print:border-gray-300 print:shadow-none print:rounded-xl ${isOpen ? 'border-[#16a09e]/40 shadow-md bg-white' : 'border-gray-100'}`}>
                                <div className="bg-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:p-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-[#16a09e] text-sm print:hidden" />
                                        <span className="font-bold text-gray-800 text-base leading-tight truncate print:text-sm print:whitespace-normal">{nic.nombre}</span>
                                    </div>
                                    <button onClick={() => toggleNicActivities(nic.codigo)} className="px-4 py-2 bg-gray-50 hover:bg-[#16a09e]/10 text-gray-600 hover:text-[#16a09e] text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 print:hidden w-full md:w-auto justify-center">
                                        <FontAwesomeIcon icon={faListCheck} />
                                        {isOpen ? 'Ocultar actividades' : 'Ver actividades'}
                                    </button>
                                </div>
                                <div className={`bg-gray-50/50 p-5 border-t border-gray-100 print:p-3 print:pt-2 print:bg-white print:border-gray-200 ${isOpen ? '' : 'hidden print:block'}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 print:mb-1 print:text-[9px]">Actividades de enfermería:</p>
                                    <ul className="list-disc pl-5 space-y-2.5 text-sm text-gray-700 font-medium leading-snug print:space-y-1 print:text-xs">
                                        {nicActivities[nic.codigo]?.map((act, i) => <li key={i}>{act}</li>)}
                                        {(!nicActivities[nic.codigo] || nicActivities[nic.codigo].length === 0) && <li className="text-gray-400 italic list-none">Detalles omitidos (cargando...)</li>}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ══ SECCIÓN II: INGRESO VINCULADO ══ */}
            <SectionCard icon={faHospital} title="Datos del Ingreso Vinculado" defaultOpen={false}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-6 pt-1 print:grid-cols-4 print:gap-y-3">
                    <DataField label="Fecha de Ingreso" value={planData.ingresoId?.ingreso?.fecha ? new Date(planData.ingresoId.ingreso.fecha).toLocaleDateString('es-MX') : ''} />
                    <DataField label="Servicio / Unidad" value={planData.ingresoId?.ingreso?.servicio} />
                    <DataField label="Cama" value={planData.ingresoId?.ingreso?.cama} />
                    <DataField label="Diagnóstico Médico" value={planData.ingresoId?.ingreso?.diagnosticoMedico} />
                </div>
            </SectionCard>

            {/* ══ SECCIÓN III: EXPEDIENTE COMPLETO ══ */}
            <div className="pt-8 border-t border-gray-200 mt-12 print:pt-4 print:mt-4 print:border-gray-300">
                <h3 className="text-sm font-semibold tracking-wide text-gray-400 uppercase mb-6 ml-2 print:mb-3 print:text-xs print:text-gray-500">Expediente Clínico del Paciente</h3>
                
                <SectionCard icon={faIdCard} title="Datos Demográficos">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-6 pt-1 print:grid-cols-4 print:gap-y-3">
                        <DataField label="Fecha de nacimiento" value={formatFechaMexicana(demograficos?.fechaNacimiento)} />
                        <DataField label="Tipo de sangre" value={demograficos?.tipoSangre} />
                        <DataField label="CURP" value={curp} />
                        <DataField label="Sexo biológico" value={demograficos?.sexo === 'M' ? 'Masculino' : demograficos?.sexo === 'F' ? 'Femenino' : 'Otro'} />
                    </div>
                </SectionCard>

                <SectionCard icon={faNotesMedical} title="Antecedentes Personales">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1 print:grid-cols-3 print:gap-4">
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 print:text-[9px] print:mb-1">Patológicos</p>
                            {ant.patologicos?.length > 0 ? <div className="flex flex-wrap gap-1.5">{ant.patologicos.map((a, i) => <Tag key={i} color="red">{a}</Tag>)}</div> : <p className="text-xs text-gray-400 italic">Sin antecedentes</p>}
                        </div>
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 print:text-[9px] print:mb-1">No patológicos</p>
                            {ant.noPatologicos?.length > 0 ? <div className="flex flex-wrap gap-1.5">{ant.noPatologicos.map((a, i) => <Tag key={i} color="green">{a}</Tag>)}</div> : <p className="text-xs text-gray-400 italic">Sin antecedentes</p>}
                        </div>
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 print:text-[9px] print:mb-1">Quirúrgicos</p>
                            {ant.quirurgicos?.length > 0 ? <div className="flex flex-wrap gap-1.5">{ant.quirurgicos.map((a, i) => <Tag key={i} color="amber">{a}</Tag>)}</div> : <p className="text-xs text-gray-400 italic">Sin antecedentes</p>}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard icon={faDroplet} title="Datos Clínicos">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1 print:grid-cols-2 print:gap-4">
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[9px] print:mb-1">Alergias conocidas</p>
                            {alergias.ninguna ? <Tag color="green">Sin alergias</Tag>
                                : !alergias.medicamentos && !alergias.alimentos && !alergias.ambientales ? <p className="text-xs text-gray-400 italic">Sin información</p>
                                : <div className="space-y-2.5 print:space-y-1">
                                    {[ ['Medicamentos', alergias.medicamentos], ['Alimentos', alergias.alimentos], ['Ambientales', alergias.ambientales] ].filter(([, v]) => v).map(([label, val]) => (
                                        <div key={label} className="flex items-start gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-sm print:bg-white print:border-gray-200 print:p-1.5 print:text-xs">
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
                                            <span className="text-gray-700 leading-snug">{val}</span>
                                        </div>
                                    ))}
                                  </div>}
                        </div>
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[9px] print:mb-1">Medicación actual</p>
                            {meds[0]?.ninguna || meds.length === 0 ? <Tag color="blue">No usa medicamentos</Tag>
                                : <div className="space-y-2.5 print:space-y-1.5">
                                    {meds.filter(m => m.nombre).map((m, i) => (
                                        <div key={i} className="flex flex-col gap-1.5 bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm print:bg-white print:border-gray-200 print:p-2">
                                            <span className="font-bold text-gray-800 text-base print:text-sm">{m.nombre}</span>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 text-xs print:text-[10px]">
                                                {m.dosis && <span>Dosis: <span className="font-semibold text-gray-800">{m.dosis}</span></span>}
                                                {m.frecuencia && <span>Frecuencia: <span className="font-semibold text-gray-800">{m.frecuencia}</span></span>}
                                                {m.via && <span>Vía: <span className="font-semibold text-gray-800">{m.via}</span></span>}
                                            </div>
                                        </div>
                                    ))}
                                  </div>}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard icon={faLeaf} title="Hábitos y Entorno" defaultOpen={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 print:grid-cols-2 print:gap-4">
                        <div className="space-y-3 print:space-y-2 print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 print:text-[9px]">Hábitos de vida</p>
                            {[ ['Tabaquismo', habitos.tabaquismo], ['Alcoholismo', habitos.alcoholismo], ['Alimentación', habitos.alimentacion] ].map(([label, val]) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                                    <Tag color={val === 'No' || val === 'Balanceada' ? 'green' : val === 'Sí' || val === 'Habitual' || val === 'Hipergrasas' ? 'red' : 'amber'}>{val || '—'}</Tag>
                                </div>
                            ))}
                        </div>
                        <div className="print:break-inside-avoid">
                            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 print:text-[9px] print:mb-1">Red de cuidados</p>
                            {redCuidados ? <Tag color={redCuidados.includes('Insuficiente') ? 'red' : 'blue'}>{redCuidados}</Tag> : <p className="text-xs text-gray-400 italic">Sin información</p>}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard icon={faHospital} title="Historial de Ingresos" defaultOpen={false} count={admissions.length}>
                    <div className="pt-1 space-y-4 print:space-y-2">
                        {admissions.length === 0 ? <p className="text-xs text-gray-400 italic">Sin ingresos registrados</p>
                            : admissions.map((adm, i) => (
                                <div key={adm._id || i} className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4 print:bg-white print:border-gray-300 print:p-3 print:grid-cols-3 print:break-inside-avoid">
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <EstadoBadge estado={adm.estado} />
                                            <span className="text-[10px] text-gray-400 font-mono">#{adm._id?.slice(-5).toUpperCase() || '—'}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 leading-snug print:text-xs">
                                            <FontAwesomeIcon icon={faStethoscope} className="text-[#16a09e] text-xs print:hidden"/>
                                            {adm.ingreso?.diagnosticoMedico || 'Diagnóstico no registrado'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-600 text-xs border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0 print:border-t-0 print:pt-0">
                                        <DataField label="Fecha Ingreso" value={new Date(adm.ingreso?.fecha).toLocaleDateString('es-MX')} />
                                        <DataField label="Servicio / Cama" value={`${adm.ingreso?.servicio || '—'} / ${adm.ingreso?.cama || '—'}`} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </SectionCard>
            </div>
            
            {evaluatingNoc && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in print:hidden">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="bg-[#0f3460] p-6 flex justify-between items-start text-white shrink-0 relative overflow-hidden">
                            <FontAwesomeIcon icon={faBullseye} className="absolute -right-4 -bottom-4 text-8xl text-white opacity-5" />
                            <div className="relative z-10 pr-8">
                                <span className="bg-white/10 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 inline-block">Actualizar Evaluación</span>
                                <h3 className="text-xl md:text-2xl font-bold leading-tight truncate">{evaluatingNoc.nombre}</h3>
                            </div>
                            <button onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/20 w-10 h-10 rounded-full transition-colors flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="p-4 md:p-6 overflow-y-auto bg-gray-50 flex-1">
                            <p className="text-sm font-bold text-gray-600 mb-5">Puntúe el estado actual del paciente:</p>
                            <div className="space-y-4 pt-1">
                                {evaluatingNoc.indicadores?.map((ind, i) => {
                                    const isAnswered = !!currentScores[ind.codigo];
                                    return (
                                        <div key={i} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${isAnswered ? 'bg-[#16a09e]/5 border-[#16a09e]/30 shadow-sm bg-white' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                            <span className={`text-sm font-semibold lg:w-1/2 mb-5 lg:mb-0 leading-relaxed ${isAnswered ? 'text-[#0f3460]' : 'text-gray-700'}`}>
                                                {ind.texto}
                                            </span>
                                            <div className="flex items-center gap-2 md:gap-3 lg:w-1/2 justify-between lg:justify-end">
                                                <span className="text-[10px] md:text-xs font-bold text-red-500 w-10 md:w-12 text-right uppercase">Grave</span>
                                                <div className="flex gap-1.5 md:gap-2">
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <label key={num} className="cursor-pointer relative group">
                                                            <input type="radio" name={`ind-${ind.codigo}`} value={num} checked={currentScores[ind.codigo] === num} onChange={() => handleScoreChange(ind.codigo, num)} className="peer hidden" />
                                                            <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 font-bold peer-checked:bg-[#16a09e] peer-checked:text-white peer-checked:border-[#16a09e] hover:border-[#16a09e]/50 transition-all shadow-sm">
                                                                {num}
                                                            </div>
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Grave</span>
                                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-green-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Sano</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] md:text-xs font-bold text-green-500 w-10 md:w-12 text-left uppercase">Sano</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 md:p-5 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 rounded-b-3xl">
                            <button onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }} className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                Cancelar
                            </button>
                            <button onClick={handleSaveEvaluation} disabled={Object.keys(currentScores).length < evaluatingNoc.indicadores.length || isSavingEval} className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all w-full sm:w-auto ${Object.keys(currentScores).length < evaluatingNoc.indicadores.length || isSavingEval ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#16a09e] text-white hover:bg-[#128a88]'}`}>
                                {isSavingEval ? 'Guardando...' : 'Actualizar Evaluación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}