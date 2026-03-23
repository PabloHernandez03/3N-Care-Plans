import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Login from '../views/LoginView.jsx';
import DashboardView from '../views/DashBoardView.jsx';
import PatientsView from '../views/PatientsView.jsx';
import CarePlansView from '../views/CarePlansView.jsx';
import PatientProfileView from '../views/PatientProfileView.jsx';
import ProfileView from '../views/ProfileView.jsx';
import DictionaryView from '../views/DictionaryView.jsx';
import AdminDashboardView from '../views/AdminDashboardView.jsx';

import ProtegerRutas from '../components/auth/ProtegerRutas.jsx';
// AQUÍ ESTABA EL PROBLEMA: Faltaba importar la ruta que acabamos de crear
import AdminRoute from '../components/auth/AdminRoute.jsx'; 

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública */}
                <Route path="/" element={<Login />} />

                {/* Vistas privadas con ProtegerRutas */}
                <Route element={<ProtegerRutas />}>
                    <Route element={<AppLayout />}>
                        
                        {/* RUTAS COMPARTIDAS (Enfermeros y Admins) */}
                        <Route path="/dashboard" element={<DashboardView />} />
                        <Route path="/patients" element={<PatientsView />} />
                        <Route path="/patients/:id" element={<PatientProfileView />} />
                        <Route path="/care-plans" element={<CarePlansView />} />
                        <Route path="/profile" element={<ProfileView />} />
                        <Route path="/dictionary" element={<DictionaryView />} />

                        {/* RUTAS EXCLUSIVAS DE ADMIN */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin-dashboard" element={<AdminDashboardView />} />
                        </Route>

                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}