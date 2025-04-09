import React, { useState } from 'react';
import Button from '@/components/shared/Button';

const PatientForm = ({ onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        condition: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos del paciente:', formData);
        // Aquí podrías enviar los datos a una API
        onCancel(); // Cierra el formulario después de enviar
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Condición</label>
                <input
                    type="text"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

export default PatientForm;
