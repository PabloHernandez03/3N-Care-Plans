import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPills, faHospital, faLeaf, faClipboard, faCalendar, faHistory } from '@fortawesome/free-solid-svg-icons';
// import Button from '@/components/shared/Button';

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
const CarePlanForm = ({ onCancel, onPatientSaved }) => {
    const [patientList, setPatientList]         = useState([]);
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

    const addMedicamento = () => {
        setMedicamentos(prev => [...prev, { nombre: "", dosis: "", frecuencia: "", via: "" }]);
    };

    const removeMedicamento = (index) => {
        setMedicamentos(prev => prev.filter((_, i) => i !== index));
    };

    const updateMedicamento = (index, field, value) => {
        setMedicamentos(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };
    const [edadMostrada, setEdadMostrada]       = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/patients')
            .then(r => r.json())
            .then(setPatientList)
            .catch(err => console.error("Error al cargar pacientes:", err));
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

    const checkMedsInputs = () => {
        const vals = ['medName','medDose','medFreq','medRoute']
            .map(n => document.querySelector(`[name="${n}"]`)?.value || '');
        setHasMedsText(vals.some(v => v !== ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());

        const patientPayload = {
            nombre: {
                nombre:          data.firstName,
                apellidoPaterno: data.lastNameP,
                apellidoMaterno: data.lastNameM
            },
            curp: data.curp.toUpperCase(),
            demograficos: {
                fechaNacimiento: data.patientBirthdate,
                sexo:            data.patientSex,
                tipoSangre:      data.patientBloodType
            },
            antecedentes: {
                patologicos: [
                    data.diabetes && "Diabetes", data.hypertension && "Hipertensión",
                    data.cardiopathies && "Cardiopatías", data.asthma && "Asma/EPOC",
                    data.epilepsy && "Epilepsia", data.cancer && "Cáncer",
                    data.otherPathological ? `Otro: ${data.otherPathological}` : null
                ].filter(Boolean),
                noPatologicos: [
                    data.vaccination && "Esquema de vacunación completo",
                    data.physicalActivity && "Actividad física regular",
                    data.healthyDiet && "Alimentación saludable",
                    data.poorHygiene && "Higiene deficiente",
                    data.otherNonPathological ? `Otro: ${data.otherNonPathological}` : null
                ].filter(Boolean),
                quirurgicos: [
                    data.appendectomy && "Apendicectomía", data.cesarean && "Cesárea",
                    data.orthopedic && "Cirugía ortopédica",
                    data.otherSurgical ? `Otro: ${data.otherSurgical}` : null
                ].filter(Boolean)
            },
            alergias: {
                ninguna:      !!data.noKnownAllergies,
                medicamentos: data.medicationAllergies || "",
                alimentos:    data.foodAllergies || "",
                ambientales:  data.environmentalAllergies || ""
            },
            medicacionActual: noMeds
                ? [{ ninguna: true, nombre: "", dosis: "", frecuencia: "", via: "" }]
                : medicamentos.filter(m => m.nombre || m.dosis || m.frecuencia || m.via)
                            .map(m => ({ ...m, ninguna: false })),
            habitos: {
                tabaquismo:   data.smoking || "No",
                alcoholismo:  data.alcohol || "No",
                alimentacion: data.diet || "Balanceada"
            },
            redCuidados: data.familySupport || "",
            ingreso: {
                fecha:             data.admissionDate,
                hora:              data.admissionTime,
                servicio:          data.admissionService,
                cama:              data.admissionBed,
                diagnosticoMedico: data.medicalDiagnosis
            }
        };

        if (selectedOption === "") {
            const curpExists = patientList.some(p => p.curp.toUpperCase() === data.curp.toUpperCase());
            if (curpExists) { alert("Ya existe un registro con esta CURP."); return; }
            try {
                const res = await fetch('http://localhost:5000/api/patients', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patientPayload)
                });
                if (res.ok) { onPatientSaved(await res.json()); alert("¡Paciente guardado!"); }
                else { const err = await res.json(); alert(`Error: ${err.error}`); }
            } catch { alert("No se pudo conectar con el servidor."); }
        } else {
            try {
                await fetch(`http://localhost:5000/api/patients/${selectedOption}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: patientPayload.nombre, curp: patientPayload.curp, demograficos: patientPayload.demograficos })
                });
                const expRes = await fetch(`http://localhost:5000/api/patients/${selectedOption}/expediente`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        antecedentes: patientPayload.antecedentes, alergias: patientPayload.alergias,
                        medicacionActual: patientPayload.medicacionActual, habitos: patientPayload.habitos,
                        redCuidados: patientPayload.redCuidados
                    })
                });
                if (expRes.ok) { onPatientSaved(await expRes.json()); alert("¡Datos actualizados!"); }
                else { const err = await expRes.json(); alert(`Error: ${err.error}`); }
            } catch { alert("No se pudo conectar con el servidor."); }
        }
    };

    const resetForm = () => {
        document.querySelectorAll('input[type="text"], input[type="time"]').forEach(i => i.value = "");
        document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => i.checked = false);
        document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
        setSelectedSex(""); setSelectedBloodType(""); setEdadMostrada(null);
        setNoAllergies(false); setHasAllergyText(false);
        setNoMeds(false); setHasMedsText(false);
        ['firstName','lastNameP','lastNameM','curp'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.readOnly = false;
        });
        setMedicamentos([{ nombre: "", dosis: "", frecuencia: "", via: "" }]);
    };

    const handlePatientSelect = (e) => {
        const id = e.target.value;
        setSelectedOption(id);
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

        fetch(`http://localhost:5000/api/patients/${id}`)
            .then(r => r.json())
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
                        {selectedOption === "" ? "Nuevo ingreso" : "Editar expediente existente"}
                    </p>
                </div>
                {selectedOption !== "" && (
                    <button type="button"
                            onClick={() => console.log("Abriendo historial")}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#0f3460] text-[#0f3460] text-sm font-semibold hover:bg-primario hover:text-white transition-all">
                        <span><FontAwesomeIcon icon={faHistory} /></span> Ver historial
                    </button>
                )}
            </div>

            {/* ══ SECCIÓN 1: IDENTIFICACIÓN ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={<FontAwesomeIcon icon={faUser} />}>Identificación del paciente</SectionTitle>

                {/* Selector de paciente */}
                <Card className="col-span-full">
                    <FieldLabel>Seleccionar paciente existente</FieldLabel>
                    <div className="relative">
                        <select value={selectedOption} onChange={handlePatientSelect} className={selectCls}>
                            <option value="">— Registrar nuevo paciente —</option>
                            {patientList.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.nombre?.apellidoPaterno} {p.nombre?.apellidoMaterno}, {p.nombre?.nombre} — {p.curp}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
                    </div>
                    {selectedOption === "" && (
                        <p className="mt-2 text-xs text-[#16a09e] font-medium">
                            ✦ Deja en blanco para registrar un paciente nuevo
                        </p>
                    )}
                </Card>

                {/* Nombre en 3 campos */}
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

                {/* CURP + Datos demográficos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <FieldLabel htmlFor="curp">CURP</FieldLabel>
                        <input id="curp" name="curp" type="text" placeholder="18 caracteres" maxLength={18}
                               className={`${inputCls} uppercase tracking-widest`} required />
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="patientBirthdate">Fecha de nacimiento</FieldLabel>
                        <input id="patientBirthdate" name="patientBirthdate" type="text"
                               placeholder="DD/MM/AAAA" onChange={handleDate} maxLength={10}
                               pattern="\d{2}/\d{2}/\d{4}" className={inputCls} required />
                        {edadMostrada !== null && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-primario/10 text-primario rounded-full px-3 py-1 text-xs font-semibold">
                                <span><FontAwesomeIcon icon={faCalendar} /></span> {edadMostrada} años
                            </div>
                        )}
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
                <SectionTitle icon={<FontAwesomeIcon icon={faHospital} />}>Datos de ingreso</SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <FieldLabel htmlFor="admissionDate">Fecha de ingreso</FieldLabel>
                        <input id="admissionDate" name="admissionDate" type="text"
                               placeholder="DD/MM/AAAA" onChange={handleDate} maxLength={10}
                               pattern="\d{2}/\d{2}/\d{4}" className={inputCls} required />
                    </Card>

                    <Card>
                        <FieldLabel htmlFor="admissionTime">Hora</FieldLabel>
                        <input id="admissionTime" name="admissionTime" type="time"
                               className={inputCls} required />
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
                    {/* Patológicos */}
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

                    {/* No patológicos */}
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

                    {/* Quirúrgicos */}
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
                    {/* Alergias */}
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

                    {/* Medicación */}
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
                                        {/* Número de medicamento si hay más de uno */}
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
                    {/* Hábitos */}
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

                    {/* Red de cuidados */}
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

            {/* ── ACCIONES ── */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t-2 border-[#0f3460]/10">
                <span className="text-xs text-gray-400 mr-auto hidden sm:block">
                    {selectedOption === "" ? "Se creará un nuevo paciente" : "Se actualizará el expediente existente"}
                </span>
                <button type="button" onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
                    Cancelar
                </button>
                <button type="submit"
                        className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primario text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all shadow-md shadow-[#0f3460]/20">
                    {selectedOption === "" ? "Registrar paciente" : "Guardar cambios"}
                </button>
            </div>
        </form>
    );
};

export default CarePlanForm;