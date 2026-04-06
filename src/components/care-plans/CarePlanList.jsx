import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEllipsisH, faUserCircle, faCheckCircle, faCircleXmark, faStethoscope, 
    faMagnifyingGlass, faTh, faList, faClock, faSortAlphaDown, faSortAlphaUpAlt, 
    faArrowUp, faArrowDown, faFolderOpen, faArchive, faBookMedical 
} from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(nombre = {}) {
    const n = nombre.nombre?.[0] || '';
    const ap = nombre.apellidoPaterno?.[0] || '';
    return (ap + n).toUpperCase() || '?';
}

function getNombreCompleto(nombre = {}) {
    return [nombre.apellidoPaterno, nombre.apellidoMaterno, nombre.nombre].filter(Boolean).join(' ');
}

// ── Lógica de Ordenamiento ────────────────────────────────────────────────────
function sortPlans(plans, sort, dir) {
    const arr = [...plans];
    const asc = dir === 'asc';

    switch (sort) {
        case 'nombre':
            return arr.sort((a, b) => {
                const nameA = getNombreCompleto(a.pacienteId?.nombre);
                const nameB = getNombreCompleto(b.pacienteId?.nombre);
                const cmp = nameA.localeCompare(nameB, 'es');
                return asc ? cmp : -cmp;
            });
        case 'diagnostico':
            return arr.sort((a, b) => {
                const diagA = a.nanda?.nombre || '';
                const diagB = b.nanda?.nombre || '';
                const cmp = diagA.localeCompare(diagB, 'es');
                return asc ? cmp : -cmp;
            });
        case 'reciente':
        default:
            return arr.sort((a, b) => {
                const cmp = new Date(b.fecha || 0) - new Date(a.fecha || 0);
                return asc ? cmp : -cmp; 
            });
    }
}

const SORT_OPTIONS = [
    {
        key: 'reciente',
        labelAsc: 'Más antiguos',
        labelDesc: 'Más recientes',
        iconAsc: <FontAwesomeIcon icon={faClock} className="opacity-60" />,
        iconDesc: <FontAwesomeIcon icon={faClock} />,
        tooltip: 'Fecha de creación',
    },
    {
        key: 'nombre',
        labelAsc: 'Paciente A→Z',
        labelDesc: 'Paciente Z→A',
        iconAsc: <FontAwesomeIcon icon={faSortAlphaDown} />,
        iconDesc: <FontAwesomeIcon icon={faSortAlphaUpAlt} />,
        tooltip: 'Ordenar por paciente',
    },
    {
        key: 'diagnostico',
        labelAsc: 'Diagnóstico A→Z',
        labelDesc: 'Diagnóstico Z→A',
        iconAsc: <FontAwesomeIcon icon={faBookMedical} />,
        iconDesc: <FontAwesomeIcon icon={faBookMedical} className="opacity-60" />,
        tooltip: 'Ordenar por NANDA',
    }
];

// ── Sub-componente: Tarjeta (Grid View) ───────────────────────────────────────
function CarePlanCard({ plan, onView, onFinalize }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const paciente = plan.pacienteId || {};
    const nombre = paciente.nombre || {};
    const sexo = paciente.demograficos?.sexo || 'N';
    
    const avatarBg = sexo === 'M' ? 'bg-blue-100 text-blue-600' : sexo === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500';
    const isFinalizado = plan.estado === 'Finalizado';

    return (
        <div onClick={() => onView(plan)}
             className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1
               ${isFinalizado ? 'bg-gray-50 border border-gray-200 opacity-90' : 'bg-gradient-to-t from-[#16a09e]/10 to-white shadow-sm hover:ring-1 hover:ring-[#16a09e]/30 border border-gray-100'}`}>
            
            {/* Menú tres puntos */}
            <div className="absolute top-4 right-4">
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <FontAwesomeIcon icon={faEllipsisH} />
                </button>

                {menuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                        <div onClick={e => e.stopPropagation()} className="absolute right-0 top-8 z-20 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                            <button onClick={() => { setMenuOpen(false); onView(plan); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium">
                                <FontAwesomeIcon icon={faUserCircle} className="text-[#16a09e] text-xs" />
                                Ver plan a detalle
                            </button>
                            {!isFinalizado && (
                                <>
                                    <div className="mx-3 my-1 border-t border-gray-100" />
                                    <button onClick={() => { setMenuOpen(false); onFinalize(plan); }} className="w-full text-left px-4 py-2 text-amber-600 hover:bg-amber-50 flex items-center gap-2 font-medium">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                        Finalizar plan
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Avatar y Paciente */}
            <div className="flex flex-col items-center text-center mb-4 mt-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold ring-4 ring-white shadow-md text-lg ${avatarBg}`}>
                    {getInitials(nombre)}
                </div>
                <h3 className="mt-3 font-semibold text-sm leading-tight text-gray-800">
                    <span className="font-bold block">{[nombre.apellidoPaterno, nombre.apellidoMaterno].filter(Boolean).join(' ')}</span>
                    <span className="block font-normal text-xs mt-0.5 text-gray-500">{nombre.nombre}</span>
                </h3>
            </div>

            <div className="border-t border-gray-100 mb-3" />

            {/* Diagnóstico NANDA */}
            <div className="space-y-1 mb-4 text-center">
                <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-400">Diagnóstico (NANDA)</p>
                <p className="font-bold text-sm text-[#0f3460] line-clamp-2 leading-snug" title={plan.nanda?.nombre}>
                    <FontAwesomeIcon icon={faStethoscope} className="text-[#16a09e] mr-1.5 text-xs" />
                    {plan.nanda?.nombre || 'No especificado'}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400">
                    {new Date(plan.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isFinalizado ? 'bg-gray-200 text-gray-600' : 'bg-[#16a09e]/20 text-[#16a09e]'}`}>
                    <FontAwesomeIcon icon={isFinalizado ? faCircleXmark : faCheckCircle} />
                    {plan.estado}
                </span>
            </div>
        </div>
    );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function CarePlanList({ onViewPlan, showToast, patientId }) {
    // Estados de Datos
    const [allPlans, setAllPlans] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados de Búsqueda y Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Activo'); // 'Activo' o 'Finalizado'
    
    // Estados de Vista y Ordenamiento
    const [view, setView] = useState('grid');
    const [sort, setSort] = useState('reciente');
    const [sortDir, setSortDir] = useState('desc');
    
    // Estados de Paginación y Modal
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // 10, 20 o 50
    const [confirmFinalize, setConfirmFinalize] = useState(null); // 🟢 Estado para el Modal

    useEffect(() => {
        const fetchCarePlans = async () => {
            setIsLoading(true);
            try {
                const endpoint = patientId
                    ? `/api/careplans/patient/${patientId}`
                    : `/api/careplans`;
                const { data } = await api.get(endpoint);
                setAllPlans(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCarePlans();
    }, [patientId]);

    // 🟢 Abrir modal
    const handleFinalizeRequest = (plan) => {
        setConfirmFinalize(plan);
    };

    // executeFinalizePlan
    const executeFinalizePlan = async () => {
        if (!confirmFinalize) return;
        const planId = confirmFinalize._id;
        try {
            await api.put(`/api/careplans/${planId}`, { estado: 'Finalizado' });
            setAllPlans(prev => prev.map(plan =>
                plan._id === planId ? { ...plan, estado: 'Finalizado' } : plan
            ));
            showToast("Plan finalizado correctamente.", "success");
        } catch {
            showToast("Hubo un error al finalizar el plan.", "error");
        } finally {
            setConfirmFinalize(null);
        }
    }

    // Filtrado
    const filteredPlans = useMemo(() => {
        return allPlans.filter(plan => {
            const esActivo = plan.estado !== 'Finalizado';
            const coincideEstado = filterStatus === 'Activo' ? esActivo : !esActivo;
            
            const textoBusqueda = searchTerm.toLowerCase();
            const nombrePaciente = getNombreCompleto(plan.pacienteId?.nombre).toLowerCase();
            const nombreNanda = plan.nanda?.nombre?.toLowerCase() || '';
            
            const coincideBusqueda = nombrePaciente.includes(textoBusqueda) || nombreNanda.includes(textoBusqueda);
            return coincideEstado && coincideBusqueda;
        });
    }, [allPlans, searchTerm, filterStatus]);

    // Ordenamiento
    const sortedPlans = useMemo(() => {
        return sortPlans(filteredPlans, sort, sortDir);
    }, [filteredPlans, sort, sortDir]);

    // Paginación
    const totalPages = Math.max(1, Math.ceil(sortedPlans.length / pageSize));
    const currentPlans = sortedPlans.slice((page - 1) * pageSize, page * pageSize);

    const handleSortClick = (key) => {
        if (sort === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(key);
            setSortDir('desc');
        }
        setPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a09e]"></div>
            </div>
        );
    }

    return (
        <div>
            {/* ── Toolbar Superior (Buscador, Filtros, Orden, Vista) ── */}
            <div className="flex flex-col gap-3 mb-6">
                
                {/* FILA 1: Buscador */}
                {!patientId && (
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            placeholder="Buscar por paciente o diagnóstico NANDA..."
                            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); setPage(1); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs">
                                ✕
                            </button>
                        )}
                    </div>
                )}

                {/* FILA 2: Controles de Ordenamiento y Vista */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    
                    {/* Switch: Activos / Finalizados */}
                    <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
                        <button 
                            onClick={() => { setFilterStatus('Activo'); setPage(1); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'Activo' ? 'bg-white text-[#16a09e] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FontAwesomeIcon icon={faFolderOpen} />
                            <span className="hidden sm:inline">Activos</span>
                        </button>
                        <button 
                            onClick={() => { setFilterStatus('Finalizado'); setPage(1); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'Finalizado' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FontAwesomeIcon icon={faArchive} />
                            <span className="hidden sm:inline">Historial</span>
                        </button>
                    </div>

                    {/* Botones de Ordenamiento */}
                    <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
                        <div className="flex flex-wrap gap-1.5">
                            {SORT_OPTIONS.map(({ key, labelAsc, labelDesc, iconAsc, iconDesc, tooltip }) => {
                                const isActive = sort === key;
                                const isDesc   = isActive && sortDir === 'desc';
                                return (
                                    <button
                                        key={key} onClick={() => handleSortClick(key)} title={tooltip}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all select-none
                                            ${isActive ? 'bg-[#16a09e] text-white border-[#16a09e] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-[#16a09e]/40 hover:text-[#16a09e]'}`}>
                                        <span className="text-sm leading-none">{isDesc ? iconDesc : iconAsc}</span>
                                        <span className="hidden sm:inline">{isDesc ? labelDesc : labelAsc}</span>
                                        {isActive && <span className="hidden sm:inline text-[10px] opacity-80 leading-none"><FontAwesomeIcon icon={isDesc ? faArrowDown : faArrowUp} /></span>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>

                        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
                            {[['grid', faTh], ['list', faList]].map(([v, icon]) => (
                                <button key={v} onClick={() => { setView(v); setPage(1); }}
                                        className={`p-1.5 rounded-md transition-colors ${view === v ? 'bg-white shadow-sm text-[#16a09e]' : 'text-gray-400 hover:text-gray-600'}`}>
                                    <FontAwesomeIcon icon={icon} size="sm" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Resultados ── */}
            {sortedPlans.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 font-bold text-lg">No se encontraron planes de cuidado.</p>
                    <p className="text-sm text-gray-400 mt-1">Intente con otro término o cambie de filtros.</p>
                </div>
            ) : (
                <>
                    {/* VISTA GRID (Tarjetas) */}
                    {view === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {currentPlans.map(plan => (
                                <CarePlanCard key={plan._id} plan={plan} onView={onViewPlan} onFinalize={handleFinalizeRequest} />
                            ))}
                        </div>
                    )}

                    {/* VISTA LISTA */}
                    {view === 'list' && (
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <div className="min-w-[700px] bg-white divide-y divide-gray-100">
                                <div className="px-6 py-3 grid grid-cols-[2fr_1fr_3fr_1fr_auto] gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50">
                                    <span>Paciente</span>
                                    <span>Creación</span>
                                    <span>Diagnóstico NANDA</span>
                                    <span>Estado</span>
                                    <span className="w-8"></span>
                                </div>
                                {currentPlans.map(plan => {
                                    const nombre = plan.pacienteId?.nombre || {};
                                    const sexo = plan.pacienteId?.demograficos?.sexo || 'N';
                                    const avatarBg = sexo === 'M' ? 'bg-blue-100 text-blue-600' : sexo === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500';
                                    const isFinalizado = plan.estado === 'Finalizado';

                                    return (
                                        <div key={plan._id} onClick={() => onViewPlan(plan)}
                                             className={`px-6 py-4 text-sm grid grid-cols-[2fr_1fr_3fr_1fr_auto] gap-4 items-center cursor-pointer transition-colors ${isFinalizado ? 'hover:bg-gray-50 bg-gray-50/50' : 'hover:bg-[#16a09e]/5'}`}>
                                            <span className="flex items-center gap-3 font-medium text-gray-800 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarBg}`}>{getInitials(nombre)}</div>
                                                <span className="min-w-0">
                                                    <span className="font-bold block truncate">{[nombre.apellidoPaterno, nombre.apellidoMaterno, nombre.nombre].filter(Boolean).join(' ')}</span>
                                                </span>
                                            </span>
                                            <span className="text-gray-500 text-xs font-semibold">{new Date(plan.fecha).toLocaleDateString('es-MX')}</span>
                                            <span className="text-[#0f3460] font-semibold truncate"><FontAwesomeIcon icon={faStethoscope} className="text-[#16a09e] mr-2 text-xs" />{plan.nanda?.nombre || '—'}</span>
                                            <span>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isFinalizado ? 'bg-gray-200 text-gray-600' : 'bg-[#16a09e]/20 text-[#16a09e]'}`}>
                                                    {plan.estado}
                                                </span>
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); isFinalizado ? onViewPlan(plan) : handleFinalizeRequest(plan); }} title={isFinalizado ? 'Ver plan' : 'Finalizar plan'}
                                                    className={`p-2 rounded-lg transition-colors ${isFinalizado ? 'text-gray-400 hover:bg-gray-200' : 'text-amber-500 hover:bg-amber-100'}`}>
                                                <FontAwesomeIcon icon={isFinalizado ? faUserCircle : faCheckCircle} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Paginación Inferior ── */}
                    <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span>Mostrar</span>
                            {[10, 20, 50].map(n => (
                                <button key={n} onClick={() => { setPageSize(n); setPage(1); }}
                                    className={`w-9 h-7 rounded-md border text-xs font-bold transition-all ${pageSize === n ? 'bg-[#16a09e] text-white border-[#16a09e]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#16a09e]/40 hover:text-[#16a09e]'}`}>
                                    {n}
                                </button>
                            ))}
                            <span>por página</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:border-[#16a09e]/40 hover:text-[#16a09e] disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white">
                                ← Anterior
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                .reduce((acc, n, idx, arr) => {
                                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                                    acc.push(n);
                                    return acc;
                                }, [])
                                .map((item, idx) => item === '…' 
                                    ? <span key={`gap-${idx}`} className="px-1 text-gray-300 text-xs">…</span>
                                    : <button key={item} onClick={() => setPage(item)} className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${page === item ? 'bg-[#16a09e] text-white border-[#16a09e] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-[#16a09e]/40 hover:text-[#16a09e]'}`}>
                                        {item}
                                      </button>
                                )
                            }

                            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:border-[#16a09e]/40 hover:text-[#16a09e] disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white">
                                Siguiente →
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 🟢 Modal de Confirmación de Finalización */}
            {confirmFinalize && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 animate-fade-in"
                     onClick={() => setConfirmFinalize(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4 transform scale-100"
                         onClick={e => e.stopPropagation()}>
                        <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-amber-500" />
                            ¿Finalizar plan?
                        </h3>
                        <p className="text-sm text-gray-500 mb-5 leading-snug">
                            El plan del paciente <span className="font-bold text-gray-700">{getNombreCompleto(confirmFinalize.pacienteId?.nombre)}</span> pasará al historial y no podrá recibir más evaluaciones.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmFinalize(null)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={executeFinalizePlan}
                                className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 active:scale-95 transition-all shadow-md">
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}