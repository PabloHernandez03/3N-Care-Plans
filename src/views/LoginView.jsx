import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// const carouselData = [
//     {
//         title: 'NANDA',
//         description: 'NANDA International es la organización que desarrolla y mantiene la clasificación de diagnósticos de enfermería, facilitando la identificación de problemas de salud y necesidades del paciente.'
//     },
//     {
//         title: 'NIC',
//         description: 'NIC (Nursing Interventions Classification) proporciona un estándar para las intervenciones de enfermería, ayudando a planificar y documentar los cuidados que se brindan al paciente.'
//     },
//     {
//         title: 'NOC',
//         description: 'NOC (Nursing Outcomes Classification) define los resultados esperados en el paciente, permitiendo evaluar la efectividad de las intervenciones de enfermería.'
//     }
// ];

const LoginView = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [carouselIndex, setCarouselIndex] = useState(0);

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    // React.useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCarouselIndex(prev => (prev === carouselData.length - 1 ? 0 : prev + 1));
    //     }, 4000); // Cambia cada 4 segundos

    //     return () => clearInterval(interval);
    // }, [carouselData.length]);

    return (
        <div className="min-h-screen flex flex-row bg-gray-100">
            {/* Left Side */}
            <div className="flex-[1.5] z-10 flex flex-col items-center justify-center">
                <div className="w-10/12 lg:w-1/2 xl:w-3/4 xl:h-full flex flex-col justify-evenly items-center bg-gray-100 p-6 sm:p-8 rounded-xl">
                    {/* Logo */}
                    <div className="w-full flex items-center justify-center">
                        <div className="w-full max-w-xl flex flex-row items-center justify-evenly md:justify-between">
                            {/* 3N Nursing Care Plans */}
                            <div>
                                <h1 className="text-2xl flex flex-row text-left items-center gap-1">
                                <span className="text-primario font-bold">3N</span>
                                <span className="hidden md:block text-gray-600"> Nursing Care Plans</span>
                                <span className="md:hidden text-gray-600"> Care Plans</span>
                                </h1>
                            </div>
                            {/* Imagen */}
                            <div>
                                <div className="ml-auto">
                                    <img src="/img/logo.png" alt="Logo" className="h-12 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Form */}
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
                                <a href="#" className="text-primario hover:underline text-sm">
                                    ¿Se te olvidó tu contraseña?
                                </a>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 border border-primario bg-primario text-white font-semibold rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-colors shadow-md"
                            >
                                Iniciar sesión
                            </button>
                        </form>
                    </div>
                    {/* Help Section */}
                    <div className="w-full flex flex-col items-center justify-center md:py-6">
                        <div className="mt-6 text-center text-gray-700 text-sm">
                                ¿Necesitas ayuda?
                                <br />
                                Contáctanos: <span className="font-semibold text-primario">soporte@3ncareplans.com</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Side */}
            <div className="absolute xl:relative z-0 flex flex-[1.5] items-center justify-end">
                <img
                    src="/img/right-side.png"
                    alt="Nursing Care"
                    className="object-cover h-screen md:w-screen xl:w-full xl:h-screen opacity-90"
                />
                {/* <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-300 bg-opacity-30 backdrop-blur-sm rounded-xl p-8 max-w-lg w-full mx-4 text-center">
                        <h3 className="text-2xl font-bold text-primario mb-2">{carouselData[carouselIndex].title}</h3>
                        <p className="text-gray-900 mb-4">{carouselData[carouselIndex].description}</p>
                        <div className="mt-2 flex justify-center gap-2">
                            {carouselData.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`inline-block w-2 h-2 rounded-full ${idx === carouselIndex ? 'bg-primario' : 'bg-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default LoginView;

