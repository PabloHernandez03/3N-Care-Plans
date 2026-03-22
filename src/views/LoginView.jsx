import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '@/assets/logo.png'

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

    useEffect(() => {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
    }, []);

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

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/enfermero/login`, {
                email: email,
                password: password
            });

            if (response.data) {
                sessionStorage.setItem('user', JSON.stringify(response.data.user));
                
                navigate('/dashboard');
            }
        } catch (err) {
            const mensajeError = err.response?.data?.error || 'Error al conectar con el servidor. Intenta más tarde.';
            setError(mensajeError);
        } finally {
            setLoading(false); 
        }
    };

    return (
        /* Cambiamos a flex-col por defecto (móvil) y lg:flex-row para escritorio */
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-white to-gray-100">
           
            {/* LADO IZQUIERDO: Formulario (Ocupa todo el ancho en móvil) */}
            <div className="w-full lg:flex-[1.4] flex flex-col justify-center items-center px-6 md:px-12 py-10 lg:py-0 bg-gray-50 min-h-screen lg:min-h-0">
                <div className="w-full max-w-md flex flex-row items-center mb-8">
                    <h1 className="text-2xl text-left items-center">
                        <span className="text-blue-500 font-bold">3N</span> Nursing Care Plans
                    </h1>
                    {/* Logo */}
                    <div className="ml-auto">
                        <img src={logo} alt="Logo" className="h-12 md:h-14 rounded-full shadow-sm" />
                    </div>
                </div>
                
                <div className="w-full max-w-md flex flex-col items-center justify-center py-6">
                    <div className="my-4 lg:my-6 text-center w-full">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">¡Buenos días!</h2>
                        <p className="text-gray-600">Por favor inicia sesión para continuar</p>
                        
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded text-sm text-left animate-pulse">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}
                    </div>
                    
                    <form
                        onSubmit={handleLogin}
                        className="w-full max-w-md flex flex-col gap-4 lg:gap-5"
                    >
                        {/* Input de Correo (Usuario) */}
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
                                placeholder="Ingresa tu correo"
                                required
                            />
                        </div>
                        
                        {/* Input de Contraseña */}
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
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>
                        
                        <div className="text-left">
                            <a href="#" className="text-blue-500 hover:underline text-sm">
                                ¿Se te olvidó tu contraseña?
                            </a>
                        </div>
                        
                        {/* Botón de Iniciar Sesión*/}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 mt-2 font-bold rounded-lg transition-all shadow-md ${
                                loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {loading ? 'Validando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center text-gray-700 text-sm">
                        ¿Necesitas ayuda?
                        <br />
                        Contáctanos: <span className="font-semibold text-blue-500">soporte@3ncareplans.com</span>
                    </div>
                </div>
            </div>
            
            {/* LADO DERECHO: Carrusel (Oculto en móvil, visible en pantallas grandes) */}
            <div className="hidden lg:flex lg:flex-[1.6] relative items-center justify-center bg-white bg-opacity-30">
               
                <img
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                    alt="Nursing Care"
                    className="object-cover h-full w-full shadow-2xl"
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-blue-900 bg-opacity-30 backdrop-blur-[1px]">
                    <div className="bg-gray-100 bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 max-w-lg w-full mx-6 text-center shadow-xl border border-gray-200">
                        <h3 className="text-3xl font-black text-blue-600 mb-3">{carouselData[carouselIndex].title}</h3>
                        <p className="text-gray-800 mb-5 text-lg leading-relaxed">{carouselData[carouselIndex].description}</p>
                        
                        <div className="mt-4 flex justify-center gap-3">
                            {carouselData.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-block w-3 h-3 rounded-full transition-all ${
                                        idx === carouselIndex ? 'bg-blue-600 w-8' : 'bg-blue-200'
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