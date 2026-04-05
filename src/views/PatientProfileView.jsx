import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft, faUser, faHospital, faNotesMedical,
    faPills, faLeaf, faPeopleRoof, faTriangleExclamation,
    faBed, faStethoscope, faCalendarDay, faClock,
    faCircleCheck, faCircleXmark, faChevronDown, faChevronUp,
    faPencil, faCheck, faXmark, faPlus, faTrash, faSpinner,
    faHeartPulse,
} from '@fortawesome/free-solid-svg-icons';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const bloodColors = {
    'A+':  'bg-red-100 text-red-700',    'A-':  'bg-red-100 text-red-700',
    'B+':  'bg-orange-100 text-orange-700', 'B-': 'bg-orange-100 text-orange-700',
    'AB+': 'bg-purple-100 text-purple-700', 'AB-':'bg-purple-100 text-purple-700',
    'O+':  'bg-blue-100 text-blue-700',   'O-':  'bg-blue-100 text-blue-700',
};

function formatFecha(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getInitials(nombre = {}) {
    return ((nombre.apellidoPaterno?.[0] || '') + (nombre.nombre?.[0] || '')).toUpperCase() || '?';
}

const getVitalColor = (label, value) => {
    if (value == null) return "bg-gray-50 text-gray-800";

    switch (label) {
        case 'FC':
            if (value < 60 || value > 100) return "bg-red-100 text-red-700";
            if (value >= 90) return "bg-yellow-100 text-yellow-700";
            return "bg-green-100 text-green-700";

        case 'SpO₂':
            if (value < 90) return "bg-red-100 text-red-700";
            if (value < 95) return "bg-yellow-100 text-yellow-700";
            return "bg-green-100 text-green-700";

        case 'Temp':
            if (value >= 38) return "bg-red-100 text-red-700";
            if (value >= 37.5) return "bg-yellow-100 text-yellow-700";
            return "bg-green-100 text-green-700";

        case 'FR':
            if (value < 12 || value > 20) return "bg-red-100 text-red-700";
            return "bg-green-100 text-green-700";

        case 'Dolor':
            if (value >= 7) return "bg-red-100 text-red-700";
            if (value >= 4) return "bg-yellow-100 text-yellow-700";
            return "bg-green-100 text-green-700";

        case 'Glucosa':
            if (value < 70) return "bg-red-100 text-red-700";     // hipoglucemia
            if (value > 180) return "bg-red-100 text-red-700";    // alta
            if (value > 120) return "bg-yellow-100 text-yellow-700";
            return "bg-green-100 text-green-700";

        case 'PA': {
            if (!value || typeof value !== 'string') return "bg-gray-50 text-gray-800";

            const [sys, dia] = value.split('/').map(Number);

            if (!sys || !dia) return "bg-gray-50 text-gray-800";

            if (sys < 90 || dia < 60) return "bg-red-100 text-red-700";
            if (sys > 140 || dia > 90) return "bg-red-100 text-red-700";
            if (sys > 120 || dia > 80) return "bg-yellow-100 text-yellow-700";

            return "bg-green-100 text-green-700";
        }

        case 'IMC':
            if (value < 18.5) return "bg-blue-100 text-blue-700";   // bajo peso
            if (value < 25)   return "bg-green-100 text-green-700"; // normal
            if (value < 30)   return "bg-yellow-100 text-yellow-700"; // sobrepeso
            return "bg-red-100 text-red-700"; // obesidad

        default:
            return "bg-gray-50 text-gray-800";
    }
};

function parseFechaDDMMYYYY(str) {
    if (!str) return '';
    if (str.includes('T') || str.includes('-')) {
        const d = new Date(str);
        if (isNaN(d)) return '';
        return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()]
            .map(n => String(n).padStart(2, '0')).join('/');
    }
    return str;
}

function toISOFromDDMMYYYY(str) {
    if (!str) return null;
    if (str.includes('T') || str.includes('-')) return str;
    const [d, m, y] = str.split('/');
    return new Date(`${y}-${m}-${d}T00:00:00`).toISOString();
}

function ModalNuevaToma({ pacienteId, onClose, onSaved }) {
    const [form, setForm] = useState({
        frecuenciaCardiaca: '', sistolica: '', diastolica: '',
        frecuenciaRespiratoria: '', temperatura: '', saturacionOxigeno: '',
        glucosa: '', peso: '', talla: '', dolor: '', observaciones: ''
    });
    const [saving, setSaving] = useState(false);

    const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20 transition";
    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    async function handleSave() {
        setSaving(true);
        try {
            const { data } = await api.post(`/api/vitalsigns`, {
                pacienteId,
                signos: {
                    frecuenciaCardiaca:     form.frecuenciaCardiaca     ? Number(form.frecuenciaCardiaca)     : undefined,
                    presionArterial: (form.sistolica || form.diastolica) ? {
                        sistolica:  form.sistolica  ? Number(form.sistolica)  : undefined,
                        diastolica: form.diastolica ? Number(form.diastolica) : undefined,
                    } : undefined,
                    frecuenciaRespiratoria: form.frecuenciaRespiratoria ? Number(form.frecuenciaRespiratoria) : undefined,
                    temperatura:            form.temperatura            ? Number(form.temperatura)            : undefined,
                    saturacionOxigeno:      form.saturacionOxigeno      ? Number(form.saturacionOxigeno)      : undefined,
                    glucosa:                form.glucosa                ? Number(form.glucosa)                : undefined,
                    peso:                   form.peso                   ? Number(form.peso)                   : undefined,
                    talla:                  form.talla                  ? Number(form.talla)                  : undefined,
                    dolor:                  form.dolor                  ? Number(form.dolor)                  : undefined,
                },
                observaciones: form.observaciones,
            });
            onSaved(data);
        } catch {
            alert('Error al guardar los signos vitales.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
                 onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0f3460] flex items-center justify-center text-white text-sm">
                            <FontAwesomeIcon icon={faHeartPulse} />
                        </div>
                        <h2 className="font-semibold text-gray-800">Nueva toma de signos vitales</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            ['frecuenciaCardiaca',     'FC',      'bpm',   'number', '0','300','1'],
                            ['frecuenciaRespiratoria', 'FR',      'rpm',   'number', '0','60', '1'],
                            ['temperatura',            'Temp',    '°C',    'number', '30','45','0.1'],
                            ['saturacionOxigeno',      'SpO₂',    '%',     'number', '0','100','1'],
                            ['glucosa',                'Glucosa', 'mg/dL', 'number', '0','','1'],
                            ['peso',                   'Peso',    'kg',    'number', '0','','0.1'],
                            ['talla',                  'Talla',   'cm',    'number', '0','','1'],
                            ['dolor',                  'Dolor',   '0–10',  'number', '0','10','1'],
                        ].map(([name, label, unit, type, min, max, step]) => (
                            <div key={name}>
                                <p className="text-xs text-gray-400 mb-1">
                                    {label} <span className="text-gray-300">{unit}</span>
                                </p>
                                <input name={name} type={type} min={min} max={max || undefined} step={step}
                                       value={form[name]} onChange={handle}
                                       className={inputCls} />
                            </div>
                        ))}

                        {/* PA separada */}
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-gray-400 mb-1">PA <span className="text-gray-300">mmHg</span></p>
                            <div className="flex items-center gap-1">
                                <input name="sistolica" type="number" min="0" max="300"
                                       value={form.sistolica} onChange={handle}
                                       placeholder="120" className={inputCls} />
                                <span className="text-gray-400 font-bold">/</span>
                                <input name="diastolica" type="number" min="0" max="200"
                                       value={form.diastolica} onChange={handle}
                                       placeholder="80" className={inputCls} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 mb-1">Observaciones</p>
                        <textarea name="observaciones" rows={2} value={form.observaciones}
                                  onChange={handle} placeholder="Notas adicionales..."
                                  className={`${inputCls} resize-none`} />
                    </div>
                </div>

                <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0f3460] text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all disabled:opacity-60">
                        {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
                        Guardar toma
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Clases de inputs ───────────────────────────────────────────────────── */
const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

/* ─── Sub-componentes base ───────────────────────────────────────────────── */

const Tag = ({ children, color = 'gray' }) => {
    const colors = {
        gray: 'bg-gray-100 text-gray-600', red: 'bg-red-50 text-red-600',
        green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700',
        blue: 'bg-blue-50 text-blue-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colors[color]}`}>
            {children}
        </span>
    );
};

const EstadoBadge = ({ estado }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        ${estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        <FontAwesomeIcon icon={estado === 'Activo' ? faCircleCheck : faCircleXmark} className="text-[10px]" />
        {estado}
    </span>
);

const DataField = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
);

/* ─── SectionCard con botón editar ───────────────────────────────────────── */
const SectionCard = ({ icon, title, children, defaultOpen = true, onEdit, editing, saving }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
                <button type="button" onClick={() => setOpen(v => !v)}
                        className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-[#0f3460] flex items-center justify-center text-white text-sm shrink-0">
                        <FontAwesomeIcon icon={icon} />
                    </div>
                    <h2 className="text-sm font-semibold tracking-wide text-[#0f3460] uppercase">{title}</h2>
                    <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-gray-400 text-xs ml-1" />
                </button>
                {onEdit && !editing && (
                    <button onClick={onEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:border-[#0f3460]/40 hover:text-[#0f3460] transition-all">
                        <FontAwesomeIcon icon={faPencil} className="text-[10px]" />
                        <span className="hidden sm:inline">Editar</span>
                    </button>
                )}
                {editing && (
                    <span className="text-xs font-semibold text-[#16a09e] flex items-center gap-1.5">
                        {saving && <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />}
                        Editando…
                    </span>
                )}
            </div>
            {open && (
                <div className="px-6 pb-5 border-t border-gray-100">
                    {children}
                </div>
            )}
        </div>
    );
};

/* ─── Botones guardar / cancelar ─────────────────────────────────────────── */
const EditActions = ({ onSave, onCancel, saving }) => (
    <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-100">
        <button onClick={onCancel} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
            <FontAwesomeIcon icon={faXmark} />
            Cancelar
        </button>
        <button onClick={onSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0f3460] text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all disabled:opacity-60">
            {saving
                ? <FontAwesomeIcon icon={faSpinner} spin />
                : <FontAwesomeIcon icon={faCheck} />
            }
            Guardar
        </button>
    </div>
);

/* ─── Checkbox editable ──────────────────────────────────────────────────── */
const CheckEdit = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
               className="w-4 h-4 rounded border-2 border-gray-300 accent-[#0f3460] cursor-pointer" />
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{label}</span>
    </label>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  VISTA PRINCIPAL                                                           */
/* ══════════════════════════════════════════════════════════════════════════ */

export default function PatientProfileView() {
    const { id }             = useParams();
    const navigate           = useNavigate();
    const [searchParams]     = useSearchParams();

    const [data, setData]           = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [ultimoSigno, setUltimoSigno] = useState(null);
    const [modalSignos, setModalSignos] = useState(false);

    /* ── Estados de edición por sección ── */
    const [editIdent,  setEditIdent]  = useState(false);
    const [editAnt,    setEditAnt]    = useState(false);
    const [editClinic, setEditClinic] = useState(false);
    const [editHabits, setEditHabits] = useState(false);
    const [saving,     setSaving]     = useState(''); // qué sección está guardando

    /* ── Drafts de edición ── */
    const [draftIdent,  setDraftIdent]  = useState(null);
    const [draftAnt,    setDraftAnt]    = useState(null);
    const [draftClinic, setDraftClinic] = useState(null);
    const [draftHabits, setDraftHabits] = useState(null);

    /* ── Cargar datos ── */
    useEffect(() => {
        api.get(`/api/patients/${id}`)
            .then(res => {
                setData({
                    patient:        res.data.patient        || res.data,
                    clinicalRecord: res.data.clinicalRecord || null,
                    admissions:     res.data.admissions     || [],
                });
                api.get(`/api/vitalsigns/paciente/${id}`)
                    .then(r => setUltimoSigno(r.data[0] || null))
                    .catch(() => {});
                if (searchParams.get('edit') === 'true') setEditIdent(true);
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
            <button onClick={() => navigate('/patients')} className="text-xs text-[#16a09e] underline underline-offset-2">
                Volver a pacientes
            </button>
        </div>
    );

    const { patient, clinicalRecord, admissions } = data;
    const { nombre, curp, demograficos, edad }    = patient;
    const sexo      = demograficos?.sexo;
    const sangre    = demograficos?.tipoSangre;
    const bloodClass = bloodColors[sangre] || 'bg-gray-100 text-gray-600';
    const avatarBg   = sexo === 'M' ? 'bg-blue-100 text-blue-600'
                     : sexo === 'F' ? 'bg-pink-100 text-pink-600'
                     : 'bg-gray-100 text-gray-500';
    const nombreCompleto = [nombre?.apellidoPaterno, nombre?.apellidoMaterno, nombre?.nombre].filter(Boolean).join(' ');

    const ant       = clinicalRecord?.antecedentes    || {};
    const alergias  = clinicalRecord?.alergias        || {};
    const meds      = clinicalRecord?.medicacionActual || [];
    const habitos   = clinicalRecord?.habitos         || {};
    const redCuidados = clinicalRecord?.redCuidados   || '';
    const hayMeds    = meds.length > 0 && !meds[0]?.ninguna && meds.some(m => m.nombre);
    const hayAlergias = !alergias.ninguna && (alergias.medicamentos || alergias.alimentos || alergias.ambientales);

    /* ════════════════════════════════════════════════════════════════════════
       HANDLERS DE EDICIÓN
    ════════════════════════════════════════════════════════════════════════ */

    /* ── Identificación ── */
    function startEditIdent() {
        setDraftIdent({
            nombre:   { ...nombre },
            curp:     curp || '',
            fechaNacimiento: parseFechaDDMMYYYY(demograficos?.fechaNacimiento),
            sexo:     demograficos?.sexo || '',
            tipoSangre: demograficos?.tipoSangre || '',
        });
        setEditIdent(true);
    }

    async function saveIdent() {
        setSaving('ident');
        try {
            const res = await api.put(`/api/patients/${id}`, {
                nombre:      draftIdent.nombre,
                curp:        draftIdent.curp.toUpperCase(),
                demograficos: {
                    fechaNacimiento: toISOFromDDMMYYYY(draftIdent.fechaNacimiento),
                    sexo:       draftIdent.sexo,
                    tipoSangre: draftIdent.tipoSangre,
                },
            });
            setData(prev => ({ ...prev, patient: res.data }));
            setEditIdent(false);
        } catch {
            alert('Error al guardar los datos de identificación.');
        } finally {
            setSaving('');
        }
    }

    /* ── Antecedentes ── */
    function startEditAnt() {
        const toggled = (arr, key) => ({
            active: (ant[arr] || []).includes(key),
            toggle: (prev) => {
                const list = prev[arr] || [];
                return list.includes(key) ? list.filter(v => v !== key) : [...list, key];
            }
        });
        setDraftAnt({
            patologicos:   [...(ant.patologicos   || [])],
            noPatologicos: [...(ant.noPatologicos  || [])],
            quirurgicos:   [...(ant.quirurgicos    || [])],
            otroPat:    (ant.patologicos   || []).find(v => v.startsWith('Otro: '))?.replace('Otro: ','') || '',
            otroNoPat:  (ant.noPatologicos || []).find(v => v.startsWith('Otro: '))?.replace('Otro: ','') || '',
            otroQuir:   (ant.quirurgicos   || []).find(v => v.startsWith('Otro: '))?.replace('Otro: ','') || '',
        });
        setEditAnt(true);
    }

    function toggleAntItem(group, value) {
        setDraftAnt(prev => {
            const list = prev[group] || [];
            const filtered = list.filter(v => !v.startsWith('Otro: ') && v !== value);
            return {
                ...prev,
                [group]: list.includes(value) ? filtered : [...filtered, value],
            };
        });
    }

    async function saveAnt() {
        setSaving('ant');
        try {
            const buildList = (list, otroKey) => {
                const base = list.filter(v => !v.startsWith('Otro: '));
                if (draftAnt[otroKey]) base.push(`Otro: ${draftAnt[otroKey]}`);
                return base;
            };
            const payload = {
                antecedentes: {
                    patologicos:   buildList(draftAnt.patologicos,   'otroPat'),
                    noPatologicos: buildList(draftAnt.noPatologicos, 'otroNoPat'),
                    quirurgicos:   buildList(draftAnt.quirurgicos,   'otroQuir'),
                },
            };
            const res = await api.put(`/api/patients/${id}/expediente`, payload);
            setData(prev => ({ ...prev, clinicalRecord: res.data }));
            setEditAnt(false);
        } catch {
            alert('Error al guardar antecedentes.');
        } finally {
            setSaving('');
        }
    }

    /* ── Clínica (alergias + medicación) ── */
    function startEditClinic() {
        setDraftClinic({
            alergias: {
                ninguna:      !!alergias.ninguna,
                medicamentos: alergias.medicamentos || '',
                alimentos:    alergias.alimentos    || '',
                ambientales:  alergias.ambientales  || '',
            },
            medicacionActual: meds[0]?.ninguna
                ? [{ ninguna: true, nombre: '', dosis: '', frecuencia: '', via: '' }]
                : meds.length > 0
                ? meds.map(m => ({ ...m, ninguna: false }))
                : [{ ninguna: false, nombre: '', dosis: '', frecuencia: '', via: '' }],
            noMeds: !!meds[0]?.ninguna,
        });
        setEditClinic(true);
    }

    async function saveClinic() {
        setSaving('clinic');
        try {
            const payload = {
                alergias: draftClinic.alergias,
                medicacionActual: draftClinic.noMeds
                    ? [{ ninguna: true }]
                    : draftClinic.medicacionActual.filter(m => m.nombre),
            };
            const res = await api.put(`/api/patients/${id}/expediente`, payload);
            setData(prev => ({ ...prev, clinicalRecord: res.data }));
            setEditClinic(false);
        } catch {
            alert('Error al guardar datos clínicos.');
        } finally {
            setSaving('');
        }
    }

    /* ── Hábitos ── */
    function startEditHabits() {
        setDraftHabits({
            tabaquismo:   habitos.tabaquismo   || 'No',
            alcoholismo:  habitos.alcoholismo  || 'No',
            alimentacion: habitos.alimentacion || 'Balanceada',
            redCuidados:  redCuidados          || '',
        });
        setEditHabits(true);
    }

    async function saveHabits() {
        setSaving('habits');
        try {
            const payload = {
                habitos: {
                    tabaquismo:   draftHabits.tabaquismo,
                    alcoholismo:  draftHabits.alcoholismo,
                    alimentacion: draftHabits.alimentacion,
                },
                redCuidados: draftHabits.redCuidados,
            };
            const res = await api.put(`/api/patients/${id}/expediente`, payload);
            setData(prev => ({ ...prev, clinicalRecord: res.data }));
            setEditHabits(false);
        } catch {
            alert('Error al guardar hábitos.');
        } finally {
            setSaving('');
        }
    }

    /* ════════════════════════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════════════════════════ */
    return (
        <div className="space-y-6 pb-10">

            {/* Header */}
            <div className="flex items-start gap-4">
                <button onClick={() => navigate('/patients')}
                        className="mt-1 p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all shrink-0">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${avatarBg}`}>
                        {getInitials(nombre)}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-gray-800 truncate">{nombreCompleto}</h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 font-mono tracking-widest">{curp}</span>
                            {sangre && <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${bloodClass}`}>{sangre}</span>}
                            {edad != null && <span className="text-xs text-gray-400">{edad} años</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ SECCIÓN 1: Identificación ══ */}
            <SectionCard icon={faUser} title="Identificación"
                         onEdit={!editIdent ? startEditIdent : null}
                         editing={editIdent} saving={saving === 'ident'}>

                {!editIdent ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4">
                        <DataField label="Nombre(s)"          value={nombre?.nombre} />
                        <DataField label="Apellido paterno"   value={nombre?.apellidoPaterno} />
                        <DataField label="Apellido materno"   value={nombre?.apellidoMaterno} />
                        <DataField label="CURP"               value={<span className="font-mono tracking-widest text-xs">{curp}</span>} />
                        <DataField label="Fecha de nacimiento" value={formatFecha(demograficos?.fechaNacimiento)} />
                        <DataField label="Edad"               value={edad != null ? `${edad} años` : '—'} />
                        <DataField label="Sexo biológico"     value={sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Otro'} />
                        <DataField label="Tipo de sangre"     value={
                            sangre ? <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${bloodClass}`}>{sangre}</span> : '—'
                        } />
                    </div>
                ) : draftIdent && (
                    <div className="pt-4 space-y-4">
                        {/* Nombre */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[['nombre','Nombre(s)'],['apellidoPaterno','Apellido paterno'],['apellidoMaterno','Apellido materno']].map(([key, label]) => (
                                <div key={key}>
                                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                                    <input type="text" value={draftIdent.nombre[key] || ''}
                                           onChange={e => setDraftIdent(prev => ({ ...prev, nombre: { ...prev.nombre, [key]: e.target.value } }))}
                                           className={inputCls} />
                                </div>
                            ))}
                        </div>
                        {/* CURP + Demográficos */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">CURP</p>
                                <input type="text" maxLength={18} value={draftIdent.curp}
                                       onChange={e => setDraftIdent(prev => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                                       className={`${inputCls} uppercase tracking-widest`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Fecha de nacimiento</p>
                                <input type="text" placeholder="DD/MM/AAAA" maxLength={10}
                                       value={draftIdent.fechaNacimiento}
                                       onChange={e => {
                                           let v = e.target.value.replace(/\D/g,'');
                                           if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
                                           if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5,9);
                                           setDraftIdent(prev => ({ ...prev, fechaNacimiento: v }));
                                       }}
                                       className={inputCls} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Sexo biológico</p>
                                <div className="relative">
                                    <select value={draftIdent.sexo}
                                            onChange={e => setDraftIdent(prev => ({ ...prev, sexo: e.target.value }))}
                                            className={selectCls}>
                                        <option value="" disabled>Seleccione</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                        <option value="N">Otro</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Tipo de sangre</p>
                                <div className="relative">
                                    <select value={draftIdent.tipoSangre}
                                            onChange={e => setDraftIdent(prev => ({ ...prev, tipoSangre: e.target.value }))}
                                            className={selectCls}>
                                        <option value="" disabled>Seleccione</option>
                                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
                                </div>
                            </div>
                        </div>
                        <EditActions onSave={saveIdent} onCancel={() => setEditIdent(false)} saving={saving === 'ident'} />
                    </div>
                )}
            </SectionCard>

            {/* ══ SECCIÓN 2: Antecedentes ══ */}
            <SectionCard icon={faNotesMedical} title="Antecedentes personales"
                         onEdit={!editAnt ? startEditAnt : null}
                         editing={editAnt} saving={saving === 'ant'}>

                {!editAnt ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
                        {[
                            ['Patológicos', ant.patologicos, 'red', 'bg-red-400'],
                            ['No patológicos', ant.noPatologicos, 'green', 'bg-green-400'],
                            ['Quirúrgicos', ant.quirurgicos, 'amber', 'bg-amber-400'],
                        ].map(([label, items, color, dot]) => (
                            <div key={label}>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${dot} inline-block`} />
                                    {label}
                                </p>
                                {items?.length > 0
                                    ? <div className="flex flex-wrap gap-1.5">{items.map((a,i) => <Tag key={i} color={color}>{a}</Tag>)}</div>
                                    : <p className="text-xs text-gray-400 italic">Sin antecedentes registrados</p>
                                }
                            </div>
                        ))}
                    </div>
                ) : draftAnt && (
                    <div className="pt-4 space-y-5">
                        {/* Patológicos */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Patológicos
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[['Diabetes mellitus','diabetes'],['Hipertensión arterial','hypertension'],
                                  ['Cardiopatías','cardiopathies'],['Asma / EPOC','asthma'],
                                  ['Epilepsia','epilepsy'],['Cáncer','cancer']].map(([label]) => (
                                    <CheckEdit key={label} label={label}
                                               checked={(draftAnt.patologicos || []).includes(label)}
                                               onChange={() => toggleAntItem('patologicos', label)} />
                                ))}
                            </div>
                            <div className="mt-2">
                                <input type="text" placeholder="Otro…" value={draftAnt.otroPat}
                                       onChange={e => setDraftAnt(p => ({ ...p, otroPat: e.target.value }))}
                                       className={`${inputCls} text-xs`} />
                            </div>
                        </div>
                        {/* No patológicos */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> No patológicos
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {['Esquema de vacunación completo','Actividad física regular',
                                  'Alimentación saludable','Higiene deficiente'].map(label => (
                                    <CheckEdit key={label} label={label}
                                               checked={(draftAnt.noPatologicos || []).includes(label)}
                                               onChange={() => toggleAntItem('noPatologicos', label)} />
                                ))}
                            </div>
                            <div className="mt-2">
                                <input type="text" placeholder="Otro…" value={draftAnt.otroNoPat}
                                       onChange={e => setDraftAnt(p => ({ ...p, otroNoPat: e.target.value }))}
                                       className={`${inputCls} text-xs`} />
                            </div>
                        </div>
                        {/* Quirúrgicos */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Quirúrgicos
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {['Apendicectomía','Cesárea','Cirugía ortopédica'].map(label => (
                                    <CheckEdit key={label} label={label}
                                               checked={(draftAnt.quirurgicos || []).includes(label)}
                                               onChange={() => toggleAntItem('quirurgicos', label)} />
                                ))}
                            </div>
                            <div className="mt-2">
                                <input type="text" placeholder="Otro…" value={draftAnt.otroQuir}
                                       onChange={e => setDraftAnt(p => ({ ...p, otroQuir: e.target.value }))}
                                       className={`${inputCls} text-xs`} />
                            </div>
                        </div>
                        <EditActions onSave={saveAnt} onCancel={() => setEditAnt(false)} saving={saving === 'ant'} />
                    </div>
                )}
            </SectionCard>

            {/* ══ SECCIÓN 3: Clínica ══ */}
            <SectionCard icon={faPills} title="Datos clínicos"
                         onEdit={!editClinic ? startEditClinic : null}
                         editing={editClinic} saving={saving === 'clinic'}>

                {!editClinic ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Alergias conocidas</p>
                            {alergias.ninguna
                                ? <Tag color="green"><FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />Sin alergias conocidas</Tag>
                                : hayAlergias
                                ? <div className="space-y-2">
                                    {[['Medicamentos',alergias.medicamentos],['Alimentos',alergias.alimentos],['Ambientales',alergias.ambientales]]
                                        .filter(([,v]) => v).map(([label, val]) => (
                                            <div key={label} className="flex items-start gap-2">
                                                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
                                                <span className="text-sm text-gray-700">{val}</span>
                                            </div>
                                        ))}
                                  </div>
                                : <p className="text-xs text-gray-400 italic">Sin información de alergias</p>
                            }
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Medicación actual</p>
                            {meds[0]?.ninguna
                                ? <Tag color="blue"><FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />No usa medicamentos</Tag>
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
                ) : draftClinic && (
                    <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Alergias edit */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alergias</p>
                            {[['Medicamentos','medicamentos'],['Alimentos','alimentos'],['Ambientales','ambientales']].map(([label, key]) => (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                                    <input type="text" placeholder="Describir…"
                                           disabled={draftClinic.alergias.ninguna}
                                           value={draftClinic.alergias[key] || ''}
                                           onChange={e => setDraftClinic(prev => ({ ...prev, alergias: { ...prev.alergias, [key]: e.target.value } }))}
                                           className={draftClinic.alergias.ninguna ? 'w-full rounded-lg border border-gray-100 bg-gray-100 px-3 py-2 text-sm text-gray-400 cursor-not-allowed' : inputCls} />
                                </div>
                            ))}
                            <label className="flex items-center gap-2.5 pt-2 border-t border-gray-100 cursor-pointer">
                                <input type="checkbox" checked={draftClinic.alergias.ninguna}
                                       onChange={e => setDraftClinic(prev => ({
                                           ...prev,
                                           alergias: { ninguna: e.target.checked, medicamentos: '', alimentos: '', ambientales: '' }
                                       }))}
                                       className="w-4 h-4 rounded accent-[#0f3460]" />
                                <span className="text-sm text-gray-600">Sin alergias conocidas</span>
                            </label>
                        </div>
                        {/* Medicación edit */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicación</p>
                                {!draftClinic.noMeds && (
                                    <button type="button"
                                            onClick={() => setDraftClinic(prev => ({
                                                ...prev,
                                                medicacionActual: [...prev.medicacionActual, { ninguna: false, nombre: '', dosis: '', frecuencia: '', via: '' }]
                                            }))}
                                            className="flex items-center gap-1 text-xs font-semibold text-[#16a09e] hover:text-[#0f7b79] transition-colors">
                                        <FontAwesomeIcon icon={faPlus} /> Agregar
                                    </button>
                                )}
                            </div>
                            {draftClinic.noMeds
                                ? <p className="text-xs text-gray-400 italic py-2">Sin medicación registrada</p>
                                : draftClinic.medicacionActual.map((med, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        {draftClinic.medicacionActual.length > 1 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase">Medicamento {idx + 1}</span>
                                                <button onClick={() => setDraftClinic(prev => ({
                                                    ...prev,
                                                    medicacionActual: prev.medicacionActual.filter((_, i) => i !== idx)
                                                }))} className="text-xs text-red-400 hover:text-red-600">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            {[['nombre','Medicamento'],['dosis','Dosis'],['frecuencia','Frecuencia'],['via','Vía']].map(([key, ph]) => (
                                                <input key={key} type="text" placeholder={ph} value={med[key] || ''}
                                                       onChange={e => setDraftClinic(prev => ({
                                                           ...prev,
                                                           medicacionActual: prev.medicacionActual.map((m, i) => i === idx ? { ...m, [key]: e.target.value } : m)
                                                       }))}
                                                       className={`${inputCls} text-xs`} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                            <label className="flex items-center gap-2.5 pt-2 border-t border-gray-100 cursor-pointer">
                                <input type="checkbox" checked={draftClinic.noMeds}
                                       onChange={e => setDraftClinic(prev => ({
                                           ...prev,
                                           noMeds: e.target.checked,
                                           medicacionActual: e.target.checked ? [] : [{ ninguna: false, nombre: '', dosis: '', frecuencia: '', via: '' }]
                                       }))}
                                       className="w-4 h-4 rounded accent-[#0f3460]" />
                                <span className="text-sm text-gray-600">No usa medicamentos</span>
                            </label>
                        </div>
                        <div className="lg:col-span-2">
                            <EditActions onSave={saveClinic} onCancel={() => setEditClinic(false)} saving={saving === 'clinic'} />
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ══ SECCIÓN 4: Hábitos ══ */}
            <SectionCard icon={faLeaf} title="Hábitos y entorno" defaultOpen={false}
                         onEdit={!editHabits ? startEditHabits : null}
                         editing={editHabits} saving={saving === 'habits'}>

                {!editHabits ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Hábitos de vida</p>
                            {[['Tabaquismo',habitos.tabaquismo],['Alcoholismo',habitos.alcoholismo],['Alimentación',habitos.alimentacion]].map(([label,val]) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                                    <Tag color={val === 'No' || val === 'Balanceada' ? 'green' : val === 'Sí' || val === 'Habitual' || val === 'Hipergrasas' ? 'red' : 'amber'}>
                                        {val || '—'}
                                    </Tag>
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Red de cuidados</p>
                            {redCuidados
                                ? <Tag color={redCuidados.includes('Insuficiente') ? 'red' : 'blue'}>
                                    <FontAwesomeIcon icon={faPeopleRoof} className="mr-1.5" />{redCuidados}
                                  </Tag>
                                : <p className="text-xs text-gray-400 italic">Sin información</p>
                            }
                        </div>
                    </div>
                ) : draftHabits && (
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Hábitos de vida</p>
                            {[
                                ['tabaquismo','Tabaquismo',['No','Exfumador','Sí']],
                                ['alcoholismo','Alcoholismo',['No','Social','Habitual']],
                                ['alimentacion','Alimentación',['Balanceada','Deficiente','Hipergrasas']],
                            ].map(([key, label, opts]) => (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                                    <div className="relative flex-1">
                                        <select value={draftHabits[key]}
                                                onChange={e => setDraftHabits(prev => ({ ...prev, [key]: e.target.value }))}
                                                className={selectCls}>
                                            {opts.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Red de cuidados</p>
                            {[['Vive solo'],['Vive con familia'],['Tiene cuidador primario'],['Apoyos comunitarios'],['Insuficiente o inexistente']].map(([val]) => (
                                <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                                    <input type="radio" name="redCuidados" value={val}
                                           checked={draftHabits.redCuidados === val}
                                           onChange={e => setDraftHabits(prev => ({ ...prev, redCuidados: e.target.value }))}
                                           className="w-4 h-4 accent-[#0f3460]" />
                                    <span className={`text-sm ${val.includes('Insuficiente') ? 'text-red-500 font-medium' : 'text-gray-600'}`}>{val}</span>
                                </label>
                            ))}
                        </div>
                        <div className="sm:col-span-2">
                            <EditActions onSave={saveHabits} onCancel={() => setEditHabits(false)} saving={saving === 'habits'} />
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ══ SECCIÓN: Signos vitales ══ */}
            <SectionCard icon={faHeartPulse} title="Signos vitales" defaultOpen={true}>
                <div className="pt-4">
                    {!ultimoSigno ? (
                        <p className="text-xs text-gray-400 italic">Sin registros de signos vitales.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                            {[
                                ['Peso',   ultimoSigno.signos?.peso,                   'kg'],
                                ['Talla',   ultimoSigno.signos?.talla,                   'cm'],
                                ['IMC',   ultimoSigno.signos?.peso && ultimoSigno.signos?.talla ? (ultimoSigno.signos.peso / ((ultimoSigno.signos.talla / 100) ** 2)).toFixed(1) : null, 'kg/m²'],
                                ['FC',    ultimoSigno.signos?.frecuenciaCardiaca,     'bpm'],
                                ['PA',    ultimoSigno.signos?.presionArterial
                                            ? `${ultimoSigno.signos.presionArterial.sistolica}/${ultimoSigno.signos.presionArterial.diastolica}`
                                            : null,                                   'mmHg'],
                                ['FR',    ultimoSigno.signos?.frecuenciaRespiratoria, 'rpm'],
                                ['Temp',  ultimoSigno.signos?.temperatura,            '°C'],
                                ['SpO₂',  ultimoSigno.signos?.saturacionOxigeno,      '%'],
                                ['Glucosa',ultimoSigno.signos?.glucosa,               'mg/dL'],
                                ['Dolor', ultimoSigno.signos?.dolor,                  '/10'],
                            ].filter(([, v]) => v != null)
                            .map(([label, value, unit]) => {
                                const color = getVitalColor(label, value);

                                return (
                                    <div key={label} className={`rounded-xl px-4 py-3 border border-gray-100 ${color}`}>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-0.5">
                                            {label}
                                        </p>
                                        <p className="text-lg font-bold">
                                            {value}
                                            <span className="text-xs font-normal ml-1 opacity-70">{unit}</span>
                                        </p>
                                    </div>
                                );

                                
                            })}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mb-3">
                        {ultimoSigno
                            ? `Último registro: ${new Date(ultimoSigno.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                    </p>

                    <button onClick={() => setModalSignos(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f3460] text-white text-xs font-semibold hover:bg-[#0a2547] transition-all">
                        <FontAwesomeIcon icon={faPlus} />
                        Registrar nueva toma
                    </button>
                </div>
            </SectionCard>

            {/* Modal nueva toma */}
            {modalSignos && (
                <ModalNuevaToma
                    pacienteId={id}
                    onClose={() => setModalSignos(false)}
                    onSaved={(nuevo) => {
                        setUltimoSigno(nuevo);
                        setModalSignos(false);
                    }}
                />
            )}

            {/* ══ SECCIÓN 5: Ingresos (solo lectura) ══ */}
            <SectionCard icon={faHospital} title="Historial de ingresos" defaultOpen={false}>
                <div className="pt-4 space-y-3">
                    {admissions.length === 0
                        ? <p className="text-xs text-gray-400 italic">Sin ingresos registrados</p>
                        : admissions.map((adm, i) => (
                            <div key={adm._id || i} className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <EstadoBadge estado={adm.estado} />
                                        <span className="text-[10px] text-gray-400 font-mono">#{adm._id?.slice(-5).toUpperCase()}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faStethoscope} className="text-[#16a09e] text-xs" />
                                        {adm.ingreso?.diagnosticoMedico || '—'}
                                    </p>
                                </div>
                                <div>
                                    <DataField label="Servicio / Unidad" value={adm.ingreso?.servicio || '—'} />
                                    <DataField label="Cama" value={adm.ingreso?.cama
                                        ? <span className="flex items-center gap-1.5"><FontAwesomeIcon icon={faBed} className="text-xs text-gray-400" />{adm.ingreso.cama}</span>
                                        : '—'} />
                                </div>
                                <div>
                                    <DataField label="Ingreso" value={
                                        <span className="flex items-center gap-1.5 flex-wrap">
                                            <FontAwesomeIcon icon={faCalendarDay} className="text-xs text-gray-400" />
                                            {formatFecha(adm.ingreso?.fecha)}
                                            {adm.ingreso?.hora && <span className="flex items-center gap-1 text-gray-400"><FontAwesomeIcon icon={faClock} className="text-[10px]" />{adm.ingreso.hora}</span>}
                                        </span>
                                    } />
                                    {adm.egreso?.fecha && (
                                        <DataField label="Egreso" value={
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