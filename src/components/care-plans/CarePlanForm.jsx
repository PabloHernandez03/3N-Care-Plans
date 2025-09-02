import React, { useState } from 'react';
import Button from '@/components/shared/Button';

const CarePlanForm = ({ onCancel }) => {
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedSex, setSelectedSex] = useState("");
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        patientId: '',
        frequency: 'diario',
    });

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDate = (e) => {
        let { value } = e.target;
        // Eliminar cualquier carácter que no sea un número
        value = value.replace(/\D/g, '');
    
        // Insertar las diagonales en las posiciones correctas
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length > 5) {
            value = value.slice(0, 5) + '/' + value.slice(5, 10);
        }
    
        // Limitar la longitud máxima a 10 caracteres (dd/mm/yyyy)
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
    
        e.target.value = value;
    };
    

    const handleAge = (e) => {
        const { value } = e.target;
        const regex = /^[0-9]*$/;
        if (regex.test(value)) {
            if (parseInt(value) > 130) {
                e.target.value = value.slice(0, -1);
            }
        } else {
            e.target.value = value.slice(0, -1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos del plan:', formData);
        onCancel();
    };

    function updateGlasgowTotal() {
        const eye = parseInt(document.querySelector('[name="glasgowEye"]').value || 0);
        const verbal = parseInt(document.querySelector('[name="glasgowVerbal"]').value || 0);
        const motor = parseInt(document.querySelector('[name="glasgowMotor"]').value || 0);
        const total = eye + verbal + motor;
        let level = "";
        if( total <= 8) {
            level = "Grave";
            document.getElementById("glasgowTotal").style.color = "red";
        } else if (total <= 12) {
            level = "Moderado";
            document.getElementById("glasgowTotal").style.color = "orange";
        } else{
            level = "Leve"
            document.getElementById("glasgowTotal").style.color = "green";
        }
        document.getElementById("glasgowTotal").textContent = total + " (" + level + ")";
    }

    function updateMorseTotal(){
        const history = parseInt(document.querySelector('[name="morseHistory"]').value || 0);
        const diagnosis = parseInt(document.querySelector('[name="morseDiagnosis"]').value || 0);
        const ambulation = parseInt(document.querySelector('[name="morseAmbulation"]').value || 0);
        const iv = parseInt(document.querySelector('[name="morseIV"]').value || 0);
        const gait = parseInt(document.querySelector('[name="morseGait"]').value || 0);
        const consciousness = parseInt(document.querySelector('[name="morseConsciousness"]').value || 0);
        const total = history + diagnosis + ambulation + iv + gait + consciousness;
        let level = "";
        if( total <= 24) {
            level = "Bajo";
            document.getElementById("morseTotal").style.color = "green";
        } else if (total <= 44) {
            level = "Moderado";
            document.getElementById("morseTotal").style.color = "orange";
        } else {
            level = "Alto"
            document.getElementById("morseTotal").style.color = "red";
        }
        document.getElementById("morseTotal").textContent = total + " (" + level + ")";
    }

    function updateBradenTotal(){
        const bradenPercepcionSensorial = parseInt(document.querySelector('[name="bradenPercepcionSensorial"]').value || 0);
        const bradenHumedad = parseInt(document.querySelector('[name="bradenHumedad"]').value || 0);
        const bradenActividad = parseInt(document.querySelector('[name="bradenActividad"]').value || 0);
        const bradenMovilidad = parseInt(document.querySelector('[name="bradenMovilidad"]').value || 0);
        const bradenNutricion = parseInt(document.querySelector('[name="bradenNutricion"]').value || 0);
        const bradenFriccion = parseInt(document.querySelector('[name="bradenFriccion"]').value || 0);
        const total = bradenPercepcionSensorial + bradenHumedad + bradenActividad + bradenMovilidad + bradenNutricion + bradenFriccion;
        let level = "";
        if( total >= 19) {
            level = "Sin riesgo";
            document.getElementById("bradenTotal").style.color = "green";
        } else if (total >= 15) {
            level = "Bajo";
            document.getElementById("bradenTotal").style.color = "blue";
        } else if (total < 15 && total >= 13) {
            level = "Moderado";
            document.getElementById("bradenTotal").style.color = "orange";
        } else {
            level = "Alto"
            document.getElementById("bradenTotal").style.color = "red";
        }
        document.getElementById("bradenTotal").textContent = total + " (" + level + ")";
    }

    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <h2 className="col-span-5 text-xl font-bold text-gray-700">Información del Paciente</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 md:row-span-3 flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    {/* Aquí podría ir la foto del paciente en el futuro */}
                    <span className="text-gray-500">Foto</span>
                </div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Paciente</label>
                <select
                    id="patientId"
                    name="patientId"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                >
                    <option value="">Seleccione un paciente</option>
                    <option value="1">Juan Pérez</option>
                    <option value="2">María Gómez</option>
                    <option value="3">Carlos Ruiz</option>
                </select>
                {selectedOption !== "" && (
                    <div className="flex justify-center p-2 mt-4">
                        <Button type="button" onClick={onCancel} variant="primary">
                            Ver Historial Clínico
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                    id="age"
                    placeholder="Edad del paciente"
                    type="text"
                    name="age"
                    maxLength={3}
                    onChange={handleAge}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="patientSex" className="block text-sm font-medium text-gray-700">Sexo</label>
                <select
                    id="patientSex"
                    name="patientSex"
                    value={selectedSex}
                    onChange={(e) => setSelectedSex(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                >
                    <option value="">Seleccione el sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="N">Otro</option>
                </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="patientBirthdate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input
                    placeholder="--/--/----"
                    type="text"
                    id="patientBirthdate"
                    name="patientBirthdate"
                    onChange={handleDate}
                    maxLength={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    pattern="\d{2}/\d{2}/\d{4}"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor='curp' className="block text-sm font-medium text-gray-700">CURP</label>
                <input
                    placeholder="CURP del paciente"
                    type="text"
                    id="curp"
                    name="curp"
                    maxLength={18}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
                <input
                    placeholder="--/--/----"
                    type="text"
                    id="admissionDate"
                    name="admissionDate"
                    onChange={handleDate}
                    maxLength={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    pattern="\d{2}/\d{2}/\d{4}"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="admissionTime" className="block text-sm font-medium text-gray-700">Hora de ingreso</label>
                <input
                    type="time"
                    id="admissionTime"
                    name="admissionTime"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <label htmlFor="serviceUnitBed" className="block text-sm font-medium text-gray-700">Servicio / Unidad / Cama</label>
                <input
                    placeholder="Servicio / Unidad / Cama"
                    type="text"
                    id="serviceUnitBed"
                    name="serviceUnitBed"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                <label htmlFor="medicalDiagnosis" className="block text-sm font-medium text-gray-700">Diagnóstico médico</label>
                <input
                    placeholder="Diagnóstico médico (preliminar o definitivo)"
                    id="medicalDiagnosis"
                    name="medicalDiagnosis"
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>
            
            { /* ANTECEDENTES PERSONALES Y DATOS RELEVANTES */ }
            <h2 className="col-span-5 text-xl font-bold text-gray-700">Antecedentes personales y datos relevantes</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Patológicos</label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" name="diabetes" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Diabetes mellitus</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="hypertension" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Hipertensión arterial</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="cardiopathies" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Cardiopatías</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="asthma" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Asma / EPOC</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="epilepsy" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Epilepsia</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="cancer" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Cáncer</span>
                    </label>
                    <label className="flex items-center">
                        <span className="mr-2">Otra:</span>
                        <input type="text" name="otherPathological" className="w-full border-b border-gray-600" />
                    </label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">No patológicos</label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" name="vaccination" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Esquema de vacunación completo</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="physicalActivity" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Actividad física regular</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="healthyDiet" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Alimentación saludable</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="poorHygiene" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Higiene deficiente</span>
                    </label>
                    <label className="flex items-center">
                        <span className="mr-2">Otra:</span>
                        <input type="text" name="otherNonPathological" className="w-full border-b border-gray-600" />
                    </label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Quirúrgicos</label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" name="poorHygiene" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Apendicectomía</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="poorHygiene" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Cesárea</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="poorHygiene" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Cirugía ortopédica</span>
                    </label>
                    <label className="flex items-center">
                        <span className="mr-2">Otra:</span>
                        <input type="text" name="otherNonPathological" className="w-full border-b border-gray-600" />
                    </label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm">
            <label className="block font-medium text-gray-700 mb-4">Alergias</label>
                <label className="flex items-center pb-1">
                    <span className="mr-2">Medicamentos:</span>
                    <input type="text" name="medicationAllergies" className="ml-2 border-b border-gray-600 w-full p-1" />
                </label>
                <label className="flex items-center py-1">
                    <span className="mr-2">Alimentos:</span>
                    <input type="text" name="medicationAllergies" className="ml-2 border-b border-gray-600 w-full p-1" />
                </label>
                <label className="flex items-center py-1">
                    <span className="mr-2">Sustancias ambientales:</span>
                    <input type="text" name="medicationAllergies" className="ml-2 border-b border-gray-600 w-full p-1" />
                </label>
                <label className="flex items-center py-1">
                        <input type="checkbox" name="noKnownAllergies" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">No conocidas</span>
                    </label>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Medicación actual</label>
                <input
                    type="text"
                    name="currentMedication"
                    placeholder="Nombre del medicamento – Dosis – Frecuencia – Vía"
                    className="w-full border-gray-300 rounded-md"
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Hábitos</label>
                <div className="grid grid-cols-1 gap-4">
                    <label>Tabaquismo: 
                        <select name="smoking" className="ml-2 border-gray-300 rounded-md">
                            <option value="no">No</option>
                            <option value="exSmoker">Exfumador</option>
                            <option value="yes">Sí – cantidad: <input type="text" name="smokingAmount" className="ml-2 border-gray-300 rounded-md w-16" /></option>
                        </select>
                    </label>
                    <label>Alcoholismo: 
                        <select name="alcohol" className="ml-2 border-gray-300 rounded-md">
                            <option value="no">No</option>
                            <option value="social">Social</option>
                            <option value="habitual">Habitual</option>
                        </select>
                    </label>
                    <label>Alimentación: 
                        <select name="diet" className="ml-2 border-gray-300 rounded-md">
                            <option value="balanced">Balanceada</option>
                            <option value="deficient">Deficiente</option>
                            <option value="highFat">Hipergrasas</option>
                        </select>
                    </label>
                    <label>Sueño: 
                        <select name="sleep" className="ml-2 border-gray-300 rounded-md">
                            <option value="normal">Normal</option>
                            <option value="interrupted">Interrumpido</option>
                            <option value="insomnia">Insomnio</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg col-span-2 text-sm">
                <label className="block font-medium text-gray-700 mb-4">Apoyo familiar o red de cuidados</label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center">
                        <input type="checkbox" name="livesAlone" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Vive solo</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="livesWithFamily" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Vive con familia</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="primaryCaregiver" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Tiene un cuidador primario</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="communitySupport" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Apoyo comunitarios</span>
                    </label>
                    <label className="flex items-center col-span-2">
                        <input type="checkbox" name="insufficientSupport" className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0" />
                        <span className="ml-2">Red de cuidados insuficiente o inexistente</span>
                    </label>
                </div>
            </div>

            {/* VALORACIÓN DE ENFERMERÍA */}
            <h2 className="col-span-5 text-xl font-bold text-gray-700">Valoración de enfermería</h2>
            {/* Valoración por sistemas corporales */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Valoración por sistemas corporales</h3>
                <ul className="grid grid-cols-4 items-start">
                    {[
                        { name: "Neurológico", tooltip: "¿Qué evalúa este sistema? Evalúa el estado mental, reflejos, sensibilidad, etc." },
                        { name: "Respiratorio", tooltip: "¿Qué evalúa este sistema? Evalúa la respiración, sonidos pulmonares, etc." },
                        { name: "Cardiovascular", tooltip: "¿Qué evalúa este sistema? Evalúa el ritmo cardíaco, pulsos, etc." },
                        { name: "Digestivo", tooltip: "¿Qué evalúa este sistema? Evalúa el abdomen, digestión, etc." },
                        { name: "Genitourinario", tooltip: "¿Qué evalúa este sistema? Evalúa la micción, genitales, etc." },
                        { name: "Tegumentario (piel)", tooltip: "¿Qué evalúa este sistema? Evalúa la piel, heridas, etc." },
                        { name: "Musculoesquelético", tooltip: "¿Qué evalúa este sistema? Evalúa los músculos, articulaciones, etc." },
                        { name: "Endocrino", tooltip: "¿Qué evalúa este sistema? Evalúa las glándulas, hormonas, etc." },
                        { name: "Hematológico", tooltip: "¿Qué evalúa este sistema? Evalúa la sangre, coagulaciones, etc." },
                        { name: "Inmunológico", tooltip: "¿Qué evalúa este sistema? Evalúa el sistema inmune, alergias, etc." },
                    ].map((system, index) => (
                        <li key={index} className="flex flex-col py-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`system-${index}`}
                                    className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    onChange={(e) => {
                                        const textarea = document.getElementById(`textarea-${index}`);
                                        textarea.disabled = !e.target.checked;
                                        textarea.value = "";
                                        const details = document.getElementById(`system-${index}-details`);
                                        details.style.display = e.target.checked ? "block" : "none";
                                        if (e.target.checked) {
                                            textarea.focus();
                                        }
                                    }}
                                />
                                <label htmlFor={`system-${index}`} className="text-gray-700 font-medium">{system.name}</label>
                                <span className="text-gray-400 cursor-pointer" title={system.tooltip}>ℹ️</span>
                            </div>
                            <div id={`system-${index}-details`} className="flex flex-col space-y-2" style={{ display: "none" }}>
                                <div className="ml-8 flex items-center space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name={`system-${index}-status`} value="normal" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                        <span>Normal</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="radio" name={`system-${index}-status`} value="abnormal" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                        <span>Anormal</span>
                                    </label>
                                </div>
                                <textarea
                                    id={`textarea-${index}`}
                                    name={`system-${index}-details`}
                                    placeholder="Detalle de hallazgos (si aplica)"
                                    className="mt-2 w-11/12 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="2"
                                    disabled
                                ></textarea>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Escalas de valoración */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Escalas de valoración</h3>
                <div className="space-y-6">
                    {/* Dolor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 items-center">
                            Dolor (0–10)
                            <span className="ml-2 text-gray-400 cursor-pointer" title="Evalúa la intensidad del dolor del paciente.">ℹ️</span>
                        </label>
                        <input
                            type="range"
                            name="painScale"
                            min="0"
                            max="10"
                            defaultValue="5"
                            className="mt-1 w-full"
                            onChange={(e) => {
                                const value = e.target.value;
                                e.target.style.background = `linear-gradient(to right, green ${value * 10}%, red ${value * 10}%)`;
                                document.getElementById("painValue").textContent = value;
                            }}
                        />
                        <div className="text-center mt-2 text-sm text-gray-600">Intensidad: <span id="painValue">5</span></div>
                    </div>

                    <hr></hr>

                    {/* Morse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 items-center">
                            Caídas (Morse)
                            <span className="ml-2 text-gray-400 cursor-pointer" title="Evalúa el riesgo de caídas del paciente.">ℹ️</span>
                        </label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Antecedentes de caídas</label>
                                <select
                                    name="morseHistory"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - No</option>
                                    <option value="25">25 - Sí</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Diagnóstico secundario</label>
                                <select
                                    name="morseDiagnosis"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - No</option>
                                    <option value="15">15 - Sí</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ayuda para deambular</label>
                                <select
                                    name="morseAmbulation"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - Reposo en cama/Asistencia de enfermería</option>
                                    <option value="15">15 - Bastón/Muletas/Andador</option>
                                    <option value="30">30 - Se apoya en mueble</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vía venosa</label>
                                <select
                                    name="morseIV"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - No</option>
                                    <option value="20">20 - Sí</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marcha</label>
                                <select
                                    name="morseGait"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - Normal/Inmovilizado/Reposo en cama</option>
                                    <option value="15">15 - Débil</option>
                                    <option value="30">30 - Alterada requiere asistencia</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Conciencia/Estado mental</label>
                                <select
                                    name="morseConsciousness"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateMorseTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="0">0 - Consiente de sus capacidades y limitación</option>
                                    <option value="15">15 - No consiente de sus limitaciones</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                            Total: <span id="morseTotal"></span>
                        </div>
                    </div>

                    <hr></hr>

                    {/* Glasgow */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 items-center">
                            Estado neurológico (Glasgow)
                            <span className="ml-2 text-gray-400 cursor-pointer" title="Evalúa el nivel de conciencia del paciente.">ℹ️</span>
                        </label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ocular</label>
                                <select
                                    name="glasgowEye"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateGlasgowTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="1">1 - No apertura</option>
                                    <option value="2">2 - Apertura al dolor</option>
                                    <option value="3">3 - Apertura a la voz</option>
                                    <option value="4">4 - Apertura espontánea</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Verbal</label>
                                <select
                                    name="glasgowVerbal"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateGlasgowTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="1">1 - Ninguna</option>
                                    <option value="2">2 - Sonidos incomprensibles</option>
                                    <option value="3">3 - Palabras inapropiadas</option>
                                    <option value="4">4 - Confuso</option>
                                    <option value="5">5 - Orientado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Motora</label>
                                <select
                                    name="glasgowMotor"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    onChange={(e) => updateGlasgowTotal()}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="1">1 - Ninguna</option>
                                    <option value="2">2 - Extensión anormal</option>
                                    <option value="3">3 - Flexión anormal</option>
                                    <option value="4">4 - Retira al dolor</option>
                                    <option value="5">5 - Localiza el dolor</option>
                                    <option value="6">6 - Obedece órdenes</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                            Total: <span id="glasgowTotal" ></span>
                        </div>
                    </div>

                    <hr></hr>

                    {/* Braden */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 items-center">
                            Úlceras por presión (Braden)
                            <span className="ml-2 text-gray-400 cursor-pointer" title="Evalúa el riesgo de desarrollar úlceras por presión.">ℹ️</span>
                        </label>
                        <table className="w-full mt-2 border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-2">Parámetro</th>
                                    <th className="border border-gray-300 p-2">Puntuación</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Percepción sensorial</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenPercepcionSensorial" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - Completamente limitado</option>
                                            <option value="2">2 - Muy limitado</option>
                                            <option value="3">3 - Ligeramente limitado</option>
                                            <option value="4">4 - Sin déficit</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Humedad</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenHumedad" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - Constantemente húmedo</option>
                                            <option value="2">2 - Muy húmedo</option>
                                            <option value="3">3 - Ocasionalmente húmedo</option>
                                            <option value="4">4 - Raramente húmedo</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Actividad</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenActividad" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - En cama</option>
                                            <option value="2">2 - En silla</option>
                                            <option value="3">3 - Deambula ocasionalmente</option>
                                            <option value="4">4 - Deambula frecuentemente</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Movilidad</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenMovilidad" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - Completamente inmóvil</option>
                                            <option value="2">2 - Muy limitado</option>
                                            <option value="3">3 - Ligeramente limitado</option>
                                            <option value="4">4 - Sin limitaciones</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Nutrición</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenNutricion" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - Muy pobre</option>
                                            <option value="2">2 - Probablemente inadecuada</option>
                                            <option value="3">3 - Adecuada</option>
                                            <option value="4">4 - Excelente</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-2 font-medium">Fricción y deslizamiento</td>
                                    <td className="border border-gray-300 p-2">
                                        <select name="bradenFriccion" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) => updateBradenTotal()}
                                        defaultValue="">
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">1 - Problema significativo</option>
                                            <option value="2">2 - Problema potencial</option>
                                            <option value="3">3 - Sin problema aparente</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="text-center mt-2 text-sm text-gray-600">
                            Total: <span id="bradenTotal" ></span>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Somatometría</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <input type="number" name="weight" placeholder="Peso (kg)" className="border-gray-300 rounded-md" />
                    <input type="number" name="height" placeholder="Talla (cm)" className="border-gray-300 rounded-md" />
                    <input type="number" name="bmi" placeholder="IMC" className="border-gray-300 rounded-md" />
                    <input type="number" name="headCircumference" placeholder="Perímetro cefálico" className="border-gray-300 rounded-md" />
                    <input type="number" name="abdominalCircumference" placeholder="Perímetro abdominal" className="border-gray-300 rounded-md" />
                </div>
            </div>

            {/* Exploración física */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Exploración física</h3>
                <div className="colg-span-2 grid grid-cols-3 gap-4">
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Estado general</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa el estado general"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Piel</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa la piel"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Cabeza y cuello</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa la cabeza y cuello"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Tórax</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa el tórax"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Abdomen</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa el abdomen"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Extremidades</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa las extremidades"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Dispositivos</label>
                        <textarea
                            name="physicalExam"
                            placeholder="Describa los dispositivos"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Estado emocional / cognitivo */}
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Estado emocional / cognitivo</h3>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Afecto</label>
                        <textarea
                            name="affect"
                            placeholder="Describa el afecto"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Lenguaje</label>
                        <textarea
                            name="language"
                            placeholder="Describa el lenguaje"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Nivel de conciencia</label>
                        <textarea
                            name="consciousnessLevel"
                            placeholder="Describa el nivel de conciencia"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Orientación</label>
                        <textarea
                            name="orientation"
                            placeholder="Describa la orientación"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Memoria</label>
                        <textarea
                            name="memory"
                            placeholder="Describa la memoria"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Juicio</label>
                        <textarea
                            name="judgment"
                            placeholder="Describa el juicio"
                            className="w-full border-gray-300 rounded-md"
                            rows="2"
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 col-span-1 md:col-span-2">
                <Button type="button" onClick={onCancel} variant="secondary">
                    Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
};

export default CarePlanForm;