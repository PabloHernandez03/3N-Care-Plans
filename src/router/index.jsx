import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Login from '../views/LoginView.jsx';
import DashboardView from '../views/DashBoardView.jsx';
import PatientsView from '../views/PatientsView.jsx';
import CarePlansView from '../views/CarePlansView.jsx';
import ProfileView from '../views/ProfileView.jsx';
import DictionaryView from '../views/DictionaryView.jsx';

import ProtegerRutas from '../components/auth/ProtegerRutas.jsx';

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/*Ruta pública*/}
                <Route path="/" element={<Login />} />

                {/*vistas privadas con ProtegerRutas */}
                <Route element={<ProtegerRutas />}>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<DashboardView />} />
                        <Route path="/patients" element={<PatientsView />} />
                        <Route path="/care-plans" element={<CarePlansView />} />
                        <Route path="/profile" element={<ProfileView />} />
                        <Route path="/dictionary" element={<DictionaryView />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}