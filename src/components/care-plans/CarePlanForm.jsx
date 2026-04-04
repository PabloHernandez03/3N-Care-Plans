import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, faPills, faHospital, faLeaf, faClipboard, 
    faCalendar, faMagnifyingGlass, faChevronDown, faHeartPulse
} from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';

/* ─── Utilidades ─────────────────────────────────────────────────────────── */
const calcularEdad = (fechaStr) => {
    let nacimiento;
    if (typeof fechaStr === 'string' && fechaStr.includes('/')) {
        const [d, m, y] = fechaStr.split('/');
        nacimiento = new Date(`${y}-${m}-${d}T00:00:00`);
    } else {
        nacimiento = new Date(fechaStr);
    }
    if (isNaN(nacimiento)) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
};

const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    if (typeof fechaStr === 'string' && fechaStr.includes('/')) return fechaStr;
    const d = new Date(fechaStr);
    if (isNaN(d)) return "";
    return [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()]
        .map(n => String(n).padStart(2, '0')).join('/');
};

const formatoFechaBackend = (fechaStr) => {
    if (!fechaStr) return null;
    if (fechaStr.includes('/')) {
        const [d, m, y] = fechaStr.split('/');
        return `${y}-${m}-${d}T00:00:00.000Z`;
    }
    return fechaStr;
};

const getToday = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const getNowTime = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/* ─── Sub-componentes de UI ──────────────────────────────────────────────── */
const SectionTitle = ({ icon, children }) => (
    <div className="col-span-full flex items-center gap-3 mt-2">
        <div className="w-8 h-8 rounded-lg bg-primario flex items-center justify-center text-white text-base shrink-0">
            {icon}
        </div>
        <h2 className="text-base font-semibold tracking-wide text-[#0f3460] uppercase">
            {children}
        </h2>
        <div className="flex-1 h-px bg-primario/15" />
    </div>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
        {children}
    </div>
);

const FieldLabel = ({ htmlFor, children, sub }) => (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-[#0f3460]/70 uppercase tracking-wider mb-1.5">
        {children}
        {sub && <span className="ml-1 font-normal normal-case text-gray-400">{sub}</span>}
    </label>
);

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const disabledInputCls = "w-full rounded-lg border border-gray-100 bg-gray-100 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed";

const CheckItem = ({ name, label }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group">
        <div className="relative">
            <input type="checkbox" name={name}
                   className="peer w-4 h-4 rounded border-2 border-gray-300 accent-[#0f3460] cursor-pointer" />
        </div>
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{label}</span>
    </label>
);

const RadioItem = ({ name, value, label, className = "" }) => (
    <label className={`flex items-center gap-2.5 cursor-pointer group ${className}`}>
        <input type="radio" name={name} value={value}
               className="w-4 h-4 border-2 border-gray-300 accent-[#0f3460] cursor-pointer" />
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">{label}</span>
    </label>
);

/* ─── Componente principal ───────────────────────────────────────────────── */
const CarePlanForm = ({ onCancel, onPatientSaved, showToast }) => {
    const [patientList, setPatientList]         = useState([]);
    const [patientsWithActivePlans, setPatientsWithActivePlans] = useState(new Set()); // 🟢 NUEVO: Set de IDs con planes activos
    
    // 🟢 NUEVOS ESTADOS PARA EL DROPDOWN PERSONALIZADO
    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [patientSearchTerm, setPatientSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const [selectedOption, setSelectedOption]   = useState("");
    const [selectedSex, setSelectedSex]         = useState("");
    const [selectedBloodType, setSelectedBloodType] = useState("");
    const [noAllergies, setNoAllergies]         = useState(false);
    const [hasAllergyText, setHasAllergyText]   = useState(false);
    const [medicamentos, setMedicamentos] = useState([
        { nombre: "", dosis: "", frecuencia: "", via: "" }
    ]);
    const hasMedsText = medicamentos.some(m => Object.values(m).some(v => v !== ""));
    const [noMeds, setNoMeds] = useState(false);
    const [edadMostrada, setEdadMostrada]       = useState(null);

    const [signos, setSignos] = useState({
        frecuenciaCardiaca:     '',
        sistolica:              '',
        diastolica:             '',
        frecuenciaRespiratoria: '',
        temperatura:            '',
        saturacionOxigeno:      '',
        glucosa:                '',
        peso:                   '',
        talla:                  '',
        dolor:                  '',
    });
    
    const handleSigno = (e) => setSignos(p => ({ ...p, [e.target.name]: e.target.value }));

    const haySignos = Object.values(signos).some(v => v !== '');

    const addMedicamento = () => {
        setMedicamentos(prev => [...prev, { nombre: "", dosis: "", frecuencia: "", via: "" }]);
    };

    const removeMedicamento = (index) => {
        setMedicamentos(prev => prev.filter((_, i) => i !== index));
    };

    const updateMedicamento = (index, field, value) => {
        setMedicamentos(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patRes, planRes] = await Promise.all([
                    api.get('/api/patients'),
                    api.get('/api/careplans').catch(() => ({ data: [] })), // ← no rompe si falla
                ]);

                const patData = patRes.data || [];
                const sorted = [...patData].sort((a, b) =>
                    (a.nombre?.apellidoPaterno || '').localeCompare(b.nombre?.apellidoPaterno || '')
                );
                setPatientList(sorted);

                const planes = planRes.data || [];
                const activeIds = new Set(
                    planes
                        .filter(p => p.estado === 'Activo' && p.pacienteId)
                        .map(p => typeof p.pacienteId === 'object' ? p.pacienteId._id : p.pacienteId)
                );
                setPatientsWithActivePlans(activeIds);

            } catch (err) {
                console.error(err);
                const msg = err.response?.data?.error || "No se pudo conectar con el servidor.";
                showToast(msg, "error");
            }
        };
        fetchData();
    }, []);

    // 🟢 NUEVO: Cerrar dropdown al hacer clic afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e) => { if (e.key === 'Enter') e.preventDefault(); };

    const handleDate = (e) => {
        let { value } = e.target;
        value = value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 10);
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
        if (e.target.id === 'patientBirthdate') {
            setEdadMostrada(value.length === 10 ? calcularEdad(value) : null);
        }
    };

    const checkAllergyInputs = () => {
        const vals = ['medicationAllergies','foodAllergies','environmentalAllergies']
            .map(n => document.querySelector(`[name="${n}"]`)?.value || '');
        setHasAllergyText(vals.some(v => v !== ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());

        const patientPayload = {
            nombre: { nombre: data.firstName, apellidoPaterno: data.lastNameP, apellidoMaterno: data.lastNameM },
            curp: data.curp.toUpperCase(),
            demograficos: { fechaNacimiento: formatoFechaBackend(data.patientBirthdate), sexo: data.patientSex, tipoSangre: data.patientBloodType },
            antecedentes: {
                patologicos: [data.diabetes && "Diabetes", data.hypertension && "Hipertensión", data.cardiopathies && "Cardiopatías", data.asthma && "Asma/EPOC", data.epilepsy && "Epilepsia", data.cancer && "Cáncer", data.otherPathological ? `Otro: ${data.otherPathological}` : null].filter(Boolean),
                noPatologicos: [data.vaccination && "Esquema de vacunación completo", data.physicalActivity && "Actividad física regular", data.healthyDiet && "Alimentación saludable", data.poorHygiene && "Higiene deficiente", data.otherNonPathological ? `Otro: ${data.otherNonPathological}` : null].filter(Boolean),
                quirurgicos: [data.appendectomy && "Apendicectomía", data.cesarean && "Cesárea", data.orthopedic && "Cirugía ortopédica", data.otherSurgical ? `Otro: ${data.otherSurgical}` : null].filter(Boolean)
            },
            alergias: { ninguna: !!data.noKnownAllergies, medicamentos: data.medicationAllergies || "", alimentos: data.foodAllergies || "", ambientales: data.environmentalAllergies || "" },
            medicacionActual: noMeds ? [{ ninguna: true, nombre: "", dosis: "", frecuencia: "", via: "" }] : medicamentos.filter(m => m.nombre || m.dosis || m.frecuencia || m.via).map(m => ({ ...m, ninguna: false })),
            habitos: { tabaquismo: data.smoking || "No", alcoholismo: data.alcohol || "No", alimentacion: data.diet || "Balanceada" },
            redCuidados: data.familySupport || ""
        };

        const ingresoPayload = {
            fecha: formatoFechaBackend(data.admissionDate),
            hora: data.admissionTime,
            servicio: data.admissionService,
            cama: data.admissionBed,
            diagnosticoMedico: data.medicalDiagnosis
        };

        if (selectedOption === "") {
            const curpExists = patientList.some(p => p.curp.toUpperCase() === data.curp.toUpperCase());
            if (curpExists) { 
                showToast("Ya existe un registro con esta CURP.", "error"); 
                return; 
            }
            
            try {
                const payloadCompleto = {
                    ...patientPayload,
                    ingreso: ingresoPayload
                };
                    const res = await api.post('/api/patients', payloadCompleto);
                    if (res.status === 201) {
                        const savedData = res.data;
                        const pacienteReal = savedData.patient;
                        pacienteReal.ingresoId = savedData.admission?._id;
                        showToast("Paciente e ingreso creados correctamente", "success");
                        onPatientSaved(pacienteReal);
                    } else { 
                        showToast(`Error: ${res.data.error || 'Error desconocido'}`, "error");
                    }
            } catch (err) {
                const msg = err.response?.data?.error || "No se pudo conectar con el servidor.";
                showToast(msg, "error");
            }
        } else {
            try {

                await api.put(`/api/patients/${selectedOption}`, {
                    nombre: patientPayload.nombre,
                    curp: patientPayload.curp,
                    demograficos: patientPayload.demograficos
                });

                await api.put(`/api/patients/${selectedOption}/expediente`, {
                    antecedentes: patientPayload.antecedentes,
                    alergias: patientPayload.alergias,
                    medicacionActual: patientPayload.medicacionActual,
                    habitos: patientPayload.habitos,
                    redCuidados: patientPayload.redCuidados
                });

                const ingRes = await api.post('/api/admissions', {
                    pacienteId: selectedOption,
                    ingreso: ingresoPayload
                });

                const savedAdmission = ingRes.data;
                const pacienteExistente = patientList.find(p => p._id === selectedOption);

                const pacienteParaBuilder = {
                    ...pacienteExistente,
                    nombre: patientPayload.nombre,
                    ingresoId: savedAdmission._id || savedAdmission.data?._id
                };
                showToast("Expediente y admisión actualizados correctamente", "success");
                onPatientSaved(pacienteParaBuilder);
                if (haySignos) {
                    const pacienteId = selectedOption || savedData.patient?.id;
                    await api.post('/api/vitalsigns', {
                        pacienteId,
                        signos: {
                            frecuenciaCardiaca:     signos.frecuenciaCardiaca     ? Number(signos.frecuenciaCardiaca)     : undefined,
                            presionArterial: (signos.sistolica || signos.diastolica) ? {
                                sistolica:  signos.sistolica  ? Number(signos.sistolica)  : undefined,
                                diastolica: signos.diastolica ? Number(signos.diastolica) : undefined,
                            } : undefined,
                            frecuenciaRespiratoria: signos.frecuenciaRespiratoria ? Number(signos.frecuenciaRespiratoria) : undefined,
                            temperatura:            signos.temperatura            ? Number(signos.temperatura)            : undefined,
                            saturacionOxigeno:      signos.saturacionOxigeno      ? Number(signos.saturacionOxigeno)      : undefined,
                            glucosa:                signos.glucosa                ? Number(signos.glucosa)                : undefined,
                            peso:                   signos.peso                   ? Number(signos.peso)                   : undefined,
                            talla:                  signos.talla                  ? Number(signos.talla)                  : undefined,
                            dolor:                  signos.dolor                  ? Number(signos.dolor)                  : undefined,
                        },
                        observaciones: signos.observaciones || '',
                                    })
                }
            } catch (err) {
                const msg = err.response?.data?.error || "No se pudo conectar con el servidor.";
                showToast(msg, "error");
            }
        }
    };

    const resetForm = () => {
        document.querySelectorAll('input[type="text"], input[type="time"]').forEach(i => i.value = "");
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => i.checked = false);
        document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
        setSelectedSex(""); setSelectedBloodType(""); setEdadMostrada(null);
        setNoAllergies(false); setHasAllergyText(false);
        setNoMeds(false); 
        ['firstName','lastNameP','lastNameM','curp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.readOnly = false;
        });
        setMedicamentos([{ nombre: "", dosis: "", frecuencia: "", via: "" }]);
    };

    // 🟢 ACTUALIZADO: Recibe directamente el ID desde el Dropdown
    const handlePatientSelect = (id) => {
        setSelectedOption(id);
        setIsDropdownOpen(false);
        setPatientSearchTerm(""); // Limpiamos el buscador al elegir

        if (id === "") { resetForm(); return; }

        const paciente = patientList.find(p => p._id === id);
        if (!paciente) return;

        const nom = paciente.nombre || {};
        document.getElementById("firstName").value = nom.nombre || "";
        document.getElementById("lastNameP").value = nom.apellidoPaterno || "";
        document.getElementById("lastNameM").value = nom.apellidoMaterno || "";
        ['firstName','lastNameP','lastNameM','curp'].forEach(fId => {
            const el = document.getElementById(fId);
            if (el) el.readOnly = true;
        });

        document.getElementById("curp").value = paciente.curp || "";
        const fechaFormateada = formatearFecha(paciente.demograficos?.fechaNacimiento);
        document.getElementById("patientBirthdate").value = fechaFormateada;
        setEdadMostrada(calcularEdad(fechaFormateada));
        setSelectedSex(paciente.demograficos?.sexo || "");
        setSelectedBloodType(paciente.demograficos?.tipoSangre || "");

        ['admissionDate','admissionService','admissionBed','medicalDiagnosis'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
        document.getElementById("admissionTime").value = "";

        api.get(`/api/patients/${id}`)
            .then(({ clinicalRecord }) => {
                if (!clinicalRecord) return;
                document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => i.checked = false);

                const ant = clinicalRecord.antecedentes || {};
                const pats = ant.patologicos || [];
                [["Diabetes","diabetes"],["Hipertensión","hypertension"],["Cardiopatías","cardiopathies"],
                 ["Asma/EPOC","asthma"],["Epilepsia","epilepsy"],["Cáncer","cancer"]].forEach(([val, name]) => {
                    if (pats.includes(val)) document.querySelector(`[name="${name}"]`).checked = true;
                });
                const otroPat = pats.find(i => i.startsWith("Otro: "));
                if (otroPat) document.querySelector('[name="otherPathological"]').value = otroPat.replace("Otro: ", "");

                const noPats = ant.noPatologicos || [];
                [["Esquema de vacunación completo","vaccination"],["Actividad física regular","physicalActivity"],
                 ["Alimentación saludable","healthyDiet"],["Higiene deficiente","poorHygiene"]].forEach(([val, name]) => {
                    if (noPats.includes(val)) document.querySelector(`[name="${name}"]`).checked = true;
                });
                const otroNoPat = noPats.find(i => i.startsWith("Otro: "));
                if (otroNoPat) document.querySelector('[name="otherNonPathological"]').value = otroNoPat.replace("Otro: ", "");

                const quirs = ant.quirurgicos || [];
                [["Apendicectomía","appendectomy"],["Cesárea","cesarean"],["Cirugía ortopédica","orthopedic"]].forEach(([val, name]) => {
                    if (quirs.includes(val)) document.querySelector(`[name="${name}"]`).checked = true;
                });
                const otroQuir = quirs.find(i => i.startsWith("Otro: "));
                if (otroQuir) document.querySelector('[name="otherSurgical"]').value = otroQuir.replace("Otro: ", "");

                const alergias = clinicalRecord.alergias || {};
                setNoAllergies(!!alergias.ninguna);
                if (alergias.ninguna) {
                    document.querySelector('[name="noKnownAllergies"]').checked = true;
                } else {
                    document.querySelector('[name="medicationAllergies"]').value = alergias.medicamentos || "";
                    document.querySelector('[name="foodAllergies"]').value = alergias.alimentos || "";
                    document.querySelector('[name="environmentalAllergies"]').value = alergias.ambientales || "";
                    checkAllergyInputs();
                }

                const meds = clinicalRecord.medicacionActual || [];
                if (meds.length > 0 && meds[0]?.ninguna) {
                    setNoMeds(true);
                    setMedicamentos([{ nombre: "", dosis: "", frecuencia: "", via: "" }]);
                } else if (meds.length > 0) {
                    setNoMeds(false);
                    setMedicamentos(meds.map(m => ({
                        nombre:     m.nombre     || "",
                        dosis:      m.dosis      || "",
                        frecuencia: m.frecuencia || "",
                        via:        m.via        || ""
                    })));
                } else {
                    setMedicamentos([{ nombre: "", dosis: "", frecuencia: "", via: "" }]);
                }

                const hab = clinicalRecord.habitos || {};
                document.querySelector('[name="smoking"]').value = hab.tabaquismo || "No";
                document.querySelector('[name="alcohol"]').value = hab.alcoholismo || "No";
                document.querySelector('[name="diet"]').value = hab.alimentacion || "Balanceada";

                if (clinicalRecord.redCuidados) {
                    const radio = document.querySelector(`[name="familySupport"][value="${clinicalRecord.redCuidados}"]`);
                    if (radio) radio.checked = true;
                }
            })
            .catch(err => console.error("Error cargando expediente:", err));
    };

    // 🟢 NUEVO: Lógica de filtrado del buscador de pacientes
    const filteredPatients = patientList.filter(p => {
        if (!patientSearchTerm) return true;
        const term = patientSearchTerm.toLowerCase();
        const fullName = `${p.nombre?.apellidoPaterno || ''} ${p.nombre?.apellidoMaterno || ''} ${p.nombre?.nombre || ''}`.toLowerCase();
        const curp = (p.curp || '').toLowerCase();
        return fullName.includes(term) || curp.includes(term);
    });

    const getSelectedPatientText = () => {
        if (selectedOption === "") return "— Registrar nuevo paciente —";
        const p = patientList.find(pat => pat._id === selectedOption);
        if (!p) return "— Registrar nuevo paciente —";
        return `${p.nombre?.apellidoPaterno} ${p.nombre?.apellidoMaterno}, ${p.nombre?.nombre} — ${p.curp}`;
    };

    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}
              className="space-y-6 font-sans">

            {/* ── ENCABEZADO ── */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#0f3460]/10">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f3460] tracking-tight">
                        Registro de Paciente
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {selectedOption === "" ? "Nuevo ingreso" : "Nueva admisión para expediente existente"}
                    </p>
                </div>
            </div>

            {/* ══ SECCIÓN 1: IDENTIFICACIÓN ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faUser} />}>Identificación del paciente</SectionTitle>

                <Card className="col-span-full">
                    <FieldLabel>Seleccionar paciente existente</FieldLabel>
                    {/* 🟢 NUEVO DROPDOWN PERSONALIZADO CON BUSCADOR */}
                    <div className="relative" ref={dropdownRef}>
                        <div 
                            className={`${inputCls} flex items-center justify-between cursor-pointer`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className={selectedOption === "" ? "text-gray-500 font-medium" : "text-[#0f3460] font-bold truncate"}>
                                {getSelectedPatientText()}
                            </span>
                            <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
                                <div className="p-3 border-b border-gray-100 bg-gray-50/80">
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input 
                                            type="text" 
                                            autoFocus
                                            placeholder="Buscar por nombre, apellido o CURP..." 
                                            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#16a09e] focus:ring-2 focus:ring-[#16a09e]/20"
                                            value={patientSearchTerm}
                                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    <div 
                                        className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${selectedOption === "" ? 'bg-[#16a09e]/10 text-[#16a09e] font-bold' : 'text-gray-600 font-medium'}`}
                                        onClick={() => handlePatientSelect("")}
                                    >
                                        — Registrar nuevo paciente —
                                    </div>
                                    {filteredPatients.map(p => {
                                        const hasActivePlan = patientsWithActivePlans.has(p._id);
                                        return (
                                            <div 
                                                key={p._id}
                                                className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-50 flex items-center justify-between ${selectedOption === p._id ? 'bg-[#16a09e]/5 text-[#0f3460] font-bold' : 'text-gray-700'}`}
                                                onClick={() => handlePatientSelect(p._id)}
                                            >
                                                <div className="truncate pr-4">
                                                    <span className="block font-semibold truncate">{p.nombre?.apellidoPaterno} {p.nombre?.apellidoMaterno}, {p.nombre?.nombre}</span>
                                                    <span className="text-[11px] text-gray-400 font-mono tracking-wider">{p.curp}</span>
                                                </div>
                                                {hasActivePlan && (
                                                    <span className="shrink-0 inline-block px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                                                        Plan Activo
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredPatients.length === 0 && (
                                        <div className="px-4 py-8 text-center text-sm text-gray-400 font-medium">
                                            No se encontraron pacientes para "{patientSearchTerm}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="col-span-full">
                    <FieldLabel>Nombre completo</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Nombre(s)</p>
                            <input id="firstName" name="firstName" type="text" placeholder="Ej. María Elena"
                                   className={inputCls} required={selectedOption === ""} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Apellido paterno</p>
                            <input id="lastNameP" name="lastNameP" type="text" placeholder="Ej. García"
                                   className={inputCls} required={selectedOption === ""} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Apellido materno</p>
                            <input id="lastNameM" name="lastNameM" type="text" placeholder="Ej. López"
                                   className={inputCls} required />
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <FieldLabel htmlFor="curp">CURP</FieldLabel>
                        <input id="curp" name="curp" type="text" placeholder="18 caracteres" maxLength={18}
                               className={`${inputCls} uppercase tracking-widest`} required />
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="patientBirthdate">Fecha de nacimiento</FieldLabel>
                        <div className="relative">   
                            <input id="patientBirthdate" name="patientBirthdate" type="text"
                                placeholder="DD/MM/AAAA" onChange={handleDate} maxLength={10}
                                pattern="\d{2}/\d{2}/\d{4}" className={inputCls} required />
                            {edadMostrada !== null && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-md bg-primario/10 text-primario font-bold">
                                        {edadMostrada} años
                                    </span>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="patientSex">Sexo biológico</FieldLabel>
                        <div className="relative">
                            <select id="patientSex" name="patientSex" value={selectedSex}
                                    onChange={(e) => setSelectedSex(e.target.value)}
                                    className={selectCls} required>
                                <option value="" disabled>Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="N">Otro</option>
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
                        </div>
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="patientBloodType">Tipo de sangre</FieldLabel>
                        <div className="relative">
                            <select id="patientBloodType" name="patientBloodType" value={selectedBloodType}
                                    onChange={(e) => setSelectedBloodType(e.target.value)}
                                    className={selectCls} required>
                                <option value="" disabled>Seleccione</option>
                                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ══ SECCIÓN 2: INGRESO ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faHospital} />}>Datos de ingreso actual</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <FieldLabel htmlFor="admissionDate">Fecha de ingreso</FieldLabel>
                        <div className="relative">
                            <input 
                                id="admissionDate" 
                                name="admissionDate" 
                                type="text"
                                placeholder="DD/MM/AAAA" 
                                onChange={handleDate} 
                                maxLength={10}
                                pattern="\d{2}/\d{2}/\d{4}" 
                                className={`${inputCls} pr-16`} 
                                required 
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    const hoy = getToday();
                                    const input = document.getElementById("admissionDate");
                                    input.value = hoy;
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-md bg-[#16a09e]/10 text-[#16a09e] font-bold hover:bg-[#16a09e]/20 transition"
                            >
                                HOY
                            </button>
                        </div>
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="admissionTime">Hora</FieldLabel>
                            <div className="relative">
                                <input 
                                    id="admissionTime" 
                                    name="admissionTime" 
                                    type="time"
                                    className={`${inputCls} pr-20`} 
                                    required 
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const ahora = getNowTime();
                                        const input = document.getElementById("admissionTime");
                                        input.value = ahora;
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-md bg-[#0f3460]/10 text-[#0f3460] font-bold hover:bg-[#0f3460]/20 transition"
                                >
                                    AHORA
                                </button>
                            </div>
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="admissionService">Servicio / Unidad</FieldLabel>
                        <input id="admissionService" name="admissionService" type="text"
                               placeholder="Ej. Urgencias" className={inputCls} required />
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="admissionBed">Cama</FieldLabel>
                        <input id="admissionBed" name="admissionBed" type="text"
                               placeholder="Ej. Cama 4" className={inputCls} required />
                    </Card>

                    <Card className="sm:col-span-2 lg:col-span-1">
                        <FieldLabel htmlFor="medicalDiagnosis">Diagnóstico médico</FieldLabel>
                        <input id="medicalDiagnosis" name="medicalDiagnosis" type="text"
                               placeholder="Diagnóstico preliminar o definitivo"
                               className={inputCls} required />
                    </Card>
                </div>
            </div>

            {/* ══ SECCIÓN 3: ANTECEDENTES ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faClipboard} />}>Antecedentes personales</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-red-400 mb-1.5" />
                            <FieldLabel>Patológicos</FieldLabel>
                        </div>
                        <div className="space-y-2.5">
                            {[["diabetes","Diabetes mellitus"],["hypertension","Hipertensión arterial"],
                              ["cardiopathies","Cardiopatías"],["asthma","Asma / EPOC"],
                              ["epilepsy","Epilepsia"],["cancer","Cáncer"]].map(([name, label]) => (
                                <CheckItem key={name} name={name} label={label} />
                            ))}
                            <div className="pt-1 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Otra:</p>
                                <input type="text" name="otherPathological"
                                       placeholder="Especificar..."
                                       className="w-full text-sm border-b border-gray-200 bg-transparent py-1 focus:outline-none focus:border-[#16a09e] text-gray-700 placeholder-gray-300" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 mb-1.5" />
                            <FieldLabel>No patológicos</FieldLabel>
                        </div>
                        <div className="space-y-2.5">
                            {[["vaccination","Esquema de vacunación"],["physicalActivity","Actividad física regular"],
                              ["healthyDiet","Alimentación saludable"],["poorHygiene","Higiene deficiente"]].map(([name, label]) => (
                                <CheckItem key={name} name={name} label={label} />
                            ))}
                            <div className="pt-1 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Otra:</p>
                                <input type="text" name="otherNonPathological"
                                       placeholder="Especificar..."
                                       className="w-full text-sm border-b border-gray-200 bg-transparent py-1 focus:outline-none focus:border-[#16a09e] text-gray-700 placeholder-gray-300" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-amber-400 mb-1.5" />
                            <FieldLabel>Quirúrgicos</FieldLabel>
                        </div>
                        <div className="space-y-2.5">
                            {[["appendectomy","Apendicectomía"],["cesarean","Cesárea"],
                              ["orthopedic","Cirugía ortopédica"]].map(([name, label]) => (
                                <CheckItem key={name} name={name} label={label} />
                            ))}
                            <div className="pt-1 border-t border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Otra:</p>
                                <input type="text" name="otherSurgical"
                                       placeholder="Especificar..."
                                       className="w-full text-sm border-b border-gray-200 bg-transparent py-1 focus:outline-none focus:border-[#16a09e] text-gray-700 placeholder-gray-300" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ══ SECCIÓN 4: CLÍNICA ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faPills} />}>Datos clínicos</SectionTitle>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <FieldLabel>Alergias conocidas</FieldLabel>
                        <div className="space-y-2 mb-3">
                            {[["medicationAllergies","Medicamentos"],["foodAllergies","Alimentos"],
                              ["environmentalAllergies","Ambientales"]].map(([name, label]) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{label}</span>
                                    <input type="text" name={name} disabled={noAllergies}
                                           onChange={checkAllergyInputs} placeholder="Describir..."
                                           className={noAllergies ? disabledInputCls : inputCls} />
                                </div>
                            ))}
                        </div>
                        <label className="flex items-center gap-2.5 pt-3 border-t border-gray-100 cursor-pointer">
                            <input type="checkbox" name="noKnownAllergies" disabled={hasAllergyText}
                                   checked={noAllergies}
                                   onChange={(e) => {
                                       setNoAllergies(e.target.checked);
                                       if (e.target.checked) {
                                           ['medicationAllergies','foodAllergies','environmentalAllergies'].forEach(n => {
                                               const el = document.querySelector(`[name="${n}"]`);
                                               if (el) el.value = '';
                                           });
                                           setHasAllergyText(false);
                                       }
                                   }}
                                   className="w-4 h-4 rounded accent-[#0f3460] disabled:opacity-40" />
                            <span className="text-sm font-medium text-gray-600">Sin alergias conocidas</span>
                        </label>
                    </Card>

                    <Card>
                        <div className="flex items-center justify-between mb-3">
                            <FieldLabel>Medicación actual</FieldLabel>
                            {!noMeds && (
                                <button type="button" onClick={addMedicamento}
                                        className="flex items-center gap-1 text-xs font-semibold text-[#16a09e] hover:text-[#0f7b79] transition-colors">
                                    <span className="text-base leading-none">+</span> Agregar
                                </button>
                            )}
                        </div>

                        {noMeds ? (
                            <p className="text-sm text-gray-400 italic py-2">Sin medicación registrada</p>
                        ) : (
                            <div className="space-y-3">
                                {medicamentos.map((med, index) => (
                                    <div key={index}
                                        className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        {medicamentos.length > 1 && (
                                            <div className="col-span-2 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-[#0f3460]/50 uppercase tracking-wider">
                                                    Medicamento {index + 1}
                                                </span>
                                                <button type="button" onClick={() => removeMedicamento(index)}
                                                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                                                    ✕ Quitar
                                                </button>
                                            </div>
                                        )}
                                        <input type="text" placeholder="Medicamento"
                                            value={med.nombre}
                                            onChange={(e) => updateMedicamento(index, 'nombre', e.target.value)}
                                            className={inputCls} />
                                        <input type="text" placeholder="Dosis"
                                            value={med.dosis}
                                            onChange={(e) => updateMedicamento(index, 'dosis', e.target.value)}
                                            className={inputCls} />
                                        <input type="text" placeholder="Frecuencia"
                                            value={med.frecuencia}
                                            onChange={(e) => updateMedicamento(index, 'frecuencia', e.target.value)}
                                            className={inputCls} />
                                        <input type="text" placeholder="Vía"
                                            value={med.via}
                                            onChange={(e) => updateMedicamento(index, 'via', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="flex items-center gap-2.5 pt-3 border-t border-gray-100 cursor-pointer mt-2">
                            <input type="checkbox" name="noMedication"
                                disabled={hasMedsText}
                                checked={noMeds}
                                onChange={(e) => {
                                    setNoMeds(e.target.checked);
                                    if (e.target.checked) {
                                        setMedicamentos([{ nombre: "", dosis: "", frecuencia: "", via: "" }]);
                                    }
                                }}
                                className="w-4 h-4 rounded accent-[#0f3460] disabled:opacity-40" />
                            <span className="text-sm font-medium text-gray-600">No usa medicamentos</span>
                        </label>
                    </Card>
                </div>
            </div>

            {/* ══ SECCIÓN 5: HÁBITOS Y RED DE CUIDADOS ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faLeaf} />}>Hábitos y entorno</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <FieldLabel>Hábitos de vida</FieldLabel>
                        <div className="space-y-3">
                            {[
                                ["smoking","Tabaquismo",["No","Exfumador","Sí"]],
                                ["alcohol","Alcoholismo",["No","Social","Habitual"]],
                                ["diet","Alimentación",["Balanceada","Deficiente","Hipergrasas"]]
                            ].map(([name, label, opts]) => (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-gray-500 w-24 shrink-0">{label}</span>
                                    <div className="relative flex-1">
                                        <select name={name} className={selectCls}>
                                            {opts.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <FieldLabel>Red de cuidados</FieldLabel>
                        <div className="grid grid-cols-1 gap-2.5">
                            {[["Vive solo","Vive solo"],["Vive con familia","Vive con familia"],
                              ["Cuidador primario","Tiene cuidador primario"],
                              ["Apoyos comunitarios","Apoyos comunitarios"]].map(([val, label]) => (
                                <RadioItem key={val} name="familySupport" value={val} label={label} />
                            ))}
                            <div className="pt-2 border-t border-gray-100">
                                <RadioItem name="familySupport" value="Insuficiente o inexistente"
                                           label="Red insuficiente o inexistente"
                                           className="text-red-500 font-medium" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ══ SECCIÓN 6: SIGNOS VITALES ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faHeartPulse} />}>
                    Signos vitales
                    <span className="ml-2 text-xs font-normal text-gray-400 normal-case tracking-normal">opcional</span>
                </SectionTitle>

                <Card className="col-span-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

                        {/* FC */}
                        <div>
                            <FieldLabel>FC <span className="text-gray-300 font-normal">bpm</span></FieldLabel>
                            <input name="frecuenciaCardiaca" type="number" min="0" max="300"
                                value={signos.frecuenciaCardiaca} onChange={handleSigno}
                                placeholder="72" className={inputCls} />
                        </div>

                        {/* PA */}
                        <div>
                            <FieldLabel>PA <span className="text-gray-300 font-normal">mmHg</span></FieldLabel>
                            <div className="flex items-center gap-1">
                                <input name="sistolica" type="number" min="0" max="300"
                                    value={signos.sistolica} onChange={handleSigno}
                                    placeholder="120" className={inputCls} />
                                <span className="text-gray-400 text-sm font-bold">/</span>
                                <input name="diastolica" type="number" min="0" max="200"
                                    value={signos.diastolica} onChange={handleSigno}
                                    placeholder="80" className={inputCls} />
                            </div>
                        </div>

                        {/* FR */}
                        <div>
                            <FieldLabel>FR <span className="text-gray-300 font-normal">rpm</span></FieldLabel>
                            <input name="frecuenciaRespiratoria" type="number" min="0" max="60"
                                value={signos.frecuenciaRespiratoria} onChange={handleSigno}
                                placeholder="16" className={inputCls} />
                        </div>

                        {/* Temperatura */}
                        <div>
                            <FieldLabel>Temp <span className="text-gray-300 font-normal">°C</span></FieldLabel>
                            <input name="temperatura" type="number" step="0.1" min="30" max="45"
                                value={signos.temperatura} onChange={handleSigno}
                                placeholder="36.5" className={inputCls} />
                        </div>

                        {/* SpO2 */}
                        <div>
                            <FieldLabel>SpO₂ <span className="text-gray-300 font-normal">%</span></FieldLabel>
                            <input name="saturacionOxigeno" type="number" min="0" max="100"
                                value={signos.saturacionOxigeno} onChange={handleSigno}
                                placeholder="98" className={inputCls} />
                        </div>

                        {/* Glucosa */}
                        <div>
                            <FieldLabel>Glucosa <span className="text-gray-300 font-normal">mg/dL</span></FieldLabel>
                            <input name="glucosa" type="number" min="0"
                                value={signos.glucosa} onChange={handleSigno}
                                placeholder="90" className={inputCls} />
                        </div>

                        {/* Peso */}
                        <div>
                            <FieldLabel>Peso <span className="text-gray-300 font-normal">kg</span></FieldLabel>
                            <input name="peso" type="number" step="0.1" min="0"
                                value={signos.peso} onChange={handleSigno}
                                placeholder="70" className={inputCls} />
                        </div>

                        {/* Talla */}
                        <div>
                            <FieldLabel>Talla <span className="text-gray-300 font-normal">cm</span></FieldLabel>
                            <input name="talla" type="number" min="0"
                                value={signos.talla} onChange={handleSigno}
                                placeholder="170" className={inputCls} />
                        </div>

                        {/* Dolor */}
                        <div>
                            <FieldLabel>Dolor <span className="text-gray-300 font-normal">0–10</span></FieldLabel>
                            <input name="dolor" type="number" min="0" max="10"
                                value={signos.dolor} onChange={handleSigno}
                                placeholder="0" className={inputCls} />
                            {signos.dolor !== '' && (
                                <div className="mt-1.5 flex items-center gap-1">
                                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(signos.dolor / 10) * 100}%`,
                                                background: signos.dolor <= 3 ? '#22c55e'
                                                        : signos.dolor <= 6 ? '#f59e0b' : '#ef4444'
                                            }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{signos.dolor}/10</span>
                                </div>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                            <FieldLabel>Observaciones</FieldLabel>
                            <textarea name="observaciones" rows={2}
                                    value={signos.observaciones || ''}
                                    onChange={handleSigno}
                                    placeholder="Notas adicionales sobre los signos vitales..."
                                    className={`${inputCls} resize-none`} />
                        </div>
                    </div>

                    {!haySignos && (
                        <p className="text-xs text-gray-400 italic mt-3 text-center">
                            Los signos vitales son opcionales. Puedes agregarlos ahora o después desde el perfil del paciente.
                        </p>
                    )}
                </Card>
            </div>

            {/* ── ACCIONES ── */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t-2 border-[#0f3460]/10">
                <span className="text-xs text-gray-400 mr-auto hidden sm:block">
                    {selectedOption === "" ? "Se creará un nuevo paciente" : "Se actualizará el expediente existente y se registrará un nuevo ingreso"}
                </span>
                <button type="button" onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                    Cancelar
                </button>
                <button type="submit"
                        className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primario text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all shadow-md shadow-[#0f3460]/20">
                    {selectedOption === "" ? "Registrar paciente" : "Guardar cambios y Admisión"}
                </button>
            </div>
        </form>
    );
};

export default CarePlanForm;