import React, { useState } from 'react';
import Button from '@/components/shared/Button';

interface CarePlanFormProps {
    onCancel: () => void;
}

interface CarePlanFormData {
    title: string;
    description: string;
    patientId: string;
    frequency: 'diario' | 'semanal' | 'mensual';
}

const CarePlanForm: React.FC<CarePlanFormProps> = ({ onCancel }) => {
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [selectedSex, setSelectedSex] = useState<string>("");
    // const [searchTerm, setSearchTerm] = useState<string>("");

    const [formData, setFormData] = useState<CarePlanFormData>({
        title: '',
        description: '',
        patientId: '',
        frequency: 'diario',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    {/**/}

    const handleBirthdate = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { value } = e.target;
        const regex = /^[0-9/]*$/;
        if (regex.test(value)) {
            for(let i=0; i < value.length; i++){
                if(i === 2 || i === 5){
                    if(value.charAt(i) !== '/'){
                        e.target.value = value.slice(0, -1);
                    }
                } else {
                    if(value.charAt(i) === '/' && i !== 2 && i !== 5){
                        e.target.value = value.slice(0, -1);
                    }
                }
            }
                
        } else {
            e.target.value = value.slice(0, -1);
        }
    };

    const handleAge = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { value } = e.target;
        const regex = /^[0-9]*$/;
        if (regex.test(value)) {
            if(parseInt(value) > 130){
                e.target.value = value.slice(0, -1);
            }
        } else {
            e.target.value = value.slice(0, -1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Datos del plan:', formData);
        // Aquí podrías enviar los datos a una API
        onCancel(); // Cierra el formulario después de enviar
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div>
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                <select
                    name="patientId"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                >
                    <option value="">Seleccione un paciente</option>
                    {/* <option value="buscar">Buscar paciente...</option> */}
                    <option value="1">Juan Pérez</option>
                    <option value="2">María Gómez</option>
                    <option value="3">Carlos Ruiz</option>
                </select>
                
                {/* {selectedOption === "buscar" && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Buscar Paciente:</label>
                        <input
                            type="text"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Escriba el nombre del paciente"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )} */}
            </div>

            { selectedOption !== "" && ( 
                <div className="flex justify-end gap-4">
                    <Button type="button" onClick={onCancel} variant="primary">
                        Ver Historial Clínico
                    </Button>
                </div>
                
            )}

            {/* DATOS BÁSICOS */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                    placeholder='Edad del paciente' 
                    type="text" //patientAge
                    name="age"
                    maxLength={3}
                    // value={formData.title}
                    onChange={handleAge}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <label className="block text-sm font-medium text-gray-700">Sexo</label>
            <select
                name="patientSex"
                value={selectedSex}
                onChange={(e) => setSelectedSex(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
            >   
                <option value="">Seleccione el sexo del paciente</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="N">Pinche helicoptero apache alv</option>
            </select>

            { /* --/--/---- */ }
            <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input
                    placeholder='--/--/----'
                    type="text"
                    name="patientBirthdate"
                    // value={formData.birthdate}
                    onChange={handleBirthdate}
                    maxLength={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    pattern="\d{2}/\d{2}/\d{4}"
                    required
                />
            </div>
            

            <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    required
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" onClick={onCancel} variant="secondary">
                    Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
};

export default CarePlanForm;