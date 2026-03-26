import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '@/assets/logo.png';

export default function RegisterView() {
    const navigate = useNavigate();
    
    // 1. ESTADO DEL FORMULARIO (Payload Completo)
    const [formData, setFormData] = useState({
        nombre: '', apellido_paterno: '', apellido_materno: '', 
        cedula_profesional: '', curp_dni: '',
        telefono: '', calle: '', ciudad: '', estado: '',
        grado_academico: 'Licenciatura en Enfermería', 
        institucion_egreso: 'Universidad de Guadalajara',
        unidad_hospitalaria: '', area_asignada: '', turno: '',
        correo_electronico: '', password: ''
    });
    
    // 2. ESTADOS DE CONTROL (Carga y Notificación)
    const [loading, setLoading] = useState(false);
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Envío del paquete al Backend
            await axios.post(`${import.meta.env.VITE_API_URL}/api/enfermero/registro`, formData);
            
            // Notificación de éxito
            setNotificacion({ mostrar: true, mensaje: '¡Registro exitoso! Redirigiendo...', tipo: 'exito' });
            
            // Redirección tras 2 segundos
            setTimeout(() => navigate('/'), 2500);

        } catch (err) {
            const msg = err.response?.data?.error || 'Error de conexión con el servidor.';
            setNotificacion({ mostrar: true, mensaje: msg, tipo: 'error' });
            
            // Ocultar error automáticamente tras 5 segundos
            setTimeout(() => setNotificacion({ ...notificacion, mostrar: false }), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100 relative">
            
            {/* --- NOTIFICACIÓN FLOTANTE (Sin librerías) --- */}
            {notificacion.mostrar && (
                <div className={`fixed top-10 right-10 z-[100] p-5 rounded-2xl shadow-2xl flex items-center gap-4 border-l-8 transform transition-all duration-500 animate-bounce ${
                    notificacion.tipo === 'exito' ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'
                }`}>
                    <span className="text-2xl">{notificacion.tipo === 'exito' ? '✅' : '⚠️'}</span>
                    <div>
                        <p className="font-black text-sm uppercase tracking-tighter">Sistema 3N</p>
                        <p className="text-xs opacity-90">{notificacion.mensaje}</p>
                    </div>
                </div>
            )}

            {/* LADO IZQUIERDO: FORMULARIO */}
            <div className="w-full lg:w-3/5 h-screen overflow-y-auto bg-white px-8 md:px-20 py-12 shadow-inner">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-3xl font-black tracking-tight"><span className="text-blue-600">3N</span> REGISTRO</h1>
                        <img src={logo} alt="Logo" className="h-14 w-14 rounded-full border-2 border-blue-500 p-1 shadow-md" />
                    </div>

                    <form onSubmit={handleRegister} className="space-y-8 pb-20">
                        
                        {/* SECCIÓN 1: IDENTIDAD */}
                        <div className="space-y-4">
                            <h3 className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] border-b border-gray-100 pb-2">1. Identidad Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Nombre(s)</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Ap. Paterno</label>
                                    <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Ap. Materno</label>
                                    <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">CURP</label>
                                    <input type="text" name="curp_dni" value={formData.curp_dni} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase" required />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: PROFESIONAL */}
                        <div className="space-y-4">
                            <h3 className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] border-b border-gray-100 pb-2">2. Perfil y Trabajo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Cédula Profesional</label>
                                    <input type="text" name="cedula_profesional" value={formData.cedula_profesional} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Unidad Hospitalaria</label>
                                    <input type="text" name="unidad_hospitalaria" value={formData.unidad_hospitalaria} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Área Asignada</label>
                                    <input 
                                        type="text" 
                                        name="area_asignada" 
                                        placeholder="UCI, Urgencias..." 
                                        value={formData.area_asignada} 
                                        onChange={handleChange} 
                                        className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Turno</label>
                                    <select name="turno" value={formData.turno} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="Matutino">Matutino</option>
                                        <option value="Vespertino">Vespertino</option>
                                        <option value="Nocturno">Nocturno</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 3: UBICACIÓN */}
                        <div className="space-y-4">
                            <h3 className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] border-b border-gray-100 pb-2">3. Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Teléfono</label>
                                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Ciudad</label>
                                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase">Calle y Número</label>
                                    <input type="text" name="calle" value={formData.calle} onChange={handleChange} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 4: CREDENCIALES */}
                        <div className="p-8 bg-black rounded-[2rem] space-y-5">
                            <h3 className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] border-b border-white/10 pb-2">4. Acceso al Sistema</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Email Institucional</label>
                                    <input type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} className="w-full p-3 bg-white/5 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 bg-white/5 text-white border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 flex flex-col md:flex-row gap-5">
                            <button type="submit" disabled={loading} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-gray-300">
                                {loading ? 'PROCESANDO...' : 'CONFIRMAR REGISTRO'}
                            </button>
                            <Link to="/" className="flex-1 py-5 border-2 border-gray-100 text-center text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all">
                                CANCELAR
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* LADO DERECHO: IMAGEN */}
            <div className="hidden lg:block lg:w-2/5 relative">
                <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" alt="Nurse" className="absolute inset-0 object-cover h-full w-full" />
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm flex items-end p-16">
                    <div className="text-white space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Guadalajara, Jalisco</p>
                        <h2 className="text-6xl font-black leading-[0.9]">Cuidado<br/>Digital.</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}