import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const carouselData = [
    {
        title: 'NANDA',
        description: 'NANDA International es la organización que desarrolla y mantiene la clasificación de diagnósticos de enfermería, facilitando la identificación de problemas de salud y necesidades del paciente.'
    },
    {
        title: 'NIC',
        description: 'NIC (Nursing Interventions Classification) proporciona un estándar para las intervenciones de enfermería, ayudando a planificar y documentar los cuidados que se brindan al paciente.'
    },
    {
        title: 'NOC',
        description: 'NOC (Nursing Outcomes Classification) define los resultados esperados en el paciente, permitiendo evaluar la efectividad de las intervenciones de enfermería.'
    }
];

const LoginView = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [carouselIndex, setCarouselIndex] = useState(0);

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev === carouselData.length - 1 ? 0 : prev + 1));
        }, 4000); // Cambia cada 4 segundos

        return () => clearInterval(interval);
    }, [carouselData.length]);

    return (
        <div className="min-h-screen flex flex-row bg-gradient-to-br">
            {/* Left Side */}
            <div className="flex-[1.4] flex flex-col justify-center items-center px-8">
                <div className="w-full max-w-md flex flex-row items-center">
                    <h1 className="text-2xl text-left items-center">
                    <span className="text-blue-500 font-bold">3N</span> Nursing Care Plans
                    </h1>
                    { /*Logo */}
                    <div className="ml-auto">
                        <img src="/img/logo.png" alt="Logo" className="h-12 rounded-full" />
                    </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center py-6">
                    <div className="my-6 text-center">
                        <h2 className="text-4xl font-bold text-gray-800 mb-2">¡Buenos días!</h2>
                        <p className="text-gray-600">Por favor inicia sesión para continuar</p>
                    </div>
                    <form
                        onSubmit={handleLogin}
                        className="w-full max-w-md flex flex-col gap-4"
                    >
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="username">
                                Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-200"
                                placeholder="Ingresa tu usuario"
                                autoComplete="username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-200"
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <div className="text-left">
                            <a href="#" className="text-blue-500 hover:underline text-sm">
                                ¿Se te olvidó tu contraseña?
                            </a>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 border border-black bg-black text-white font-bold rounded-lg hover:bg-gray-200 hover:text-black transition-colors shadow-md"
                        >
                            Iniciar sesión
                        </button>
                    </form>
                    <div className="mt-6 text-center text-gray-700 text-sm">
                        ¿Necesitas ayuda?
                        <br />
                        Contáctanos: <span className="font-semibold text-blue-500">soporte@3ncareplans.com</span>
                    </div>
                </div>
            </div>
            {/* Right Side */}
            <div className="flex-[1.6] relative flex items-center justify-center bg-white bg-opacity-30">
                <img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=90"
                    alt="Nursing Care"
                    className="object-cover h-full w-full shadow-2xl"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-300 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 max-w-lg w-full mx-4 text-center">
                        <h3 className="text-2xl font-bold text-blue-500 mb-2">{carouselData[carouselIndex].title}</h3>
                        <p className="text-gray-900 mb-4">{carouselData[carouselIndex].description}</p>
                        <div className="mt-2 flex justify-center gap-2">
                            {carouselData.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-block w-2 h-2 rounded-full ${idx === carouselIndex ? 'bg-blue-500' : 'bg-blue-200'}`}
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

