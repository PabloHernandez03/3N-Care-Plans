import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faUser, faStethoscope, faBullseye, faHandHoldingMedical, faChevronDown, faChevronUp, 
    faCheckCircle, faListCheck, faChartBar, faTimes, faCakeCandles, faVenusMars, faDroplet, faIdCard, 
    faHospital, faNotesMedical, faLeaf, faPeopleRoof, faTriangleExclamation, faBed, faCalendarDay, 
    faClock, faPrint, faCalendarAlt, faHistory, faCircleXmark,
    faFileMedical, faPencil
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

const getVitalClass = (tipo, valor, sistolica, diastolica) => {
    // Definimos el estilo para valores fuera de rango: Rojo estático, fondo suave y negrita.
    const danger = "bg-red-50 text-red-700 font-black px-2 py-1 rounded-md border border-red-100";
    const normal = "text-gray-700 font-medium";

    switch (tipo) {
        case 'fc': return (valor < 60 || valor > 100) ? danger : normal;
        case 'temp': return (valor < 35.5 || valor > 37.8) ? danger : normal;
        case 'spo2': return (valor < 93) ? danger : normal;
        case 'fr': return (valor < 12 || valor > 22) ? danger : normal;
        case 'pa': 
            // Hipertensión o Hipotensión marcada
            const isAbnormal = (sistolica > 140 || sistolica < 90 || diastolica > 90 || diastolica < 60);
            return isAbnormal ? danger : normal;
        default: return normal;
    }
};

// ─── Sub-componentes Reutilizables de UI ──────────────────────────────────────
const SectionCard = ({ icon, title, children, defaultOpen = true, titleColor = "text-[#0f3460]", count = null, avoidBreak = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5 print:mb-3 print:border-gray-300 print:shadow-none ${avoidBreak ? 'print:break-inside-avoid' : 'print:break-inside-auto'}`}>
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
    
    const [signosVitales,   setSignosVitales]   = useState([]);
    const [modalSignos,     setModalSignos]     = useState(false);
    const [savingSigno,     setSavingSigno]     = useState(false);
    const [formSigno,       setFormSigno]       = useState({
        frecuenciaCardiaca: '', sistolica: '', diastolica: '',
        frecuenciaRespiratoria: '', temperatura: '', saturacionOxigeno: '',
        glucosa: '', peso: '', talla: '', dolor: '', observaciones: ''
    });

    const [nuevaNota, setNuevaNota] = useState('');
    const [enviandoNota, setEnviandoNota] = useState(false);

    const [editingSignoId, setEditingSignoId] = useState(null);

    const [confirmandoActividad, setConfirmandoActividad] = useState(null); // { nicCodigo, descripcion, estadoActual }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resPatient = await api.get(`/api/patients/${planData.pacienteId._id}`);
                setPatientData(resPatient.data.patient || resPatient.data);
                setClinicalRecord(resPatient.data.clinicalRecord || null);
                setAdmissions(resPatient.data.admissions || []);

                const resSignos = await api.get(`/api/vitalsigns/paciente/${planData.pacienteId._id}`);
                setSignosVitales(resSignos.data || []);

                const codigosNoc = planData.nocsEvaluados?.map(n => n.codigo) || [];
                const nombresNoc = {};
                for (const cod of codigosNoc) {
                    const resNoc = await api.get(`/api/noc/${cod}`);
                    nombresNoc[cod] = resNoc.data.nombre;
                }
                setNocNames(nombresNoc);
            } catch (error) { console.error("Error al cargar detalles:", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const toggleNicActivities = async (codigoNic) => {
        if (nicActivities[codigoNic]) {
            setNicActivities(prev => { const n = {...prev}; delete n[codigoNic]; return n; });
            return;
        }
        try {
            const res = await api.get(`/api/nic/${codigoNic}`);
            setNicActivities(prev => ({ 
                ...prev, 
                [codigoNic]: res.data.actividades || [] 
            }));
        } catch (e) { console.error(e); }
    };

    const openNocEvaluation = async (nocEval) => {
        try {
            const res = await api.get(`/api/noc/${nocEval.codigo}`);
            setEvaluatingNoc(res.data);
            setCurrentScores(nocEval.indicadores || {});
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
            await api.put(`/api/careplans/${planData._id}`, {
                nocsEvaluados: updatedNocs
            });

            setPlanData(prev => ({ ...prev, nocsEvaluados: updatedNocs }));
            setEvaluatingNoc(null);
            if (showToast) showToast("Evaluación actualizada correctamente", "success");
        } catch (error) {
            const msg = error.response?.data?.error || "Error de red";
            if (showToast) showToast(msg, "error");
        }finally {
                    setIsSavingEval(false);
                }
    };

    const handleGuardarSigno = async () => {
        setSavingSigno(true);
        const payload = {
            pacienteId: planData.pacienteId._id,
            signos: {
                frecuenciaCardiaca: formSigno.frecuenciaCardiaca ? Number(formSigno.frecuenciaCardiaca) : undefined,
                presionArterial: (formSigno.sistolica || formSigno.diastolica) ? {
                    sistolica: Number(formSigno.sistolica),
                    diastolica: Number(formSigno.diastolica),
                } : undefined,
                frecuenciaRespiratoria: formSigno.frecuenciaRespiratoria ? Number(formSigno.frecuenciaRespiratoria) : undefined,
                temperatura: formSigno.temperatura ? Number(formSigno.temperatura) : undefined,
                saturacionOxigeno: formSigno.saturacionOxigeno ? Number(formSigno.saturacionOxigeno) : undefined,
                glucosa: formSigno.glucosa ? Number(formSigno.glucosa) : undefined,
                peso: formSigno.peso ? Number(formSigno.peso) : undefined,
                talla: formSigno.talla ? Number(formSigno.talla) : undefined,
                dolor: formSigno.dolor ? Number(formSigno.dolor) : undefined,
            },
            observaciones: formSigno.observaciones,
        };

        try {
            if (editingSignoId) {
                // EDITAR
                const { data } = await api.put(`/api/vitalsigns/${editingSignoId}`, payload);
                setSignosVitales(prev => prev.map(s => s._id === editingSignoId ? data : s));
                showToast('Registro actualizado', 'success');
            } else {
                // CREAR NUEVO
                const { data } = await api.post('/api/vitalsigns', payload);
                setSignosVitales(prev => [data, ...prev]);
                showToast('Signos registrados', 'success');
            }
            
            // Resetear todo
            setModalSignos(false);
            setEditingSignoId(null);
            setFormSigno({ /* ... resetear campos vacíos ... */ });
        } catch {
            showToast('Error al procesar solicitud', 'error');
        } finally {
            setSavingSigno(false);
        }
    };

    const handleToggleActividad = async (nicCodigo, descripcion, estadoActual) => {
        setConfirmandoActividad({ nicCodigo, descripcion, estadoActual });
    };

    const ejecutarCambioActividad = async () => {
        const { nicCodigo, descripcion, estadoActual } = confirmandoActividad;
        try {
            const res = await api.patch(`/api/careplans/${planData._id}/actividad`, {
                nicCodigo,
                descripcionActividad: descripcion,
                realizado: !estadoActual
            });
            setPlanData(res.data);
            showToast(estadoActual ? "Registro revertido" : "Actividad registrada", "success");
        } catch (error) {
            showToast("Error en el servidor", "error");
        } finally {
            setConfirmandoActividad(null);
        }
    };

    const handleAddNota = async () => {
        if (!nuevaNota.trim()) return;
        setEnviandoNota(true);
        try {
            const res = await api.post(`/api/careplans/${planData._id}/notas`, {
                nota: nuevaNota
            });
            setPlanData(res.data);
            setNuevaNota(""); // Limpiar el campo
            showToast("Nota guardada correctamente", "success");
        } catch (error) {
            showToast("Error al guardar nota", "error");
        } finally {
            setEnviandoNota(false);
        }
    };

    const handleEditSigno = (sv) => {
        setEditingSignoId(sv._id);
        setFormSigno({
            frecuenciaCardiaca: sv.signos?.frecuenciaCardiaca || '',
            sistolica: sv.signos?.presionArterial?.sistolica || '',
            diastolica: sv.signos?.presionArterial?.diastolica || '',
            frecuenciaRespiratoria: sv.signos?.frecuenciaRespiratoria || '',
            temperatura: sv.signos?.temperatura || '',
            saturacionOxigeno: sv.signos?.saturacionOxigeno || '',
            glucosa: sv.signos?.glucosa || '',
            peso: sv.signos?.peso || '',
            talla: sv.signos?.talla || '',
            dolor: sv.signos?.dolor || '',
            observaciones: sv.observaciones || ''
        });
        setModalSignos(true);
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
            <SectionCard icon={faHandHoldingMedical} title="Intervenciones de Enfermería (NIC)" titleColor="text-[#16a09e]" avoidBreak={false}>
            <div className="grid grid-cols-1 gap-4 pt-1 print:gap-3">
                    {planData.nicsSeleccionados?.map((nic, idx) => {
                        const isOpen = !!nicActivities[nic.codigo];
                        return (
                            <div key={idx} className={`border rounded-2xl overflow-hidden transition-all print:border-gray-300 print:shadow-none print:rounded-xl ${isOpen ? 'border-[#16a09e]/40 shadow-md bg-white' : 'border-gray-100'}`}>
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
                                        <ul className="list-none pl-0 space-y-3 text-sm print:text-xs text-gray-700 font-medium">
                                            {nicActivities[nic.codigo]?.map((actDesc, i) => {
                                                // Buscamos si la actividad ya está registrada como realizada en el planData
                                                const actividadData = planData.nicsSeleccionados
                                                    .find(n => n.codigo === nic.codigo)?.actividades
                                                    ?.find(a => a.descripcion === actDesc);
                                                
                                                const isRealizada = actividadData?.realizado || false;

                                                return (
                                                    <li key={i} 
                                                        onClick={() => handleToggleActividad(nic.codigo, actDesc, isRealizada)}
                                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                            isRealizada ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-[#16a09e]'
                                                        }`}>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                                            isRealizada ? 'bg-[#16a09e] border-[#16a09e] text-white' : 'border-gray-300 bg-white'
                                                        }`}>
                                                            {isRealizada && <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />}
                                                        </div>
                                                        <div>
                                                            <span className={isRealizada ? 'line-through text-gray-400' : 'text-gray-700'}>
                                                                {actDesc}
                                                            </span>
                                                            {isRealizada && actividadData.fechaRealizacion && (
                                                                <p className="text-[9px] text-green-600 font-bold uppercase mt-1">
                                                                Realizado: {new Date(actividadData.fechaRealizacion).toLocaleString('es-MX', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ══ SECCIÓN: SIGNOS VITALES ══ */}
            <SectionCard icon={faChartBar} title="Signos Vitales" titleColor="text-[#16a09e]" count={signosVitales.length}>
                <div className="pt-2">
                    {/* Botón nueva toma (Oculto en print) */}
                    {planData.estado === 'Activo' && (
                        <button onClick={() => setModalSignos(true)}
                                className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f3460] text-white text-xs font-bold hover:bg-[#0a2547] transition-all print:hidden">
                            + Registrar nueva toma
                        </button>
                    )}

                    {signosVitales.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Sin registros.</p>
                    ) : (
                        <div className="overflow-x-auto print:overflow-visible rounded-xl border border-gray-100">
                            <table className="w-full text-xs min-w-[800px] print:min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wide text-[10px] print:text-black print:border-b">
                                        <th className="px-4 py-3 text-left">Fecha / Hora</th>
                                        <th className="px-2 py-3 text-center">FC</th>
                                        <th className="px-2 py-3 text-center">PA (S/D)</th>
                                        <th className="px-2 py-3 text-center">FR</th>
                                        <th className="px-2 py-3 text-center">Temp</th>
                                        <th className="px-2 py-3 text-center">SpO₂</th>
                                        <th className="px-2 py-3 text-center">Glucosa</th>
                                        <th className="px-2 py-3 text-center">Dolor</th>
                                        <th className="px-4 py-3 text-center print:hidden">Acciones</th>
                                    </tr>
                                </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {signosVitales.map((sv, i) => (
                                            <tr key={sv._id || i} className={`transition-colors print:break-inside-avoid ${i === 0 ? 'bg-[#16a09e]/5' : 'bg-white hover:bg-gray-50'}`}>
                                                <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                                    <div className="font-bold text-gray-800 flex items-center">
                                                        {new Date(sv.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                                        {sv.editado && <span className="text-amber-500 ml-1 text-xs" title="Editado corregido">
                                                            <FontAwesomeIcon icon={faPencil} />    
                                                        </span>}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(sv.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                
                                                {/* Celdas con badges estáticos si están fuera de rango */}
                                                <td className="px-2 py-4 text-center">
                                                    <span className={getVitalClass('fc', sv.signos?.frecuenciaCardiaca)}>
                                                        {sv.signos?.frecuenciaCardiaca || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-center">
                                                    <span className={getVitalClass('pa', null, sv.signos?.presionArterial?.sistolica, sv.signos?.presionArterial?.diastolica)}>
                                                        {sv.signos?.presionArterial ? `${sv.signos.presionArterial.sistolica}/${sv.signos.presionArterial.diastolica}` : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-center">
                                                    <span className={getVitalClass('fr', sv.signos?.frecuenciaRespiratoria)}>
                                                        {sv.signos?.frecuenciaRespiratoria || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-center">
                                                    <span className={getVitalClass('temp', sv.signos?.temperatura)}>
                                                        {sv.signos?.temperatura ? `${sv.signos.temperatura}°C` : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4 text-center">
                                                    <span className={getVitalClass('spo2', sv.signos?.saturacionOxigeno)}>
                                                        {sv.signos?.saturacionOxigeno ? `${sv.signos.saturacionOxigeno}%` : '—'}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-2 py-4 text-center text-gray-700 font-medium">
                                                    {sv.signos?.glucosa || '—'}
                                                </td>

                                                <td className="px-2 py-4 text-center">
                                                    {sv.signos?.dolor != null ? (
                                                        <span className={`px-2 py-1 rounded-md font-black text-[10px] ${sv.signos.dolor > 7 ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
                                                            {sv.signos.dolor}/10
                                                        </span>
                                                    ) : '—'}
                                                </td>

                                                <td className="px-4 py-4 text-center print:hidden">
                                                    <button 
                                                        onClick={() => handleEditSigno(sv)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#16a09e] hover:bg-[#16a09e]/10 rounded-full transition-all"
                                                    >
                                                        <FontAwesomeIcon icon={faStethoscope} className="text-xs" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* ══ SECCIÓN: NOTAS DE ENFERMERÍA ══ */}
            <SectionCard 
                icon={faNotesMedical} 
                title="Notas de Evolución y Observaciones" 
                titleColor="text-[#16a09e]"
                count={planData.notasEnfermeria?.length}
            >
                <div className="space-y-6 pt-2">
                    {/* Input de Nueva Nota: Estilo similar a tu Modal de Signos */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 print:hidden">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                            Registrar nueva observación del turno
                        </p>
                        <textarea
                            value={nuevaNota}
                            onChange={(e) => setNuevaNota(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#16a09e] focus:ring-2 focus:ring-[#16a09e]/10 transition-all resize-none"
                            placeholder="Ej: Paciente refiere mejoría en el dolor tras administración de analgésico..."
                            rows="3"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleAddNota}
                                disabled={enviandoNota || !nuevaNota.trim()}
                                className="px-6 py-2.5 rounded-xl bg-[#0f3460] text-white text-xs font-bold hover:bg-[#0a2547] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                {enviandoNota ? "Guardando..." : "Guardar Nota"}
                            </button>
                        </div>
                    </div>

                    {/* Listado de Notas: Estilo similar a tu Historial NOC */}
                    <div className="space-y-4 print:space-y-3">
                        {planData.notasEnfermeria?.length > 0 ? (
                            [...planData.notasEnfermeria].reverse().map((n, idx) => (
                                <div key={idx} className="border-l-4 border-[#16a09e] bg-white rounded-r-2xl p-4 shadow-sm border-y border-r-2 print:shadow-none print:border-gray-300 print:break-inside-avoid">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-[#0f3460] bg-gray-100 px-2 py-0.5 rounded uppercase">
                                                {new Date(n.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {new Date(n.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                                {n.enfermeroId?.identidad?.nombre || 'Enfermero'} {n.enfermeroId?.identidad?.apellido_paterno || '' }
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                        {n.nota}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic text-center py-4">No hay notas de evolución registradas.</p>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* ══ SECCIÓN: HISTORIAL NOC ══ */}
            {planData.nocsEvaluados?.some(n => n.historial?.length > 0) && (
                <SectionCard icon={faHistory} title="Historial de Evaluaciones NOC" defaultOpen={false}>
                    <div className="pt-2 space-y-4">
                        {planData.nocsEvaluados.filter(n => n.historial?.length > 0).map((noc, idx) => (
                            <div key={idx} className="rounded-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                                    <p className="text-xs font-bold text-[#0f3460]">{nocNames[noc.codigo] || noc.codigo}</p>
                                </div>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-gray-400 font-bold uppercase tracking-wide text-[10px]">
                                            <th className="px-4 py-2 text-left">Fecha evaluación</th>
                                            <th className="px-4 py-2 text-center">Promedio anterior</th>
                                            <th className="px-4 py-2 text-center">Promedio actual</th>
                                            <th className="px-4 py-2 text-center">Evolución</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {[...noc.historial].reverse().map((h, i, arr) => {
                                            const siguiente = i === 0 ? noc.promedio : arr[i - 1].promedio;
                                            const mejora = siguiente > h.promedio;
                                            return (
                                                <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-2.5 text-gray-500">
                                                        {new Date(h.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                                            h.promedio >= 4 ? 'bg-red-100 text-red-700'
                                                            : h.promedio >= 3 ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-green-100 text-green-700'}`}>
                                                            {h.promedio}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                                            siguiente >= 4 ? 'bg-red-100 text-red-700'
                                                            : siguiente >= 3 ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-green-100 text-green-700'}`}>
                                                            {siguiente}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center">
                                                        <span className={`text-xs font-bold ${mejora ? 'text-green-600' : 'text-red-500'}`}>
                                                            {mejora ? '↑ Mejoró' : '↓ Empeoró'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}



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

            {/* Sección de Firmas mejorada para impresión */}
            <div className="hidden print:block pt-16 mt-10 border-t border-gray-400">
                <div className="flex justify-between items-start">
                    <div className="text-center w-5/12">
                        <div className="border-b border-gray-300 mb-2 h-12"></div> {/* Espacio para la firma física */}
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            Enfermero(a) en turno
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium">Nombre y Cédula</p>
                    </div>
                    
                    <div className="text-center w-5/12">
                        <div className="border-b border-gray-300 mb-2 h-12"></div> {/* Espacio para la firma física */}
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            Firma de recibido
                        </p>
                        <p className="text-[9px] text-gray-400 font-medium">Sello de la Institución</p>
                    </div>
                </div>
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
                            <button 
                            onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }} 
                            className="relative z-20 text-white/50 hover:text-white bg-white/5 hover:bg-white/20 w-10 h-10 rounded-full transition-colors flex items-center justify-center shrink-0"
                            >
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

            {/* Modal nueva toma signos vitales */}
            {modalSignos && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden"
                    onClick={() => setModalSignos(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
                        onClick={e => e.stopPropagation()}>

                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-800">
                                {editingSignoId ? 'Corregir toma de signos' : 'Nueva toma de signos vitales'}
                            </h2>
                            <button onClick={() => setModalSignos(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    ['frecuenciaCardiaca',     'FC',      'bpm',   '0','300','1'],
                                    ['frecuenciaRespiratoria', 'FR',      'rpm',   '0','60', '1'],
                                    ['temperatura',            'Temp',    '°C',    '30','45','0.1'],
                                    ['saturacionOxigeno',      'SpO₂',    '%',     '0','100','1'],
                                    ['glucosa',                'Glucosa', 'mg/dL', '0','','1'],
                                    ['peso',                   'Peso',    'kg',    '0','','0.1'],
                                    ['talla',                  'Talla',   'cm',    '0','','1'],
                                    ['dolor',                  'Dolor',   '0–10',  '0','10','1'],
                                ].map(([name, label, unit, min, max, step]) => (
                                    <div key={name}>
                                        <p className="text-xs text-gray-400 mb-1">{label} <span className="text-gray-300">{unit}</span></p>
                                        <input type="number" min={min} max={max || undefined} step={step}
                                            value={formSigno[name]}
                                            onChange={e => setFormSigno(p => ({ ...p, [name]: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20 transition" />
                                    </div>
                                ))}
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-xs text-gray-400 mb-1">PA <span className="text-gray-300">mmHg</span></p>
                                    <div className="flex items-center gap-1">
                                        <input type="number" min="0" max="300" placeholder="120"
                                            value={formSigno.sistolica}
                                            onChange={e => setFormSigno(p => ({ ...p, sistolica: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#16a09e] focus:ring-2 focus:ring-[#16a09e]/20 transition" />
                                        <span className="text-gray-400 font-bold">/</span>
                                        <input type="number" min="0" max="200" placeholder="80"
                                            value={formSigno.diastolica}
                                            onChange={e => setFormSigno(p => ({ ...p, diastolica: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#16a09e] focus:ring-2 focus:ring-[#16a09e]/20 transition" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Observaciones</p>
                                <textarea rows={2} value={formSigno.observaciones}
                                        onChange={e => setFormSigno(p => ({ ...p, observaciones: e.target.value }))}
                                        placeholder="Notas adicionales..."
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#16a09e] focus:ring-2 focus:ring-[#16a09e]/20 transition" />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
                            <button onClick={() => setModalSignos(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                                Cancelar
                            </button>
                            <button onClick={handleGuardarSigno} disabled={savingSigno}
                                    className="px-5 py-2 rounded-lg bg-[#0f3460] text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                                {savingSigno ? 'Guardando...' : 'Guardar toma'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmandoActividad && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmandoActividad.estadoActual ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                <FontAwesomeIcon icon={confirmandoActividad.estadoActual ? faTriangleExclamation : faCheckCircle} className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {confirmandoActividad.estadoActual ? '¿Revertir actividad?' : '¿Confirmar ejecución?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 italic">
                                "{confirmandoActividad.descripcion}"
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setConfirmandoActividad(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={ejecutarCambioActividad}
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all ${confirmandoActividad.estadoActual ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#16a09e] hover:bg-[#128a88]'}`}
                                >
                                    {confirmandoActividad.estadoActual ? 'Sí, revertir' : 'Sí, realizado'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}            

        </div>
    );
}