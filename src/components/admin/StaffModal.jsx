import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faUserShield, faBan, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';

export default function StaffModal({ isOpen, onClose, staffData, onSaveSuccess, showToast }) {
    const isEdit = Boolean(staffData);

    const [formData, setFormData] = useState({
        nombre: '', apellido_paterno: '', apellido_materno: '', cedula_profesional: '',
        email: '', password: '', rol: 'enfermero',
        area_asignada: '', turno: 'Matutino', estado_cuenta: 'activo'
    });
    const [loading, setLoading] = useState(false);

    // Cargar datos si estamos en modo edición
    useEffect(() => {
        if (staffData && isOpen) {
            setFormData({
                nombre: staffData.identidad?.nombre || '',
                apellido_paterno: staffData.identidad?.apellido_paterno || '',
                apellido_materno: staffData.identidad?.apellido_materno || '',
                cedula_profesional: staffData.identidad?.cedula_profesional || '',
                email: staffData.cuenta?.correo_electronico || '',
                password: '', // La contraseña no se trae por seguridad
                rol: staffData.cuenta?.rol || 'enfermero',
                area_asignada: staffData.datos_laborales?.area_asignada || '',
                turno: staffData.datos_laborales?.turno || 'Matutino',
                estado_cuenta: staffData.cuenta?.estado_cuenta || 'activo'
            });
        } else {
            // Resetear si es Alta nueva
            setFormData({
                nombre: '', apellido_paterno: '', apellido_materno: '', cedula_profesional: '',
                email: '', password: '', rol: 'enfermero', area_asignada: '', turno: 'Matutino', estado_cuenta: 'activo'
            });
        }
    }, [staffData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Estructuramos los datos como los espera tu backend MERN
        const payload = {
            identidad: {
                nombre: formData.nombre,
                apellido_paterno: formData.apellido_paterno,
                apellido_materno: formData.apellido_materno,
                cedula_profesional: formData.cedula_profesional
            },
            cuenta: {
                correo_electronico: formData.correo_electronico,
                rol: formData.rol,
                estado_cuenta: formData.estado_cuenta
            },
            datos_laborales: {
                area_asignada: formData.area_asignada,
                turno: formData.turno
            }
        };

        if (formData.password) {
            payload.cuenta.password = formData.password;
        }

        try {
            if (isEdit) {
                // Asegúrate de que esta ruta exista en tu backend para actualizar
                await api.put(`/api/admin/staff/${staffData._id}`, payload);
                if(showToast) showToast('Personal actualizado correctamente', 'success');
            } else {
                // Ruta para crear nuevo personal
                await api.post(`/api/admin/staff`, payload);
                if(showToast) showToast('Personal registrado exitosamente', 'success');
            }
            onSaveSuccess(); // Refresca la tabla del dashboard
            onClose();
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al procesar la solicitud';
            if(showToast) showToast(msg, 'error');
            else alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async () => {
        const nuevoEstado = formData.estado_cuenta === 'activo' ? 'inactivo' : 'activo';
        setFormData(prev => ({ ...prev, estado_cuenta: nuevoEstado }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header del Modal */}
                <div className="bg-[#0f3460] px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserShield} />
                        {isEdit ? 'Gestionar Personal' : 'Alta de Nuevo Personal'}
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Cuerpo del formulario scrollable */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* SECCIÓN: Datos Personales */}
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <p className="text-xs font-bold text-[#16a09e] uppercase tracking-wider border-b pb-2">Datos Personales</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre(s) *</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 focus:border-[#16a09e] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Apellido Paterno *</label>
                                    <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 focus:border-[#16a09e] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Apellido Materno</label>
                                    <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 focus:border-[#16a09e] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cédula Profesional</label>
                                    <input type="text" name="cedula_profesional" value={formData.cedula_profesional} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 focus:border-[#16a09e] outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN: Cuenta y Laboral */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <p className="text-xs font-bold text-[#16a09e] uppercase tracking-wider border-b pb-2">Credenciales</p>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        {isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal *'}
                                    </label>
                                    <input type="text" name="password" value={formData.password} onChange={handleChange} required={!isEdit} minLength={6} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 outline-none" placeholder={isEdit ? "Dejar en blanco para no cambiar" : "Ej: Temp1234"} />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <p className="text-xs font-bold text-[#16a09e] uppercase tracking-wider border-b pb-2">Asignación Laboral</p>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rol en el Sistema *</label>
                                    <select name="rol" value={formData.rol} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#16a09e]/30 outline-none bg-white">
                                        <option value="enfermero">Enfermero(a) Operativo</option>
                                        <option value="jefe">Jefe(a) de Enfermería</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Área / Piso</label>
                                        <input type="text" name="area_asignada" value={formData.area_asignada} onChange={handleChange} placeholder="Ej: Piso 3" className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Turno</label>
                                        <select name="turno" value={formData.turno} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-200 text-sm outline-none bg-white">
                                            <option value="Matutino">Matutino</option>
                                            <option value="Vespertino">Vespertino</option>
                                            <option value="Nocturno">Nocturno</option>
                                            <option value="Jornada Acumulada">Jornada Acumulada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer del Modal */}
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        {isEdit && (
                            <button type="button" onClick={toggleEstado} className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${formData.estado_cuenta === 'activo' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                <FontAwesomeIcon icon={formData.estado_cuenta === 'activo' ? faBan : faCheckCircle} />
                                {formData.estado_cuenta === 'activo' ? 'Dar de Baja (Inactivar)' : 'Reactivar Cuenta'}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" form="staff-form" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#16a09e] text-white font-bold text-sm hover:bg-[#128a88] shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                            <FontAwesomeIcon icon={faSave} />
                            {loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Registrar Personal')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}