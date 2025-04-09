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

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-6">
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