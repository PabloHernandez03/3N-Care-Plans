/**
 * EJEMPLOS DE USO - CHATBOT SISTEMA EXPERTO
 * 
 * Diferentes formas de integrar el chatbot en tu app
 */

// ===== EJEMPLO 1: DASHBOARD GENERAL =====
// Archivo: src/views/DashBoardView.jsx
import Chatbot from '../components/chatbot/Chatbot';

export function DashboardViewExample() {
  const handleSessionClose = (summary) => {
    console.log('Sesión cerrada:', summary);
  };

  return (
    <div>
      <h1>Panel de Control</h1>
      
      {/* Chatbot para consultas generales */}
      <Chatbot
        processType="general_consultation"
        onSessionClose={handleSessionClose}
      />
    </div>
  );
}

// ===== EJEMPLO 2: CREAR PLAN DE CUIDADO =====
// Archivo: src/views/CarePlanView.jsx
import { useState } from 'react';
import Chatbot from '../components/chatbot/Chatbot';
import { useParams } from 'react-router-dom';

export function CarePlanViewExample() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState({
    name: 'Juan García',
    age: 65,
    diagnosis: 'Diabetes Mellitus Tipo 2',
    medicalHistory: ['Hipertensión', 'Obesidad'],
    medications: ['Metformina', 'Lisinopril']
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleSessionClose = (summary) => {
    // Guardar el plan generado
    setGeneratedPlan(summary);
    
    // Enviar al servidor para persistencia
    fetch(`/api/care-plans/${patientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary)
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h1>Plan de Cuidado - {patient.name}</h1>
        <div className="bg-white p-4 rounded shadow">
          <h2>Información del Paciente</h2>
          <p><strong>Edad:</strong> {patient.age}</p>
          <p><strong>Diagnóstico:</strong> {patient.diagnosis}</p>
          <p><strong>Antecedentes:</strong> {patient.medicalHistory.join(', ')}</p>
        </div>
        
        {generatedPlan && (
          <div className="bg-green-50 p-4 rounded mt-4">
            <h3>Plan Generado ✓</h3>
            <p>{JSON.stringify(generatedPlan, null, 2)}</p>
          </div>
        )}
      </div>

      <div>
        {/* Chatbot contextualized */}
        <Chatbot
          patientId={patientId}
          patientContext={{
            name: patient.name,
            age: patient.age,
            diagnosis: patient.diagnosis,
            medicalHistory: patient.medicalHistory,
            medications: patient.medications
          }}
          processType="care_plan_creation"
          onSessionClose={handleSessionClose}
        />
      </div>
    </div>
  );
}

// ===== EJEMPLO 3: EVALUACIÓN DE PACIENTE =====
// Archivo: src/views/PatientAssessmentView.jsx
import Chatbot from '../components/chatbot/Chatbot';

export function PatientAssessmentViewExample({ patientId }) {
  const handleSessionClose = (assessment) => {
    console.log('Evaluación completada:', assessment);
    
    // Guardar evaluación
    saveAssessment(patientId, assessment);
  };

  return (
    <div>
      <h1>Evaluación Inicial de Paciente</h1>
      <p>El sistema experto te guiará a través de una evaluación completa.</p>
      
      <Chatbot
        patientId={patientId}
        processType="patient_assessment"
        patientContext={{ step: "initial_assessment" }}
        onSessionClose={handleSessionClose}
      />
    </div>
  );
}

// ===== EJEMPLO 4: CHATBOT EN MODAL =====
// Archivo: src/components/ExpertConsultModal.jsx
import { useState } from 'react';
import Chatbot from './chatbot/Chatbot';

export function ExpertConsultModalExample({ isOpen, onClose, patientId }) {
  if (!isOpen) return null;

  const handleSessionClose = (data) => {
    console.log('Consulta completada:', data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl h-96">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        
        <Chatbot
          patientId={patientId}
          processType="quick_consult"
          onSessionClose={handleSessionClose}
        />
      </div>
    </div>
  );
}

// ===== EJEMPLO 5: INTEGRACIÓN CON ESTADO GLOBAL (Redux/Context) =====
// Archivo: src/views/IntegratedView.jsx
import { useContext } from 'react';
import Chatbot from '../components/chatbot/Chatbot';
import { PatientContext } from '../context/PatientContext';

export function IntegratedViewExample() {
  const { currentPatient, updatePatientPlan } = useContext(PatientContext);

  const handleSessionClose = (plan) => {
    // Actualizar estado global
    updatePatientPlan(currentPatient.id, plan);
    
    // También enviar a servidor
    fetch(`/api/plans/${currentPatient.id}`, {
      method: 'PUT',
      body: JSON.stringify(plan)
    });
  };

  return (
    <Chatbot
      patientId={currentPatient.id}
      patientContext={currentPatient}
      processType="plan_optimization"
      onSessionClose={handleSessionClose}
    />
  );
}

// ===== EJEMPLO 6: MÚLTIPLES CHATBOTS EN PÁGINA =====
// Archivo: src/views/MultiChatView.jsx
export function MultiChatViewExample() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <h3>NIC Lookup</h3>
        <Chatbot processType="nic_consultation" />
      </div>
      
      <div>
        <h3>NOC Lookup</h3>
        <Chatbot processType="noc_consultation" />
      </div>
      
      <div>
        <h3>Care Planning</h3>
        <Chatbot processType="care_plan_creation" />
      </div>
    </div>
  );
}

// ===== EJEMPLO 7: CHATBOT CON BÚSQUEDA PREVIA =====
// Archivo: src/views/SearchAndChatView.jsx
import { useState } from 'react';
import Chatbot from '../components/chatbot/Chatbot';

export function SearchAndChatViewExample() {
  const [selectedNIC, setSelectedNIC] = useState(null);

  return (
    <div>
      <div className="border-b pb-4">
        <h2>Buscar Intervención NIC</h2>
        <SearchNICComponent onSelect={setSelectedNIC} />
        
        {selectedNIC && (
          <div className="bg-blue-50 p-3 rounded mt-2">
            <p>Seleccionado: <strong>{selectedNIC.title}</strong></p>
            <p>Código: {selectedNIC.code}</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p>Pregunta al experto sobre esta intervención:</p>
        <Chatbot
          processType="nic_deep_learning"
          patientContext={{
            selectedNIC: selectedNIC?.code
          }}
        />
      </div>
    </div>
  );
}

// ===== EJEMPLO 8: ERROR HANDLING =====
// Archivo: src/views/RobustChatView.jsx
import { useState } from 'react';
import Chatbot from '../components/chatbot/Chatbot';

export function RobustChatViewExample() {
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const handleSessionClose = (data) => {
    try {
      setSessionData(data);
      
      // Validar datos
      if (!data.summary || !data.recommendations) {
        throw new Error('Datos incompletos recibidos');
      }

      // Procesar
      processCarePlan(data);
    } catch (err) {
      setError(err.message);
      console.error('Error procesando sesión:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded mb-4">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="ml-2">✕</button>
        </div>
      )}

      <Chatbot
        processType="care_plan_creation"
        onSessionClose={handleSessionClose}
        useLocalFallback={true}
      />

      {sessionData && (
        <div className="bg-green-50 p-4 rounded mt-4">
          <h3>Datos de Sesión</h3>
          <pre>{JSON.stringify(sessionData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ===== HELPER FUNCTIONS =====

async function saveAssessment(patientId, assessment) {
  try {
    const response = await fetch(`/api/patients/${patientId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    });
    
    if (!response.ok) throw new Error('Error guardando evaluación');
    
    const result = await response.json();
    console.log('Evaluación guardada:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function processCarePlan(planData) {
  // Procesar, validar, guardar
  console.log('Procesando plan de cuidado:', planData);
}

// Placeholder para componente de búsqueda
function SearchNICComponent({ onSelect }) {
  return (
    <input
      type="search"
      placeholder="Buscar intervención..."
      onChange={(e) => {
        // Implementar búsqueda
        // onSelect(result);
      }}
    />
  );
}

export default {
  DashboardViewExample,
  CarePlanViewExample,
  PatientAssessmentViewExample,
  ExpertConsultModalExample,
  IntegratedViewExample,
  MultiChatViewExample,
  SearchAndChatViewExample,
  RobustChatViewExample
};
