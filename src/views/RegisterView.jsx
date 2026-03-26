import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '@/assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';

const carouselData = [
    {
        title: 'Registro Profesional',
        description: 'Únete a la red 3N para gestionar planes de cuidado estandarizados y mejorar la atención al paciente.'
    },
    {
        title: 'MEJORA TU CONOCIMIENTO EN LAS 3N',
        description: 'Accede a la base de datos integrada de NANDA, NIC y NOC para una práctica clínica basada en evidencia.'
    }
];

const RegisterView = () => {
    const navigate = useNavigate();
    
    // PAYLOAD COMPLETO (Sincronizado con tu JSON de la DB)
    const [formData, setFormData] = useState({
        nombre: '', apellido_paterno: '', apellido_materno: '', 
        cedula_profesional: '', curp_dni: '',
        telefono: '', calle: '', ciudad: '', estado: '',
        grado_academico: 'Licenciatura en Enfermería', 
        institucion_egreso: 'Universidad de Guadalajara',
        unidad_hospitalaria: '', area_asignada: '', turno: '',
        correo_electronico: '', password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '' });

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev === carouselData.length - 1 ? 0 : prev + 1));
        }, 5000); 
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/enfermero/registro`, formData);
            setNotificacion({ mostrar: true, mensaje: '¡Registro exitoso! Redirigiendo...' });
            setTimeout(() => navigate('/'), 2500);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrar el usuario.');
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-white to-gray-100 font-sans">
            
            {notificacion.mostrar && (
                <div className="fixed top-5 right-5 z-50 p-4 bg-green-600 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border-l-4 border-green-400">
                    <span className="font-bold text-sm">✅ {notificacion.mensaje}</span>
                </div>
            )}

            <div className="w-full lg:flex-[1.4] h-screen overflow-y-auto bg-gray-50 px-6 md:px-12 py-10 lg:py-12">
                
                <div className="w-full max-w-2xl mx-auto flex flex-row items-center mb-8">
                    <h1 className="text-2xl text-left">
                        <span className="text-blue-500 font-bold">3N</span> Nursing Care Plans
                    </h1>
                    <div className="ml-auto">
                        <img src={logo} alt="Logo" className="h-12 md:h-14 rounded-full shadow-sm border border-gray-100" />
                    </div>
                </div>
                
                <div className="w-full max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
                        <p className="text-gray-600">Por favor, completa todos los campos del perfil</p>
                        
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded text-sm text-left animate-pulse">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleRegister} className="flex flex-col gap-6">
                        
                        {/* 1. IDENTIDAD */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3"><h3 className="text-blue-500 font-bold text-xs uppercase tracking-widest border-b pb-1">1. Identidad</h3></div>
                            <div className="md:col-span-1">
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Nombre(s)</label>
                                <input name="nombre" value={formData.nombre} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Ap. Paterno</label>
                                <input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Ap. Materno</label>
                                <input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Cédula Profesional</label>
                                <input name="cedula_profesional" value={formData.cedula_profesional} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">CURP</label>
                                <input name="curp_dni" value={formData.curp_dni} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none uppercase" required />
                            </div>
                        </div>

                        {/* 2. CONTACTO Y DIRECCIÓN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><h3 className="text-blue-500 font-bold text-xs uppercase tracking-widest border-b pb-1">2. Ubicación y Contacto</h3></div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Teléfono</label>
                                <input name="telefono" value={formData.telefono} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Ciudad</label>
                                <input name="ciudad" value={formData.ciudad} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Estado</label>
                                <input name="estado" value={formData.estado} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Calle y Número</label>
                                <input name="calle" value={formData.calle} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                        </div>

                        {/* 3. PROFESIONAL Y LABORAL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <h3 className="text-blue-500 font-bold text-xs uppercase tracking-widest border-b pb-1">
                                    3. Datos Laborales y Académicos
                                </h3>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Unidad Hospitalaria</label>
                                <input name="unidad_hospitalaria" value={formData.unidad_hospitalaria} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" placeholder="Ej: Hospital Civil" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Área Asignada</label>
                                <input name="area_asignada" value={formData.area_asignada} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" placeholder="Ej: Urgencias" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Grado Académico</label>
                                <input name="grado_academico" value={formData.grado_academico} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required />
                            </div>
                            {/* CAMPO AGREGADO AQUÍ */}
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Institución de Egreso</label>
                                <input name="institucion_egreso" value={formData.institucion_egreso} onChange={handleChange} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" placeholder="Ej: Universidad de Guadalajara" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Turno</label>
                                <select name="turno" value={formData.turno} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white shadow-sm outline-none" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="Matutino">Matutino</option>
                                    <option value="Vespertino">Vespertino</option>
                                    <option value="Nocturno">Nocturno</option>
                                    <option value="Jornada Acumulada">Jornada Acumulada</option>
                                </select>
                            </div>
                        </div>

                        {/* 4. CUENTA */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 space-y-4">
                            <h3 className="text-blue-500 font-bold text-sm uppercase tracking-widest">4. Credenciales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Email</label>
                                    <input name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1 text-xs uppercase">Contraseña</label>
                                    <input name="password" value={formData.password} onChange={handleChange} type="password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-gray-50 outline-none" required />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 mt-4 pb-12">
                            <button type="submit" disabled={loading} className={`px-12 py-3 font-bold rounded-lg transition-all shadow-md ${loading ? 'bg-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}>
                                {loading ? 'Registrando...' : 'Registrar Cuenta'}
                            </button>
                            <Link to="/" className="text-gray-400 hover:text-blue-500 text-sm font-semibold transition-colors">← Volver al Login</Link>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* PANEL DERECHO: CARRUSEL */}
            <div className="hidden lg:flex lg:flex-[1.6] relative items-center justify-center bg-white bg-opacity-30">
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" alt="Nursing" className="object-cover h-full w-full" />
                <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30 backdrop-blur-[1px]">
                    <div className="bg-gray-100/90 backdrop-blur-sm rounded-2xl p-10 max-w-lg w-full mx-6 text-center shadow-xl border border-gray-200">
                        <h3 className="text-3xl font-black text-blue-600 mb-3 uppercase tracking-tighter">{carouselData[carouselIndex].title}</h3>
                        <p className="text-gray-800 mb-6 text-lg leading-relaxed">{carouselData[carouselIndex].description}</p>
                        <div className="flex justify-center gap-3">
                            {carouselData.map((_, idx) => (
                                <span key={idx} className={`inline-block w-3 h-3 rounded-full transition-all ${idx === carouselIndex ? 'bg-blue-600 w-8' : 'bg-blue-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;