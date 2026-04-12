import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers, faUserPlus, faUserCheck, faUserXmark,
    faSpinner, faXmark, faCheck, faEye,
    faEnvelope, faClock, faUserCircle
} from '@fortawesome/free-solid-svg-icons';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(identidad = {}) {
    const n  = identidad.nombre?.[0]          || '';
    const ap = identidad.apellido_paterno?.[0] || '';
    return (ap + n).toUpperCase() || '?';
}

function getNombreCompleto(identidad = {}) {
    return [identidad.apellido_paterno, identidad.apellido_materno, identidad.nombre]
        .filter(Boolean).join(' ');
}

/* ─── Input Helper (Fuera del Modal para evitar perder el foco) ──────────── */
const inputCls = "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20 transition";

const Field = ({ name, label, value, onChange, type = 'text', placeholder = '', required = true, className = '' }) => (
    <div className={className}>
        <p className="text-xs text-gray-400 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</p>
        <input type={type} name={name} value={value} onChange={onChange}
               placeholder={placeholder} required={required} className={inputCls} />
    </div>
);

/* ─── Modal crear enfermero ─────────────────────────────────────────────── */
function CrearEnfermeroModal({ onClose, onCreated }) {
    const [formData, setFormData] = useState({
        nombre: '', apellido_paterno: '', apellido_materno: '',
        cedula_profesional: '', curp_dni: '',
        telefono: '', calle: '', ciudad: '', estado: '',
        grado_academico: '', institucion_egreso: '',
        unidad_hospitalaria: '', area_asignada: '', turno: '',
        correo_electronico: '', password: '', confirmar: ''
    });
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handle = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmar) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/api/enfermero/crear', formData);
            onCreated(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el enfermero.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0f3460] flex items-center justify-center text-white text-sm">
                            <FontAwesomeIcon icon={faUserPlus} />
                        </div>
                        <h2 className="font-semibold text-gray-800">Agregar enfermero al equipo</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-600 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* 1. Identidad */}
                    <div>
                        <p className="text-xs font-bold text-[#0f3460] uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">
                            1. Identidad
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field name="nombre" label="Nombre(s)" value={formData.nombre} onChange={handle} />
                            <Field name="apellido_paterno" label="Ap. paterno" value={formData.apellido_paterno} onChange={handle} />
                            <Field name="apellido_materno" label="Ap. materno" value={formData.apellido_materno} onChange={handle} required={false} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <Field name="cedula_profesional" label="Cédula profesional" value={formData.cedula_profesional} onChange={handle} />
                            <Field name="curp_dni" label="CURP" placeholder="18 caracteres" value={formData.curp_dni} onChange={handle} />
                        </div>
                    </div>

                    {/* 2. Contacto */}
                    <div>
                        <p className="text-xs font-bold text-[#0f3460] uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">
                            2. Ubicación y contacto
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field name="telefono" label="Teléfono" value={formData.telefono} onChange={handle} />
                            <Field name="ciudad" label="Ciudad" value={formData.ciudad} onChange={handle} />
                            <Field name="estado" label="Estado" value={formData.estado} onChange={handle} />
                            <Field name="calle" label="Calle y número" value={formData.calle} onChange={handle} />
                        </div>
                    </div>

                    {/* 3. Laboral */}
                    <div>
                        <p className="text-xs font-bold text-[#0f3460] uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">
                            3. Datos laborales y académicos
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field name="unidad_hospitalaria" label="Unidad hospitalaria" placeholder="Ej. Hospital Civil" value={formData.unidad_hospitalaria} onChange={handle} />
                            <Field name="area_asignada" label="Área asignada" placeholder="Ej. Urgencias" value={formData.area_asignada} onChange={handle} />
                            <Field name="grado_academico" label="Grado académico" value={formData.grado_academico} onChange={handle} />
                            <Field name="institucion_egreso" label="Institución de egreso" value={formData.institucion_egreso} onChange={handle} />
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-1">Turno <span className="text-red-400">*</span></p>
                            <select name="turno" value={formData.turno} onChange={handle}
                                    required className={inputCls}>
                                <option value="">Seleccionar...</option>
                                {['Matutino','Vespertino','Nocturno','Jornada Acumulada'].map(t => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 4. Credenciales */}
                    <div>
                        <p className="text-xs font-bold text-[#0f3460] uppercase tracking-widest border-b border-gray-100 pb-1 mb-3">
                            4. Credenciales
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field name="correo_electronico" label="Correo electrónico" type="email" className="sm:col-span-3" value={formData.correo_electronico} onChange={handle} />
                            <Field name="password" label="Contraseña" type="password" className="sm:col-span-1" value={formData.password} onChange={handle} />
                            <Field name="confirmar" label="Confirmar contraseña" type="password" className="sm:col-span-2" value={formData.confirmar} onChange={handle} />
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0f3460] text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all disabled:opacity-60">
                            {loading
                                ? <FontAwesomeIcon icon={faSpinner} spin />
                                : <FontAwesomeIcon icon={faCheck} />
                            }
                            Crear cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Modal ver pacientes del enfermero ──────────────────────────────────── */
function PacientesModal({ enfermero, onClose }) {
    const [pacientes, setPacientes] = useState([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        api.get(`/api/patients?enfermeroId=${enfermero._id}`)
            .then(res => setPacientes(res.data))
            .catch(() => setPacientes([]))
            .finally(() => setLoading(false));
    }, [enfermero._id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                 onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="font-semibold text-gray-800">Pacientes de {enfermero.identidad?.nombre}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{pacientes.length} registrados</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8 text-gray-400">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-xl" />
                        </div>
                    ) : pacientes.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 italic py-8">Sin pacientes registrados</p>
                    ) : (
                        <div className="space-y-2">
                            {pacientes.map(p => {
                                const nombre = [p.nombre?.apellidoPaterno, p.nombre?.nombre].filter(Boolean).join(', ');
                                return (
                                    <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-[#0f3460]/10 text-[#0f3460] flex items-center justify-center text-xs font-bold shrink-0">
                                            {(p.nombre?.apellidoPaterno?.[0] || '') + (p.nombre?.nombre?.[0] || '')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{nombre}</p>
                                            <p className="text-xs text-gray-400 font-mono">{p.curp}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Vista principal ────────────────────────────────────────────────────── */
export default function TeamView() {
    const [equipo,    setEquipo]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [showCrear, setShowCrear] = useState(false);
    const [verPacientes, setVerPacientes] = useState(null);
    const [togglingId,   setTogglingId]   = useState(null);

    useEffect(() => {
        cargarEquipo();
    }, []);

    async function cargarEquipo() {
        setLoading(true);
        try {
            const { data } = await api.get('/api/enfermero/equipo');
            setEquipo(data);
        } catch {
            console.error('Error cargando equipo');
        } finally {
            setLoading(false);
        }
    }

    async function toggleEstado(enfermero) {
        const nuevoEstado = enfermero.cuenta.estado_cuenta === 'activo' ? 'inactivo' : 'activo';
        setTogglingId(enfermero._id);
        try {
            await api.patch(`/api/enfermero/${enfermero._id}/estado`, { estado: nuevoEstado });
            setEquipo(prev => prev.map(e =>
                e._id === enfermero._id
                    ? { ...e, cuenta: { ...e.cuenta, estado_cuenta: nuevoEstado } }
                    : e
            ));
        } catch {
            alert('Error al cambiar el estado.');
        } finally {
            setTogglingId(null);
        }
    }

    function handleCreated(nuevo) {
        setEquipo(prev => [...prev, { ...nuevo, totalPacientes: 0 }]);
        setShowCrear(false);
    }

    const activos   = equipo.filter(e => e.cuenta.estado_cuenta === 'activo').length;
    const inactivos = equipo.filter(e => e.cuenta.estado_cuenta !== 'activo').length;

    return (
        <div className="space-y-6 pb-10">

            {/* Modales */}
            {showCrear && (
                <CrearEnfermeroModal onClose={() => setShowCrear(false)} onCreated={handleCreated} />
            )}
            {verPacientes && (
                <PacientesModal enfermero={verPacientes} onClose={() => setVerPacientes(null)} />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Equipo de enfermería</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {activos} activos · {inactivos} inactivos
                    </p>
                </div>
                <button onClick={() => setShowCrear(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f3460] text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all shadow-md">
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span className="hidden sm:inline">Agregar enfermero</span>
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { icon: faUsers,     label: 'Total equipo', value: equipo.length, color: 'bg-blue-50 text-blue-600'  },
                    { icon: faUserCheck, label: 'Activos',       value: activos,       color: 'bg-green-50 text-green-600' },
                    { icon: faUserXmark, label: 'Inactivos',     value: inactivos,     color: 'bg-red-50 text-red-500'    },
                ].map(({ icon, label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <FontAwesomeIcon icon={icon} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                            <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Cabecera */}
                <div className="px-6 py-3 grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4
                                text-xs font-semibold text-gray-400 uppercase tracking-wide
                                border-b border-gray-100 items-center">
                    <span>Enfermero</span>
                    <span>Correo</span>
                    <span>Turno</span>
                    <span>Pacientes</span>
                    <span />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-3" />
                        <span className="text-sm">Cargando equipo…</span>
                    </div>
                ) : equipo.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                        <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-200" />
                        <p className="text-sm">No hay enfermeros en tu equipo aún.</p>
                        <button onClick={() => setShowCrear(true)}
                                className="text-xs text-[#16a09e] underline underline-offset-2">
                            Agregar el primero
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {equipo.map(e => {
                            const activo    = e.cuenta.estado_cuenta === 'activo';
                            const toggling  = togglingId === e._id;
                            return (
                                <div key={e._id}
                                     className="px-6 py-4 grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center hover:bg-gray-50 transition-colors">

                                    {/* Nombre + avatar */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0
                                            ${activo ? 'bg-[#0f3460]/10 text-[#0f3460]' : 'bg-gray-100 text-gray-400'}`}>
                                            {getInitials(e.identidad)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${activo ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {getNombreCompleto(e.identidad)}
                                            </p>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                                                ${activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                {activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Correo */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-xs text-gray-300 shrink-0" />
                                        <span className="truncate">{e.cuenta.correo_electronico}</span>
                                    </div>

                                    {/* Turno */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <FontAwesomeIcon icon={faClock} className="text-xs text-gray-300 shrink-0" />
                                        <span className="truncate">{e.datos_laborales?.turno || '—'}</span>
                                    </div>

                                    {/* Pacientes */}
                                    <div className="text-sm font-semibold text-gray-700 text-center">
                                        {e.totalPacientes}
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setVerPacientes(e)}
                                            title="Ver pacientes"
                                            className="p-2 rounded-lg bg-[#0f3460]/10 text-[#0f3460] hover:bg-[#0f3460]/20 transition-colors text-xs">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        <button
                                            onClick={() => toggleEstado(e)}
                                            disabled={toggling}
                                            title={activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                                            className={`p-2 rounded-lg text-xs transition-colors disabled:opacity-50
                                                ${activo
                                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                            {toggling
                                                ? <FontAwesomeIcon icon={faSpinner} spin />
                                                : <FontAwesomeIcon icon={activo ? faUserXmark : faUserCheck} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}