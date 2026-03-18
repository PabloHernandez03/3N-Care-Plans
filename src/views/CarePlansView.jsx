import { useState } from 'react';
import CarePlanList from '@/components/care-plans/CarePlanList';
import CarePlanForm from '@/components/care-plans/CarePlanForm';
import CarePlanBuilder from '@/components/care-plans/CarePlanBuilder';
import Button from '@/components/shared/Button';

export default function CarePlansView() {
    
    const [activeView, setActiveView] = useState('list');
    
    const [activePatient, setActivePatient] = useState(null);

    const handlePatientSaved = (patientData) => {
        setActivePatient(patientData); 
        setActiveView('planBuilder'); 
    };

    const handleCancel = () => {
        setActiveView('list');
        setActivePatient(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Planes de Cuidado</h1>
                
                {activeView === 'list' && (
                    <Button onClick={() => setActiveView('patientForm')}>
                        Crear Nuevo Plan
                    </Button>
                )}
            </div>

            {/* VISTA 1 FORMULARIO PACIENTE*/}
            {activeView === 'patientForm' && (
                <div className="animate-fade-in">
                    <CarePlanForm 
                        onCancel={handleCancel} 
                        onPatientSaved={handlePatientSaved} 
                    />
                </div>
            )}

            {/* VISTA 2 PLAN DE CUIDADOS*/}
            {activeView === 'planBuilder' && (
                <div className="animate-fade-in">
                    <CarePlanBuilder 
                        patient={activePatient} 
                        onCancel={handleCancel} 
                    />
                </div>
            )}

            {/* VISTA 3 LISTADO DE PLANES */}
            {activeView === 'list' && (
                <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4">Planes de Cuidado Activos</h2>
                    <CarePlanList />
                </div>
            )}
        </div>
    );
}