import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '@/assets/logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 

const carouselData = [
    {
        title: 'NANDA',
        description: 'NANDA International desarrolla y mantiene la clasificación de diagnósticos de enfermería, facilitando la identificación de necesidades del paciente.'
    },
    {
        title: 'NIC',
        description: 'NIC (Nursing Interventions Classification) proporciona un estándar para las intervenciones, ayudando a planificar los cuidados brindados.'
    },
    {
        title: 'NOC',
        description: 'NOC (Nursing Outcomes Classification) define los resultados esperados, permitiendo evaluar la efectividad de las intervenciones.'
    }
];

const LoginView = () => {
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);

    const location = useLocation();
    const registrado = location.state?.registered;

    // Limpiar sesión al cargar el login por seguridad
    useEffect(() => {
        sessionStorage.clear();
        localStorage.clear();
    }, []);

    // Carrusel automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev === carouselData.length - 1 ? 0 : prev + 1));
        }, 4000); 
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const apiBase = import.meta.env.VITE_API_URL;
        const creds = { email, password };

        try {
            let response;
            
            // --- CASCADA DE AUTENTICACIÓN POR ROLES ---
            
            // 1. Intentar como Enfermero Operativo
            try {
                response = await axios.post(`${apiBase}/api/enfermero/login`, creds);
            } catch (err) {
                // 2. Si falla, intentar como Jefe de Enfermería (Elena)
                if (err.response && (err.response.status === 404 || err.response.status === 401)) {
                    try {
                        response = await axios.post(`${apiBase}/api/jefe/login`, creds);
                    } catch (errJefe) {
                        // 3. Si falla, intentar como Admin (Marcus Fenix)
                        if (errJefe.response && (errJefe.response.status === 404 || errJefe.response.status === 401)) {
                            response = await axios.post(`${apiBase}/api/admin/login`, creds);
                        } else {
                            throw errJefe;
                        }
                    }
                } else {
                    throw err; 
                }
            }

            // --- VALIDACIÓN Y PERSISTENCIA ---
            if (response.data?.user && response.data?.token) {
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
                sessionStorage.setItem('token', response.data.token); 
                
                const rol = response.data.user.cuenta?.rol;

                // Redirección basada en el Rol
                if (rol === 'admin') {
                    navigate('/admin-dashboard'); 
                } else {
                    // Jefes y Enfermeros van al dashboard clínico (el NavMenu filtrará sus opciones)
                    navigate('/dashboard');
                }
            } else {
                throw new Error("El servidor no respondió con los datos de sesión correctos.");
            }

        } catch (err) {
            const mensajeError = err.response?.data?.error || 'Credenciales incorrectas. Intenta de nuevo.';
            setError(mensajeError);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-white to-gray-100">
            {/* Sección Formulario */}
            <div className="w-full lg:flex-[1.4] flex flex-col justify-center items-center px-6 md:px-12 py-10 lg:py-0 bg-gray-50 min-h-screen lg:min-h-0">
                <div className="w-full max-w-md flex flex-row items-center mb-8">
                    <h1 className="text-2xl text-left items-center">
                        <span className="text-blue-500 font-bold">3N</span> Nursing Care Plans
                    </h1>
                    <div className="ml-auto">
                        <img src={logo} alt="Logo" className="h-12 md:h-14 rounded-full shadow-sm" />
                    </div>
                </div>
                
                <div className="w-full max-w-md flex flex-col items-center justify-center py-6">
                    <div className="my-4 lg:my-6 text-center w-full">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">¡Buenos días!</h2>
                        <p className="text-gray-600">Inicia sesión con tu cuenta de hospital</p>
                        
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded text-sm text-left animate-pulse">
                                <span className="font-bold">Acceso denegado:</span> {error}
                            </div>
                        )}
                    </div>
                    
                    {registrado && (
                        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded text-sm w-full">
                            ✓ Registro completado. Ya puedes ingresar.
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-4 lg:gap-5">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                                placeholder="usuario@hospital.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2 text-sm md:text-base" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <div className="text-left">
                            <Link to="/register" className="text-blue-500 hover:underline text-sm font-medium">
                                ¿Eres nuevo personal? Regístrate aquí
                            </Link>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 mt-2 font-bold rounded-lg transition-all shadow-md ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            {loading ? 'Verificando credenciales...' : 'Entrar al Sistema'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center text-gray-500 text-xs">
                        Soporte técnico: <span className="font-semibold text-blue-500">soporte@3ncareplans.com</span>
                    </div>
                </div>
            </div>
            
            <div className="hidden lg:flex lg:flex-[1.6] relative items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                    alt="Nursing Care"
                    className="object-cover h-full w-full"
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 backdrop-blur-[2px]">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full mx-6 text-center shadow-2xl border border-white/20">
                        <h3 className="text-3xl font-black text-blue-700 mb-3 uppercase tracking-tighter">
                            {carouselData[carouselIndex].title}
                        </h3>
                        <p className="text-gray-700 mb-5 text-lg leading-relaxed font-medium">
                            {carouselData[carouselIndex].description}
                        </p>
                        
                        <div className="mt-4 flex justify-center gap-2">
                            {carouselData.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-block h-2 rounded-full transition-all duration-500 ${
                                        idx === carouselIndex ? 'bg-blue-600 w-10' : 'bg-blue-200 w-2'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;