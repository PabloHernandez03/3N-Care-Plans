import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUser, faDroplet, faCakeCandles,
    faVenusMars, faIdCard, faHospital, faNotesMedical,
    faPills, faLeaf, faPeopleRoof, faTriangleExclamation,
    faBed, faStethoscope, faCalendarDay, faClock,
    faCircleCheck, faCircleXmark, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const bloodColors = {
    'A+':  'bg-red-100 text-red-700',
    'A-':  'bg-red-100 text-red-700',
    'B+':  'bg-orange-100 text-orange-700',
    'B-':  'bg-orange-100 text-orange-700',
    'AB+': 'bg-purple-100 text-purple-700',
    'AB-': 'bg-purple-100 text-purple-700',
    'O+':  'bg-blue-100 text-blue-700',
    'O-':  'bg-blue-100 text-blue-700',
};

function formatFecha(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getInitials(nombre = {}) {
    const n  = nombre.nombre?.[0]         || '';
    const ap = nombre.apellidoPaterno?.[0] || '';
    return (ap + n).toUpperCase() || '?';
}

/* ─── Sub-componentes ────────────────────────────────────────────────────── */

const SectionCard = ({ icon, title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primario flex items-center justify-center text-white text-sm shrink-0">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                    <h2 className="text-sm font-semibold tracking-wide text-[#0f3460] uppercase">
                        {title}
                    </h2>
                </div>
                <FontAwesomeIcon
                    icon={open ? faChevronUp : faChevronDown}
                    className="text-gray-400 text-xs"
                />
            </button>
            {open && (
                <div className="px-6 pb-5 border-t border-gray-100">
                    {children}
                </div>
            )}
        </div>
    );
};

const DataField = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
            {label}
        </p>
        <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
);

const Tag = ({ children, color = 'gray' }) => {
    const colors = {
        gray:   'bg-gray-100 text-gray-600',
        red:    'bg-red-50 text-red-600',
        green:  'bg-green-50 text-green-700',
        amber:  'bg-amber-50 text-amber-700',
        blue:   'bg-blue-50 text-blue-700',
        purple: 'bg-purple-50 text-purple-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colors[color]}`}>
            {children}
        </span>
    );
};

const EstadoBadge = ({ estado }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        ${estado === 'Activo'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'}`}>
        <FontAwesomeIcon icon={estado === 'Activo' ? faCircleCheck : faCircleXmark} className="text-[10px]" />
        {estado}
    </span>
);

/* ─── Vista principal ────────────────────────────────────────────────────── */

export default function PatientProfileView() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [data, setData]       = useState(null);   // { patient, clinicalRecord, admissions }
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/patients/${id}`)
            .then(res => {
                setData({
                    patient:        res.data.patient        || res.data,
                    clinicalRecord: res.data.clinicalRecord || null,
                    admissions:     res.data.admissions     || [],
                });
            })
            .catch(() => setError('No se pudo cargar el expediente.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-[#16a09e] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Cargando expediente…</span>
            </div>
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-3xl text-amber-400" />
            <p className="text-sm">{error || 'Paciente no encontrado.'}</p>
            <button onClick={() => navigate('/patients')}
                    className="text-xs text-[#16a09e] underline underline-offset-2">
                Volver a pacientes
            </button>
        </div>
    );

    const { patient, clinicalRecord, admissions } = data;
    const { nombre, curp, demograficos, edad } = patient;
    const sexo       = demograficos?.sexo;
    const sangre     = demograficos?.tipoSangre;
    const bloodClass = bloodColors[sangre] || 'bg-gray-100 text-gray-600';

    const nombreCompleto = [nombre?.apellidoPaterno, nombre?.apellidoMaterno, nombre?.nombre]
        .filter(Boolean).join(' ');

    const avatarBg = sexo === 'M'
        ? 'bg-blue-100 text-blue-600'
        : sexo === 'F'
        ? 'bg-pink-100 text-pink-600'
        : 'bg-gray-100 text-gray-500';

    /* ── Antecedentes ── */
    const ant        = clinicalRecord?.antecedentes || {};
    const alergias   = clinicalRecord?.alergias     || {};
    const meds       = clinicalRecord?.medicacionActual || [];
    const habitos    = clinicalRecord?.habitos       || {};
    const redCuidados = clinicalRecord?.redCuidados  || '';

    const hayMeds    = meds.length > 0 && !meds[0]?.ninguna && meds.some(m => m.nombre);
    const hayAlergias = !alergias.ninguna && (alergias.medicamentos || alergias.alimentos || alergias.ambientales);

    return (
        <div className="space-y-6 pb-10">

            {/* ── Header ── */}
            <div className="flex items-start gap-4">
                <button
                    onClick={() => navigate('/patients')}
                    className="mt-1 p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all shrink-0">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                {/* Avatar + nombre */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${avatarBg}`}>
                        {getInitials(nombre)}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-gray-800 truncate">{nombreCompleto}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 font-mono tracking-widest">{curp}</span>
                            {sangre && (
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${bloodClass}`}>
                                    {sangre}
                                </span>
                            )}
                            {edad != null && (
                                <span className="text-xs text-gray-400">{edad} años</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ SECCIÓN 1: Identificación ══ */}
            <SectionCard icon={faUser} title="Identificación">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4">
                    <DataField label="Nombre(s)"        value={nombre?.nombre} />
                    <DataField label="Apellido paterno" value={nombre?.apellidoPaterno} />
                    <DataField label="Apellido materno" value={nombre?.apellidoMaterno} />
                    <DataField label="CURP"
                        value={<span className="font-mono tracking-widest text-xs">{curp}</span>} />
                    <DataField label="Fecha de nacimiento"
                        value={formatFecha(demograficos?.fechaNacimiento)} />
                    <DataField label="Edad"
                        value={edad != null ? `${edad} años` : '—'} />
                    <DataField label="Sexo biológico"
                        value={sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Otro'} />
                    <DataField label="Tipo de sangre"
                        value={
                            sangre
                                ? <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${bloodClass}`}>{sangre}</span>
                                : '—'
                        } />
                </div>
            </SectionCard>

            {/* ══ SECCIÓN 2: Antecedentes ══ */}
            <SectionCard icon={faNotesMedical} title="Antecedentes personales">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">

                    {/* Patológicos */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                            Patológicos
                        </p>
                        {ant.patologicos?.length > 0
                            ? <div className="flex flex-wrap gap-1.5">
                                {ant.patologicos.map((a, i) => <Tag key={i} color="red">{a}</Tag>)}
                              </div>
                            : <p className="text-xs text-gray-400 italic">Sin antecedentes registrados</p>
                        }
                    </div>

                    {/* No patológicos */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                            No patológicos
                        </p>
                        {ant.noPatologicos?.length > 0
                            ? <div className="flex flex-wrap gap-1.5">
                                {ant.noPatologicos.map((a, i) => <Tag key={i} color="green">{a}</Tag>)}
                              </div>
                            : <p className="text-xs text-gray-400 italic">Sin antecedentes registrados</p>
                        }
                    </div>

                    {/* Quirúrgicos */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            Quirúrgicos
                        </p>
                        {ant.quirurgicos?.length > 0
                            ? <div className="flex flex-wrap gap-1.5">
                                {ant.quirurgicos.map((a, i) => <Tag key={i} color="amber">{a}</Tag>)}
                              </div>
                            : <p className="text-xs text-gray-400 italic">Sin antecedentes registrados</p>
                        }
                    </div>
                </div>
            </SectionCard>

            {/* ══ SECCIÓN 3: Clínica ══ */}
            <SectionCard icon={faPills} title="Datos clínicos">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

                    {/* Alergias */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                            Alergias conocidas
                        </p>
                        {alergias.ninguna
                            ? <Tag color="green">
                                <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />
                                Sin alergias conocidas
                              </Tag>
                            : hayAlergias
                            ? <div className="space-y-2">
                                {[['Medicamentos', alergias.medicamentos], ['Alimentos', alergias.alimentos], ['Ambientales', alergias.ambientales]]
                                    .filter(([, v]) => v)
                                    .map(([label, val]) => (
                                        <div key={label} className="flex items-start gap-2">
                                            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
                                            <span className="text-sm text-gray-700">{val}</span>
                                        </div>
                                    ))
                                }
                              </div>
                            : <p className="text-xs text-gray-400 italic">Sin información de alergias</p>
                        }
                    </div>

                    {/* Medicación */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                            Medicación actual
                        </p>
                        {meds[0]?.ninguna
                            ? <Tag color="blue">
                                <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />
                                No usa medicamentos
                              </Tag>
                            : hayMeds
                            ? <div className="space-y-2">
                                {meds.filter(m => m.nombre).map((m, i) => (
                                    <div key={i} className="grid grid-cols-2 gap-x-4 gap-y-0.5 bg-gray-50 rounded-lg px-3 py-2 text-xs">
                                        <span className="font-semibold text-gray-800 col-span-2">{m.nombre}</span>
                                        {m.dosis      && <span className="text-gray-500">Dosis: <span className="text-gray-700">{m.dosis}</span></span>}
                                        {m.frecuencia && <span className="text-gray-500">Frecuencia: <span className="text-gray-700">{m.frecuencia}</span></span>}
                                        {m.via        && <span className="text-gray-500">Vía: <span className="text-gray-700">{m.via}</span></span>}
                                    </div>
                                ))}
                              </div>
                            : <p className="text-xs text-gray-400 italic">Sin medicación registrada</p>
                        }
                    </div>
                </div>
            </SectionCard>

            {/* ══ SECCIÓN 4: Hábitos y red de cuidados ══ */}
            <SectionCard icon={faLeaf} title="Hábitos y entorno" defaultOpen={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">

                    {/* Hábitos */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Hábitos de vida
                        </p>
                        {[
                            ['Tabaquismo',  habitos.tabaquismo],
                            ['Alcoholismo', habitos.alcoholismo],
                            ['Alimentación', habitos.alimentacion],
                        ].map(([label, val]) => (
                            <div key={label} className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                                <Tag color={
                                    val === 'No' || val === 'Balanceada' ? 'green'
                                    : val === 'Sí' || val === 'Habitual' || val === 'Hipergrasas' ? 'red'
                                    : 'amber'
                                }>
                                    {val || '—'}
                                </Tag>
                            </div>
                        ))}
                    </div>

                    {/* Red de cuidados */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                            Red de cuidados
                        </p>
                        {redCuidados
                            ? <Tag color={redCuidados.includes('Insuficiente') ? 'red' : 'blue'}>
                                <FontAwesomeIcon icon={faPeopleRoof} className="mr-1.5" />
                                {redCuidados}
                              </Tag>
                            : <p className="text-xs text-gray-400 italic">Sin información</p>
                        }
                    </div>
                </div>
            </SectionCard>

            {/* ══ SECCIÓN 5: Historial de ingresos ══ */}
            <SectionCard icon={faHospital} title="Historial de ingresos" defaultOpen={false}>
                <div className="pt-4 space-y-3">
                    {admissions.length === 0
                        ? <p className="text-xs text-gray-400 italic">Sin ingresos registrados</p>
                        : admissions.map((adm, i) => (
                            <div key={adm._id || i}
                                 className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                                {/* Diagnóstico + estado */}
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <EstadoBadge estado={adm.estado} />
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            #{adm._id?.slice(-5).toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faStethoscope} className="text-[#16a09e] text-xs" />
                                        {adm.ingreso?.diagnosticoMedico || '—'}
                                    </p>
                                </div>

                                {/* Servicio + cama */}
                                <div>
                                    <DataField
                                        label="Servicio / Unidad"
                                        value={adm.ingreso?.servicio || '—'} />
                                    <DataField
                                        label="Cama"
                                        value={adm.ingreso?.cama
                                            ? <span className="flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faBed} className="text-xs text-gray-400" />
                                                {adm.ingreso.cama}
                                              </span>
                                            : '—'
                                        } />
                                </div>

                                {/* Fechas */}
                                <div>
                                    <DataField
                                        label="Ingreso"
                                        value={
                                            <span className="flex items-center gap-1.5 flex-wrap">
                                                <FontAwesomeIcon icon={faCalendarDay} className="text-xs text-gray-400" />
                                                {formatFecha(adm.ingreso?.fecha)}
                                                {adm.ingreso?.hora && (
                                                    <span className="flex items-center gap-1 text-gray-400">
                                                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                                        {adm.ingreso.hora}
                                                    </span>
                                                )}
                                            </span>
                                        } />
                                    {adm.egreso?.fecha && (
                                        <DataField
                                            label="Egreso"
                                            value={
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faCalendarDay} className="text-xs text-gray-400" />
                                                    {formatFecha(adm.egreso.fecha)}
                                                    {adm.egreso.tipo && <Tag color="gray">{adm.egreso.tipo}</Tag>}
                                                </span>
                                            } />
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </SectionCard>

        </div>
    );
}