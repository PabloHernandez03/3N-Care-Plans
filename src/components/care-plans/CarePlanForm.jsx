import React, { useState, useEffect } from 'react';
import Button from '@/components/shared/Button';

const CarePlanForm = ({ onCancel, onPatientSaved }) => {
    const [patientList, setPatientList] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedSex, setSelectedSex] = useState("");

    // ESTADOS PARA BLOQUEOS CLÍNICOS
    const [noAllergies, setNoAllergies] = useState(false);
    const [hasAllergyText, setHasAllergyText] = useState(false);
    const [noMeds, setNoMeds] = useState(false);
    const [hasMedsText, setHasMedsText] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/patients');
                const data = await res.json();
                setPatientList(data);
            } catch (error) {
                console.error("Error al cargar pacientes:", error);
            }
        };
        fetchPatients();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    const handleDate = (e) => {
        let { value } = e.target;
        value = value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5, 10);
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
    };

    const handleAge = (e) => {
        const { value } = e.target;
        if (/^[0-9]*$/.test(value)) {
            if (parseInt(value) > 130) e.target.value = value.slice(0, -1);
        } else {
            e.target.value = value.slice(0, -1);
        }
    };

    // Funciones para escuchar si el usuario escribe y bloquear los checkboxes
    const checkAllergyInputs = () => {
        const m = document.querySelector('[name="medicationAllergies"]').value;
        const f = document.querySelector('[name="foodAllergies"]').value;
        const e = document.querySelector('[name="environmentalAllergies"]').value;
        setHasAllergyText(m !== '' || f !== '' || e !== '');
    };

    const checkMedsInputs = () => {
        const n = document.querySelector('[name="medName"]').value;
        const d = document.querySelector('[name="medDose"]').value;
        const f = document.querySelector('[name="medFreq"]').value;
        const v = document.querySelector('[name="medRoute"]').value;
        setHasMedsText(n !== '' || d !== '' || f !== '' || v !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const data = Object.fromEntries(form.entries());

        const patientPayload = {
            nombre: data.patientName,
            curp: data.curp.toUpperCase(),
            edad: Number(data.age),
            sexo: data.patientSex,
            fechaNacimiento: data.patientBirthdate,
            ingreso: {
                fecha: data.admissionDate,
                hora: data.admissionTime,
                servicioCama: data.serviceUnitBed,
                diagnosticoMedico: data.medicalDiagnosis
            },
            antecedentes: {
                patologicos: [
                    data.diabetes && "Diabetes",
                    data.hypertension && "Hipertensión",
                    data.cardiopathies && "Cardiopatías",
                    data.asthma && "Asma/EPOC",
                    data.epilepsy && "Epilepsia",
                    data.cancer && "Cáncer",
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
                    data.appendectomy && "Apendicectomía",
                    data.cesarean && "Cesárea",
                    data.orthopedic && "Cirugía ortopédica",
                    data.otherSurgical ? `Otro: ${data.otherSurgical}` : null
                ].filter(Boolean),
                alergias: {
                    ninguna: !!data.noKnownAllergies,
                    medicamentos: data.medicationAllergies || "",
                    alimentos: data.foodAllergies || "",
                    ambientales: data.environmentalAllergies || ""
                },
                medicacionActual: {
                    ninguna: !!data.noMedication,
                    nombre: data.medName || "",
                    dosis: data.medDose || "",
                    frecuencia: data.medFreq || "",
                    via: data.medRoute || ""
                },
                habitos: {
                    tabaquismo: data.smoking || "No",
                    alcoholismo: data.alcohol || "No",
                    alimentacion: data.diet || "Balanceada"
                },
                redCuidados: data.familySupport || ""
            }
        };

        if (selectedOption === "") {
            const curpExists = patientList.some(p => p.curp.toUpperCase() === data.curp.toUpperCase());
            if (curpExists) {
                alert("Ya existe un registro con esta CURP. Por favor, selecciónalo en la lista de arriba.");
                return;
            }
            try {
                const response = await fetch('http://localhost:5000/api/patients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patientPayload)
                });
                if (response.ok) {
                    const savedPatient = await response.json();
                    alert("¡Paciente NUEVO guardado con éxito!");
                    onPatientSaved(savedPatient);
                } else {
                    const errData = await response.json();
                    alert(`Error al guardar paciente: ${errData.error}`);
                }
            } catch (error) {
                alert("No se pudo conectar con el servidor.");
            }
        } else {
            try {
                const response = await fetch(`http://localhost:5000/api/patients/${selectedOption}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patientPayload)
                });
                if (response.ok) {
                    const updatedPatient = await response.json();
                    alert("¡Datos del paciente ACTUALIZADOS con éxito!");
                    onPatientSaved(updatedPatient);
                } else {
                    const errData = await response.json();
                    alert(`Error al actualizar paciente: ${errData.error}`);
                }
            } catch (error) {
                alert("No se pudo conectar con el servidor.");
            }
        }
    };

    const handlePatientSelect = (e) => {
        const id = e.target.value;
        setSelectedOption(id);

        if (id === "") {
            document.querySelectorAll('input[type="text"], input[type="time"]').forEach(input => input.value = "");
            document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
            setSelectedSex("");
            setNoAllergies(false);
            setHasAllergyText(false);
            setNoMeds(false);
            setHasMedsText(false);
            document.getElementById("patientName").readOnly = false;
            document.getElementById("curp").readOnly = false;
        } else {
            const paciente = patientList.find(p => p._id === id);
            if (paciente) {
                // Datos básicos
                document.getElementById("patientName").value = paciente.nombre || "";
                document.getElementById("age").value = paciente.edad || "";
                setSelectedSex(paciente.sexo || "");
                document.getElementById("patientBirthdate").value = paciente.fechaNacimiento || "";
                document.getElementById("curp").value = paciente.curp || "";
                document.getElementById("patientName").readOnly = true;
                document.getElementById("curp").readOnly = true;
                
                // Ingreso
                document.getElementById("admissionDate").value = paciente.ingreso?.fecha || "";
                document.getElementById("admissionTime").value = paciente.ingreso?.hora || "";
                document.getElementById("serviceUnitBed").value = paciente.ingreso?.servicioCama || "";
                document.getElementById("medicalDiagnosis").value = paciente.ingreso?.diagnosticoMedico || "";

                // Resetear checkboxes y radios
                document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(cb => cb.checked = false);

                const ant = paciente.antecedentes || {};

                // Patológicos
                const patologicos = ant.patologicos || [];
                if (patologicos.includes("Diabetes")) document.querySelector('[name="diabetes"]').checked = true;
                if (patologicos.includes("Hipertensión")) document.querySelector('[name="hypertension"]').checked = true;
                if (patologicos.includes("Cardiopatías")) document.querySelector('[name="cardiopathies"]').checked = true;
                if (patologicos.includes("Asma/EPOC")) document.querySelector('[name="asthma"]').checked = true;
                if (patologicos.includes("Epilepsia")) document.querySelector('[name="epilepsy"]').checked = true;
                if (patologicos.includes("Cáncer")) document.querySelector('[name="cancer"]').checked = true;
                const otroPat = patologicos.find(item => item.startsWith("Otro: "));
                if (otroPat) document.querySelector('[name="otherPathological"]').value = otroPat.replace("Otro: ", "");

                // No Patológicos
                const noPatologicos = ant.noPatologicos || [];
                if (noPatologicos.includes("Esquema de vacunación completo")) document.querySelector('[name="vaccination"]').checked = true;
                if (noPatologicos.includes("Actividad física regular")) document.querySelector('[name="physicalActivity"]').checked = true;
                if (noPatologicos.includes("Alimentación saludable")) document.querySelector('[name="healthyDiet"]').checked = true;
                if (noPatologicos.includes("Higiene deficiente")) document.querySelector('[name="poorHygiene"]').checked = true;
                const otroNoPat = noPatologicos.find(item => item.startsWith("Otro: "));
                if (otroNoPat) document.querySelector('[name="otherNonPathological"]').value = otroNoPat.replace("Otro: ", "");

                // Quirúrgicos
                const quirurgicos = ant.quirurgicos || [];
                if (quirurgicos.includes("Apendicectomía")) document.querySelector('[name="appendectomy"]').checked = true;
                if (quirurgicos.includes("Cesárea")) document.querySelector('[name="cesarean"]').checked = true;
                if (quirurgicos.includes("Cirugía ortopédica")) document.querySelector('[name="orthopedic"]').checked = true;
                const otroQuir = quirurgicos.find(item => item.startsWith("Otro: "));
                if (otroQuir) document.querySelector('[name="otherSurgical"]').value = otroQuir.replace("Otro: ", "");

                // Alergias
                const alergias = ant.alergias || {};
                setNoAllergies(!!alergias.ninguna);
                if (alergias.ninguna) {
                    document.querySelector('[name="noKnownAllergies"]').checked = true;
                    setHasAllergyText(false);
                } else {
                    document.querySelector('[name="medicationAllergies"]').value = alergias.medicamentos || "";
                    document.querySelector('[name="foodAllergies"]').value = alergias.alimentos || "";
                    document.querySelector('[name="environmentalAllergies"]').value = alergias.ambientales || "";
                    checkAllergyInputs();
                }

                // Medicación
                const meds = ant.medicacionActual || {};
                setNoMeds(!!meds.ninguna);
                if (meds.ninguna) {
                    document.querySelector('[name="noMedication"]').checked = true;
                    setHasMedsText(false);
                } else {
                    document.querySelector('[name="medName"]').value = meds.nombre || "";
                    document.querySelector('[name="medDose"]').value = meds.dosis || "";
                    document.querySelector('[name="medFreq"]').value = meds.frecuencia || "";
                    document.querySelector('[name="medRoute"]').value = meds.via || "";
                    checkMedsInputs();
                }

                // Hábitos
                const habitos = ant.habitos || {};
                document.querySelector('[name="smoking"]').value = habitos.tabaquismo || "No";
                document.querySelector('[name="alcohol"]').value = habitos.alcoholismo || "No";
                document.querySelector('[name="diet"]').value = habitos.alimentacion || "Balanceada";

                // Red de Cuidados (Radio)
                if (ant.redCuidados) {
                    const radio = document.querySelector(`[name="familySupport"][value="${ant.redCuidados}"]`);
                    if (radio) radio.checked = true;
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <h2 className="col-span-5 text-xl font-bold text-gray-700">Información del Paciente</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 md:row-span-3 flex flex-col items-center">
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Seleccionar Paciente Existente (Opcional)</label>
                <select id="patientId" name="patientId" value={selectedOption} onChange={handlePatientSelect} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500">
                    <option value="">-- Registrar Nuevo Paciente --</option>
                    {patientList.map((paciente) => (
                        <option key={paciente._id} value={paciente._id}>{paciente.nombre} - {paciente.curp}</option>
                    ))}
                </select>
                {selectedOption !== "" && (
                    <div className="flex justify-center p-2 mt-4">
                        <Button type="button" onClick={() => console.log("Abriendo historial")} variant="primary">Ver Historial Clínico</Button>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-3">
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input id="patientName" placeholder="Nombre del paciente" type="text" name="patientName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required={selectedOption === ""} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
                <input id="age" placeholder="Edad" type="text" name="age" maxLength={3} onChange={handleAge} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="patientSex" className="block text-sm font-medium text-gray-700">Sexo</label>
                <select id="patientSex" name="patientSex" value={selectedSex} onChange={(e) => setSelectedSex(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required>
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="N">Otro</option>
                </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="patientBirthdate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input placeholder="DD/MM/AAAA" type="text" id="patientBirthdate" name="patientBirthdate" onChange={handleDate} maxLength={10} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" pattern="\d{2}/\d{2}/\d{4}" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor='curp' className="block text-sm font-medium text-gray-700">CURP</label>
                <input placeholder="CURP" type="text" id="curp" name="curp" maxLength={18} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 uppercase" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
                <input placeholder="DD/MM/AAAA" type="text" id="admissionDate" name="admissionDate" onChange={handleDate} maxLength={10} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" pattern="\d{2}/\d{2}/\d{4}" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="admissionTime" className="block text-sm font-medium text-gray-700">Hora de ingreso</label>
                <input type="time" id="admissionTime" name="admissionTime" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                <label htmlFor="serviceUnitBed" className="block text-sm font-medium text-gray-700">Servicio / Unidad / Cama</label>
                <input placeholder="Ej. Urgencias / Cama 4" type="text" id="serviceUnitBed" name="serviceUnitBed" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-3">
                <label htmlFor="medicalDiagnosis" className="block text-sm font-medium text-gray-700">Diagnóstico médico</label>
                <input placeholder="Diagnóstico preliminar o definitivo" id="medicalDiagnosis" name="medicalDiagnosis" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500" required />
            </div>
            
            { /* ANTECEDENTES PERSONALES Y DATOS RELEVANTES */ }
            <h2 className="col-span-5 text-xl font-bold text-gray-700 mt-4 border-t pt-4">Antecedentes personales y datos relevantes</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Patológicos</label>
                <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" name="diabetes" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Diabetes mellitus</span></label>
                    <label className="flex items-center"><input type="checkbox" name="hypertension" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Hipertensión arterial</span></label>
                    <label className="flex items-center"><input type="checkbox" name="cardiopathies" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Cardiopatías</span></label>
                    <label className="flex items-center"><input type="checkbox" name="asthma" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Asma / EPOC</span></label>
                    <label className="flex items-center"><input type="checkbox" name="epilepsy" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Epilepsia</span></label>
                    <label className="flex items-center"><input type="checkbox" name="cancer" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Cáncer</span></label>
                    <label className="flex items-center mt-2"><span className="mr-2">Otra:</span><input type="text" name="otherPathological" className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none" /></label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">No patológicos</label>
                <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" name="vaccination" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Esquema vacunación</span></label>
                    <label className="flex items-center"><input type="checkbox" name="physicalActivity" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Actividad física</span></label>
                    <label className="flex items-center"><input type="checkbox" name="healthyDiet" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Dieta saludable</span></label>
                    <label className="flex items-center"><input type="checkbox" name="poorHygiene" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Higiene deficiente</span></label>
                    <label className="flex items-center mt-2"><span className="mr-2">Otra:</span><input type="text" name="otherNonPathological" className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none" /></label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Quirúrgicos</label>
                <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" name="appendectomy" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Apendicectomía</span></label>
                    <label className="flex items-center"><input type="checkbox" name="cesarean" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Cesárea</span></label>
                    <label className="flex items-center"><input type="checkbox" name="orthopedic" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" /><span className="ml-2">Cirugía ortopédica</span></label>
                    <label className="flex items-center mt-2"><span className="mr-2">Otra:</span><input type="text" name="otherSurgical" className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none" /></label>
                </div>
            </div>

            {/* ALERGIAS CON RESTRICCIONES */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm flex flex-col justify-between">
                <div>
                    <label className="block font-medium text-gray-700 mb-4">Alergias</label>
                    <label className="flex items-center pb-2">
                        <span className="mr-2 font-medium w-28">Medicamentos:</span>
                        <input type="text" name="medicationAllergies" disabled={noAllergies} onChange={checkAllergyInputs} className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-1 disabled:bg-gray-100" />
                    </label>
                    <label className="flex items-center py-2">
                        <span className="mr-2 font-medium w-28">Alimentos:</span>
                        <input type="text" name="foodAllergies" disabled={noAllergies} onChange={checkAllergyInputs} className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-1 disabled:bg-gray-100" />
                    </label>
                    <label className="flex items-center py-2">
                        <span className="mr-2 font-medium w-28">Ambientales:</span>
                        <input type="text" name="environmentalAllergies" disabled={noAllergies} onChange={checkAllergyInputs} className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none p-1 disabled:bg-gray-100" />
                    </label>
                    <label className="flex items-center py-2 mt-2">
                        <input type="checkbox" name="noKnownAllergies" disabled={hasAllergyText} checked={noAllergies} onChange={(e) => { setNoAllergies(e.target.checked); if(e.target.checked) { document.querySelector('[name="medicationAllergies"]').value = ''; document.querySelector('[name="foodAllergies"]').value = ''; document.querySelector('[name="environmentalAllergies"]').value = ''; setHasAllergyText(false); } }} className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0 disabled:opacity-50" />
                        <span className="ml-2 font-medium">No conocidas</span>
                    </label>
                </div>
            </div>

            {/* MEDICACIÓN ESTRUCTURADA CON RESTRICCIONES */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Medicación actual</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" name="medName" placeholder="Nombre" disabled={noMeds} onChange={checkMedsInputs} className="border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                    <input type="text" name="medDose" placeholder="Dosis" disabled={noMeds} onChange={checkMedsInputs} className="border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                    <input type="text" name="medFreq" placeholder="Frecuencia" disabled={noMeds} onChange={checkMedsInputs} className="border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                    <input type="text" name="medRoute" placeholder="Vía" disabled={noMeds} onChange={checkMedsInputs} className="border border-gray-300 rounded-md p-2 disabled:bg-gray-100" />
                </div>
                <label className="flex items-center mt-2">
                    <input type="checkbox" name="noMedication" disabled={hasMedsText} checked={noMeds} onChange={(e) => { setNoMeds(e.target.checked); if(e.target.checked) { document.querySelector('[name="medName"]').value = ''; document.querySelector('[name="medDose"]').value = ''; document.querySelector('[name="medFreq"]').value = ''; document.querySelector('[name="medRoute"]').value = ''; setHasMedsText(false); } }} className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0 disabled:opacity-50" />
                    <span className="ml-2 font-medium">No usa medicamentos</span>
                </label>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Hábitos</label>
                <div className="grid grid-cols-1 gap-4">
                    <label className="flex flex-col"><span className="mb-1 text-gray-600">Tabaquismo:</span><select name="smoking" className="border-gray-300 rounded-md shadow-sm focus:border-blue-500"><option value="No">No</option><option value="Exfumador">Exfumador</option><option value="Sí">Sí</option></select></label>
                    <label className="flex flex-col"><span className="mb-1 text-gray-600">Alcoholismo:</span><select name="alcohol" className="border-gray-300 rounded-md shadow-sm focus:border-blue-500"><option value="No">No</option><option value="Social">Social</option><option value="Habitual">Habitual</option></select></label>
                    <label className="flex flex-col"><span className="mb-1 text-gray-600">Alimentación:</span><select name="diet" className="border-gray-300 rounded-md shadow-sm focus:border-blue-500"><option value="Balanceada">Balanceada</option><option value="Deficiente">Deficiente</option><option value="Hipergrasas">Hipergrasas</option></select></label>
                </div>
            </div>

            {/* RED DE APOYO CON RADIO BUTTONS (Selección Única) */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Apoyo familiar o red de cuidados (Seleccione una)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center"><input type="radio" name="familySupport" value="Vive solo" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0" /><span className="ml-2">Vive solo</span></label>
                    <label className="flex items-center"><input type="radio" name="familySupport" value="Vive con familia" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0" /><span className="ml-2">Vive con familia</span></label>
                    <label className="flex items-center"><input type="radio" name="familySupport" value="Cuidador primario" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0" /><span className="ml-2">Tiene un cuidador primario</span></label>
                    <label className="flex items-center"><input type="radio" name="familySupport" value="Apoyos comunitarios" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0" /><span className="ml-2">Apoyos comunitarios</span></label>
                    <label className="flex items-center col-span-1 md:col-span-2 mt-2"><input type="radio" name="familySupport" value="Insuficiente o inexistente" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0" /><span className="ml-2 font-medium text-red-600">Red de cuidados insuficiente o inexistente</span></label>
                </div>
            </div>

            <div className="flex justify-end gap-4 col-span-1 md:col-span-5 border-t pt-4">
                <Button type="button" onClick={onCancel} variant="secondary">Cancelar</Button>
                <Button type="submit">Guardar Paciente</Button>
            </div>
        </form>
    );
};

export default CarePlanForm;