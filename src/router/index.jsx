import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import Login from '../views/LoginView.jsx';
import DashboardView from '../views/DashBoardView.jsx';
import PatientsView from '../views/PatientsView.jsx';
import CarePlansView from '../views/CarePlansView.jsx';
import ProfileView from '../views/ProfileView.jsx';
import DictionaryView from '../views/DictionaryView.jsx';

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardView />} />
                    <Route path="/patients" element={<PatientsView />} />
                    <Route path="/care-plans" element={<CarePlansView />} />
                    <Route path="/profile" element={<ProfileView />} />
                    <Route path="/dictionary" element={<DictionaryView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}