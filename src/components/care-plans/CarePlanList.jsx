import React, { useState, useEffect } from 'react';
import Button from '@/components/shared/Button';

export default function CarePlanList({ patientId }) {
    // ESTADOS PRINCIPALES
    const [allPlans, setAllPlans] = useState([]); // Guardamos TODOS los planes aquí
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPlanId, setExpandedPlanId] = useState(null);
    
    // ESTADOS DE FILTRO Y BÚSQUEDA
    const [filterStatus, setFilterStatus] = useState('Activo'); // 'Activo' o 'Finalizado'
    const [searchTerm, setSearchTerm] = useState('');
    
    // ESTADOS DEL MODAL
    const [modalNic, setModalNic] = useState(null); 
    const [nicActivities, setNicActivities] = useState({}); 
    const [nocNames, setNocNames] = useState({}); 
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    useEffect(() => {
        const fetchCarePlans = async () => {
            setIsLoading(true);
            try {
                const endpoint = patientId 
                    ? `http://localhost:5000/api/careplans/patient/${patientId}` 
                    : `http://localhost:5000/api/careplans`;
                    
                const response = await fetch(endpoint);
                
                if (response.ok) {
                    const data = await response.json();
                    setAllPlans(data); // Ahora guardamos TODOS, sin filtrar aún

                    // Buscar nombres de los NOCs
                    const codigosNoc = [...new Set(data.flatMap(p => p.nocsEvaluados?.map(n => n.codigo) || []))];
                    codigosNoc.forEach(fetchNocName);
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCarePlans();
    }, [patientId]);

    const fetchNocName = async (codigo) => {
        if (nocNames[codigo]) return; 
        try {
            const res = await fetch(`http://localhost:5000/api/noc/${codigo}`);
            if (res.ok) {
                const data = await res.json();
                setNocNames(prev => ({ ...prev, [codigo]: data.nombre }));
            }
        } catch (error) {
            console.error(`Error obteniendo NOC ${codigo}:`, error);
        }
    };

    const handleFinalizePlan = async (planId, e) => {
        e.stopPropagation(); 
        
        const confirmar = window.confirm("¿Está seguro de que desea finalizar este plan de cuidado? Pasará al historial de finalizados.");
        if (!confirmar) return;

        try {
            const response = await fetch(`http://localhost:5000/api/careplans/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Finalizado' })
            });

            if (response.ok) {
                // Actualizamos el plan localmente para que se mueva a la pestaña de "Finalizados"
                setAllPlans(prev => prev.map(plan => 
                    plan._id === planId ? { ...plan, estado: 'Finalizado' } : plan
                ));
                setExpandedPlanId(null);
            } else {
                alert("Hubo un error al finalizar el plan.");
            }
        } catch (error) {
            console.error("Error al finalizar:", error);
        }
    };

    const toggleExpandPlan = (id) => {
        setExpandedPlanId(expandedPlanId === id ? null : id);
    };

    const openNicModal = async (nic) => {
        setModalNic(nic); 
        if (nicActivities[nic.codigo]) return; 

        setIsLoadingModal(true);
        try {
            const response = await fetch(`http://localhost:5000/api/nic/${nic.codigo}`);
            if (response.ok) {
                const data = await response.json();
                setNicActivities(prev => ({ ...prev, [nic.codigo]: data.actividades || [] }));
            }
        } catch (error) {
            console.error("Error al obtener actividades del NIC:", error);
        } finally {
            setIsLoadingModal(false);
        }
    };

    const closeModal = () => setModalNic(null);

    const formatearFecha = (fechaIso) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(fechaIso).toLocaleDateString('es-MX', opciones);
    };

    // 🟢 LÓGICA DE FILTRADO (Estado + Buscador)
    const filteredPlans = allPlans.filter(plan => {
        // 1. Filtrar por estado
        const esActivo = plan.estado !== 'Finalizado';
        const coincideEstado = filterStatus === 'Activo' ? esActivo : !esActivo;
        
        // 2. Filtrar por búsqueda (nombre del paciente o nombre del NANDA)
        const textoBusqueda = searchTerm.toLowerCase();
        const nombrePaciente = [
            plan.pacienteId?.nombre?.apellidoPaterno,
            plan.pacienteId?.nombre?.apellidoMaterno,
            plan.pacienteId?.nombre?.nombre
        ].filter(Boolean).join(' ').toLowerCase();
        const nombreNanda = plan.nanda?.nombre?.toLowerCase() || '';
        
        const coincideBusqueda = nombrePaciente.includes(textoBusqueda) || nombreNanda.includes(textoBusqueda);

        return coincideEstado && coincideBusqueda;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600 font-medium">Cargando expediente clínico...</span>
            </div>
        );
    }

    return (
        <div className="space-y-5 relative">
            
            {/* 🟢 BARRA DE CONTROLES (Pestañas y Buscador) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                {/* Pestañas Activo / Finalizado */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => { setFilterStatus('Activo'); setExpandedPlanId(null); }}
                        className={`flex-1 px-6 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'Activo' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Planes Activos
                    </button>
                    <button 
                        onClick={() => { setFilterStatus('Finalizado'); setExpandedPlanId(null); }}
                        className={`flex-1 px-6 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === 'Finalizado' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Finalizados
                    </button>
                </div>

                {/* Buscador de pacientes (Solo se muestra si no estamos en la vista de un solo paciente) */}
                {!patientId && (
                    <div className="w-full md:w-72 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar por paciente o diagnóstico..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
                        />
                    </div>
                )}
            </div>

            {/* MENSAJE SI NO HAY RESULTADOS */}
            {filteredPlans.length === 0 && (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p className="text-gray-500 font-medium text-lg">No se encontraron planes de cuidado.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        {searchTerm ? 'Intente con otro término de búsqueda.' : `No hay planes marcados como "${filterStatus}".`}
                    </p>
                </div>
            )}

            {/* 🟢 LISTADO DE PLANES FILTRADOS */}
            {filteredPlans.map((plan) => (
                <div key={plan._id} className={`border rounded-xl shadow-sm bg-white overflow-hidden transition-all ${filterStatus === 'Finalizado' ? 'border-gray-300 opacity-90' : 'border-blue-100'}`}>
                    
                    {/* ENCABEZADO DEL PLAN */}
                    <div className={`p-5 ${filterStatus === 'Activo' ? 'bg-gradient-to-b md:bg-gradient-to-r from-primario/10 to-white' : 'bg-gray-50'}`}>
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${filterStatus === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {filterStatus === 'Activo' ? 'Plan Activo' : 'Plan Finalizado'}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">{formatearFecha(plan.fecha)}</span>
                                </div>
                                
                                <h4 className={`text-xl font-bold mb-3 ${filterStatus === 'Activo' ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {plan.nanda?.nombre || 'Diagnóstico no especificado'}
                                </h4>
                                
                                {/* DETALLES DEL PACIENTE */}
                                {!patientId && plan.pacienteId && (
                                    <div className="flex-wrap items-center gap-4 text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm inline-flex">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-500">Paciente:</span>
                                            <span className="font-bold text-gray-800">{[plan.pacienteId?.nombre?.apellidoPaterno,
                                                plan.pacienteId?.nombre?.apellidoMaterno].filter(Boolean).join(' ')}
                                                {', '}
                                                {plan.pacienteId?.nombre?.nombre}
                                            </span>
                                        </div>
                                        {plan.ingresoId?.ingreso?.servicio && (
                                            <>
                                                <div className="w-px h-4 bg-gray-300 hidden md:block"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500">Ubicación:</span>
                                                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                                        {plan.ingresoId.ingreso.servicio}
                                                        {plan.ingresoId.ingreso.cama && ` / ${plan.ingresoId.ingreso.cama}`}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 shrink-0 min-w-[180px]">
                                <Button 
                                    type="button" 
                                    onClick={() => toggleExpandPlan(plan._id)}
                                    variant={filterStatus === 'Finalizado' ? 'secondary' : 'primary'}
                                    className="w-full justify-center"
                                >
                                    {expandedPlanId === plan._id ? 'Ocultar detalles' : 'Ver detalles del plan'}
                                </Button>
                                
                                {/* EL BOTÓN FINALIZAR SOLO APARECE SI EL PLAN ESTÁ ACTIVO */}
                                {filterStatus === 'Activo' && (
                                    <button 
                                        onClick={(e) => handleFinalizePlan(plan._id, e)}
                                        className="w-full text-center px-4 py-2 text-md font-medium text-white bg-secundario border border-transparent rounded-full shadow-sm hover:bg-secundario/80 focus:outline-none transition-colors"
                                    >
                                        Finalizar plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* INTERIOR DEL PLAN EXPANDIDO */}
                    {expandedPlanId === plan._id && (
                        <div className="p-6 border-t border-gray-100 animate-fade-in bg-gray-50/50">
                            
                            {/* SECCIÓN NOC */}
                            <div className="mb-8">
                                <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${filterStatus === 'Activo' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                    Resultados Esperados Evaluados
                                </h5>
                                {plan.nocsEvaluados && plan.nocsEvaluados.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {plan.nocsEvaluados.map((noc, index) => {
                                            const esGrave = noc.promedio >= 4;
                                            const esModerado = noc.promedio >= 3 && noc.promedio < 4;
                                            
                                            // Colores más apagados si el plan está finalizado
                                            const colorClass = filterStatus === 'Finalizado' 
                                                ? 'bg-gray-100 text-gray-600 border-gray-200' 
                                                : esGrave ? 'bg-red-100 text-red-700 border-red-200' 
                                                : esModerado ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                                                : 'bg-green-100 text-green-700 border-green-200';
                                            
                                            const textoGravedad = esGrave ? 'Gravedad Alta' : 
                                                                  esModerado ? 'Gravedad Moderada' : 
                                                                  'Gravedad Baja';

                                            return (
                                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                                                    <span className={`font-bold mb-3 ${filterStatus === 'Activo' ? 'text-gray-800' : 'text-gray-600'}`}>
                                                        {nocNames[noc.codigo] || `Cargando NOC (${noc.codigo})...`}
                                                    </span>
                                                    
                                                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nivel de Compromiso:</span>
                                                        <span className={`px-3 py-1 rounded border font-bold text-xs ${colorClass}`}>
                                                            {textoGravedad} ({noc.promedio})
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No hay evaluaciones registradas.</p>
                                )}
                            </div>

                            {/* SECCIÓN NIC */}
                            <div>
                                <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${filterStatus === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    Intervenciones a Realizar
                                </h5>
                                {plan.nicsSeleccionados && plan.nicsSeleccionados.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                        {plan.nicsSeleccionados.map((nic, index) => (
                                            <button 
                                                key={index}
                                                onClick={() => openNicModal(nic)}
                                                className={`group px-5 py-3 rounded-lg shadow hover:shadow-md transition-all text-left flex items-center justify-between flex-1 min-w-[250px]
                                                    ${filterStatus === 'Activo' 
                                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                        : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <span className="font-semibold pr-4">{nic.nombre}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors
                                                    ${filterStatus === 'Activo' 
                                                        ? 'text-green-800 bg-green-100 group-hover:bg-white' 
                                                        : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    Ver Actividades
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No hay intervenciones seleccionadas.</p>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            ))}

            {/* MODAL DE ACTIVIDADES NIC (Sin cambios, ya estaba perfecto) */}
            {modalNic && (
                <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
                        
                        <div className={`p-5 flex justify-between items-center text-white shrink-0 ${filterStatus === 'Activo' ? 'bg-green-600' : 'bg-gray-600'}`}>
                            <div>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Intervención de Enfermería</p>
                                <h3 className="text-xl font-bold leading-tight pr-4">{modalNic.nombre}</h3>
                            </div>
                            <button onClick={closeModal} className="text-white hover:bg-black/20 p-2 rounded-full transition-colors font-bold shrink-0">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                            <h4 className="text-gray-800 font-bold mb-3 border-b pb-2">Actividades a ejecutar:</h4>
                            
                            {isLoadingModal && !nicActivities[modalNic.codigo] ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin h-8 w-8 border-b-2 border-gray-400 rounded-full"></div>
                                </div>
                            ) : nicActivities[modalNic.codigo]?.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                                    {nicActivities[modalNic.codigo].map((actividad, idx) => (
                                        <li key={idx} className="leading-snug">{actividad}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center py-8 text-gray-500">No se encontraron actividades.</p>
                            )}
                        </div>

                        <div className="p-4 border-t bg-white flex justify-end shrink-0">
                            <Button onClick={closeModal} variant="secondary">Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}