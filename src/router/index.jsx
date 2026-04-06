import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Login from '../views/LoginView.jsx';
import RegisterView from '../views/RegisterView.jsx';
import DashboardView from '../views/DashBoardView.jsx';
import PatientsView from '../views/PatientsView.jsx';
import CarePlansView from '../views/CarePlansView.jsx';
import PatientProfileView from '../views/PatientProfileView.jsx';
import ProfileView from '../views/ProfileView.jsx';
import DictionaryView from '../views/DictionaryView.jsx';
import AdminDashboardView from '../views/AdminDashboardView.jsx';
import TeamView from '../views/TeamView.jsx';

// Componentes de Protección
import ProtegerRutas from '../components/auth/ProtegerRutas.jsx';
import EnfermeroRoute from '../components/auth/EnfermeroRoute.jsx';
import JefeRoute from '../components/auth/JefeRoute.jsx';
import AdminRoute from '../components/auth/AdminRoute.jsx'; 

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- ZONA PÚBLICA --- */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<RegisterView />} />

                {/* --- CAPA PRIVADA (Requiere Login) --- */}
                <Route element={<ProtegerRutas />}>
                    <Route element={<AppLayout />}>
                        
                        {/* Vistas para Enfermeros */}
                        <Route element={<EnfermeroRoute />}>
                            <Route path="/dashboard" element={<DashboardView />} />
                            <Route path="/patients" element={<PatientsView />} />
                            <Route path="/patients/:id" element={<PatientProfileView />} />
                            <Route path="/care-plans" element={<CarePlansView />} />
                            <Route path="/dictionary" element={<DictionaryView />} />
                        </Route>

                        {/* Vistas de Jefe de enfermeria */}
                        <Route element={<JefeRoute />}>
                            <Route path="/team" element={<TeamView />} />
                        </Route>

                        {/*Vistas de Administrador*/}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin-dashboard" element={<AdminDashboardView />} />
                        </Route>

                        {/* Vista para todos */}
                        <Route path="/profile" element={<ProfileView />} />

                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}