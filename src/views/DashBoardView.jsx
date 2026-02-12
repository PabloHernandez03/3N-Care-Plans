import StatsCard from '../components/dashboard/StatsCard';
import RecentPatients from '../components/dashboard/RecentPatients';
import Chatbot from '../components/chatbot/Chatbot';

export default function DashboardView() {
    const handleSessionClose = (summary) => {
        console.log('Sesión del chatbot cerrada. Resumen:', summary);
        // Aquí puedes guardar el resumen o hacer algo con los datos
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="Pacientes Activos" value="124" />
                <StatsCard title="Planes Activos" value="89" />
                <StatsCard title="Intervenciones Hoy" value="15" />
            </div>

            {/* Listado reciente de pacientes */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Pacientes Recientes</h2>
                <RecentPatients />
            </div>

            {/* Sistema Experto NIC-NOC */}
            <Chatbot
                processType="general_consultation"
                onSessionClose={handleSessionClose}
                useLocalFallback={true}
            />
        </div>
    );
}