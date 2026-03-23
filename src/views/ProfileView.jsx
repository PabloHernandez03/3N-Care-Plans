import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function ProfileView() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        cuenta: { id_interno: '', correo_electronico: '', rol: '', estado_cuenta: '' },
        identidad: { nombre: '', apellido_paterno: '', apellido_materno: '' },
        contacto: { telefono: '' },
        perfil_profesional: { grado_academico: '', especialidades: [], institucion_egreso: '' },
        datos_laborales: { unidad_hospitalaria: '', area_asignada: '', turno: '', fecha_ingreso: '', esta_activo: false }
    });

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(prevUser => ({
                ...prevUser,
                cuenta: { ...prevUser.cuenta, ...(userData.cuenta || {}) },
                identidad: { ...prevUser.identidad, ...(userData.identidad || {}) },
                contacto: { ...prevUser.contacto, ...(userData.contacto || {}) },
                perfil_profesional: { ...prevUser.perfil_profesional, ...(userData.perfil_profesional || {}) },
                datos_laborales: { ...prevUser.datos_laborales, ...(userData.datos_laborales || {}) }
            }));
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
        navigate('/'); // Redirige a la vista de login
    };

    return (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500 gap-4 text-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {user.identidad.nombre} {user.identidad.apellido_paterno} {user.identidad.apellido_materno}
                    </h1>
                    <p className="text-gray-500 capitalize mt-1 font-medium">
                        {user.cuenta.rol} {user.datos_laborales.area_asignada ? `| ${user.datos_laborales.area_asignada}` : ''}
                    </p>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                    <span className="bg-blue-50 text-blue-700 px-6 py-2 rounded-full font-bold text-lg border border-blue-200 shadow-sm whitespace-nowrap">
                        ID: {user.cuenta.id_interno || 'N/A'}
                    </span>
                    <span className={`px-6 py-2 rounded-full text-lg font-bold capitalize shadow-sm border whitespace-nowrap ${user.cuenta.estado_cuenta === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {user.cuenta.estado_cuenta}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-bold mb-6 text-blue-700 border-b-2 border-gray-100 pb-3">Información de Contacto</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
                            <p className="font-semibold text-gray-800 text-xl break-words">{user.cuenta.correo_electronico}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Teléfono</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.contacto.telefono || 'No registrado'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-bold mb-6 text-blue-700 border-b-2 border-gray-100 pb-3">Perfil Profesional</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Grado Académico</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.perfil_profesional.grado_academico || 'No registrado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Institución de Egreso</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.perfil_profesional.institucion_egreso || 'No registrado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Especialidades</label>
                            <div className="flex flex-wrap gap-3">
                                {user.perfil_profesional.especialidades?.length > 0 ? (
                                    user.perfil_profesional.especialidades.map((esp, idx) => (
                                        <span key={idx} className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-base font-medium border border-gray-200 shadow-sm">
                                            {esp}
                                        </span>
                                    ))
                                ) : (
                                    <p className="font-semibold text-gray-800 text-xl">Ninguna</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 text-blue-700 border-b-2 border-gray-100 pb-3">Datos Laborales</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Unidad Hospitalaria</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.datos_laborales.unidad_hospitalaria || 'No registrado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Área Asignada</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.datos_laborales.area_asignada || 'No asignada'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Turno</label>
                            <p className="font-semibold text-gray-800 text-xl">{user.datos_laborales.turno || 'No asignado'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha de Ingreso</label>
                            <p className="font-semibold text-gray-800 text-xl">
                                {user.datos_laborales.fecha_ingreso 
                                    ? new Date(user.datos_laborales.fecha_ingreso).toLocaleDateString() 
                                    : 'No registrada'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Estatus en Plantilla</label>
                            <p className={`inline-block px-4 py-1.5 rounded-lg text-base font-bold mt-1 shadow-sm border ${user.datos_laborales.esta_activo ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {user.datos_laborales.esta_activo ? 'Activo' : 'Inactivo'}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-lg transition-all hover:bg-red-600 hover:text-white hover:border-red-600 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>

        </div>
    );
}