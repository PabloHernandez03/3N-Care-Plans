import { useState } from 'react';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import Button from '@/components/shared/Button';

export default function PatientsView() {
    const [activeView, setActiveView] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePatientSaved = () => {
        setRefreshKey(k => k + 1);
        setActiveView('list');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
                {activeView === 'list' && (
                    <Button onClick={() => setActiveView('patientForm')}>
                        Agregar Paciente
                    </Button>
                )}
            </div>

            {activeView === 'patientForm' && (
                <div className="animate-fade-in">
                    <PatientForm
                        onCancel={() => setActiveView('list')}
                        onPatientSaved={handlePatientSaved}
                    />
                </div>
            )}

            {activeView === 'list' && (
                <PatientList key={refreshKey} />
            )}
        </div>
    );
}