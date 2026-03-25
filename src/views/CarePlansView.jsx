import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import CarePlanList from '@/components/care-plans/CarePlanList';
import CarePlanForm from '@/components/care-plans/CarePlanForm';
import CarePlanBuilder from '@/components/care-plans/CarePlanBuilder';
import CarePlanDetail from '@/components/care-plans/CarePlanDetail'; // 🟢 NUEVO COMPONENTE
import Button from '@/components/shared/Button';

export default function CarePlansView() {
    
    const [activeView, setActiveView] = useState('list');
    const [activePatient, setActivePatient] = useState(null);
    const [activePlan, setActivePlan] = useState(null); // 🟢 ESTADO PARA EL PLAN SELECCIONADO
    
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handlePatientSaved = (patientData) => {
        setActivePatient(patientData); 
        setActiveView('planBuilder'); 
    };

    const handleViewPlan = (plan) => {
        setActivePlan(plan);
        setActiveView('planDetail');
    };

    const handleCancel = () => {
        setActiveView('list');
        setActivePatient(null);
        setActivePlan(null);
    };

    return (
        <div className="space-y-6 relative min-h-screen pb-10">
            {toast && (
                <div className={`fixed bottom-8 left-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-medium text-sm animate-fade-in ${toast.type === 'success' ? 'bg-[#16a09e]' : 'bg-red-500'}`}>
                    <FontAwesomeIcon icon={toast.type === 'success' ? faCheckCircle : faExclamationCircle} className="text-xl" />
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800">Planes de Cuidado</h1>
                
                {activeView === 'list' && (
                    <Button onClick={() => setActiveView('patientForm')} className="bg-[#16a09e] hover:bg-[#128a88] text-white rounded-xl shadow-md px-6 py-2.5 font-bold transition-all">
                        Crear Plan
                    </Button>
                )}
            </div>

            {activeView === 'patientForm' && (
                <div className="animate-fade-in">
                    <CarePlanForm onCancel={handleCancel} onPatientSaved={handlePatientSaved} showToast={showToast} />
                </div>
            )}

            {activeView === 'planBuilder' && (
                <div className="animate-fade-in">
                    <CarePlanBuilder patient={activePatient} onCancel={handleCancel} showToast={showToast} />
                </div>
            )}

            {/* 🟢 NUEVA VISTA DE DETALLE */}
            {activeView === 'planDetail' && (
                <div className="animate-fade-in">
                    <CarePlanDetail plan={activePlan} onBack={handleCancel} showToast={showToast} />
                </div>
            )}

            {activeView === 'list' && (
                <div className="bg-transparent animate-fade-in">
                    <CarePlanList onViewPlan={handleViewPlan} showToast={showToast} patientId={null} />
                </div>
            )}
        </div>
    );
}