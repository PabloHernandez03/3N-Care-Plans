import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashBoardView from './views/DashBoardViews'
import CatalogoView from './views/CatalogoView'
import ContactoView from './views/ContactoView'
import PedidosView from './views/PedidosView'

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashBoardView />} index/>
                    <Route path="/catalogo" element={<CatalogoView />} />
                    <Route path="/contacto" element={<ContactoView />} />
                    <Route path="/pedidos" element={<PedidosView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};