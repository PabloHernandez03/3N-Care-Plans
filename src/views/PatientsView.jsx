import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import PatientList from '@/components/patients/PatientList';
import PatientForm from '@/components/patients/PatientForm';
import Button from '@/components/shared/Button';

export default function PatientsView() {
    const [activeView, setActiveView] = useState('list');
    const [refreshKey, setRefreshKey] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handlePatientSaved = () => {
        setRefreshKey(k => k + 1);
        setActiveView('list');
    };

    return (
        <div className="space-y-6 relative min-h-screen">
            
            {toast && (
                <div className={`fixed top-8 left-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium text-sm animate-fade-in ${toast.type === 'success' ? 'bg-[#16a09e]' : 'bg-red-500'}`}>
                    <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faExclamationCircle} className="text-xl" />
                    <span>{toast.message}</span>
                </div>
            )}

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
                        showToast={showToast}
                    />
                </div>
            )}

            {activeView === 'list' && (
                <PatientList key={refreshKey} showToast={showToast} />
            )}
        </div>
    );
}