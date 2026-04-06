import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, faMagnifyingGlass, faStethoscope, faBullseye, faHandHoldingMedical, 
    faChevronDown, faChevronRight, faTimes, faCheck, faHeart, faAppleAlt, faToilet, 
    faWalking, faBrain, faUserFriends, faShieldAlt, faProcedures, faSeedling, faBiohazard, 
    faCogs, faBookMedical 
} from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';

const CarePlanBuilder = ({ patient, onCancel, showToast }) => {
    // ESTADOS
    const [nandasGrouped, setNandasGrouped] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // ACORDEÓN NANDA
    const [expandedDomain, setExpandedDomain] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);

    const [selectedNanda, setSelectedNanda] = useState(null);
    const [nocsSugeridos, setNocsSugeridos] = useState([]);
    const [evaluacionesNoc, setEvaluacionesNoc] = useState({}); 
    const [evaluatingNoc, setEvaluatingNoc] = useState(null); 
    const [currentScores, setCurrentScores] = useState({}); 
    const [nicsBase, setNicsBase] = useState([]); 
    const [nicsCalculados, setNicsCalculados] = useState([]); 
    const [selectedNics, setSelectedNics] = useState([]); 

    const domainIconMap = {
        1: faHeart, 2: faAppleAlt, 3: faToilet, 4: faWalking, 5: faBrain, 
        6: faUserFriends, 7: faCogs, 8: faProcedures, 9: faSeedling, 
        10: faShieldAlt, 11: faBiohazard, 12: faProcedures, 13: faSeedling    
    };

    useEffect(() => {
        const fetchNandas = async () => {
            try {
                const res = await api.get('/api/nanda');
                const data = await res.data;
                const agrupado = data.reduce((acc, curr) => {
                    if (!curr.dominio) return acc;
                    const domId = curr.dominio.codigo;
                    const domName = curr.dominio.nombre;
                    const className = curr.clase ? curr.clase.nombre : "Sin Clase Definida";
                    
                    if (!acc[domId]) {
                        acc[domId] = { nombre: domName, icon: domainIconMap[domId] || faBookMedical, clases: {}, totalDiagnosticos: 0 };
                    }
                    if (!acc[domId].clases[className]) acc[domId].clases[className] = [];
                    
                    acc[domId].clases[className].push(curr);
                    acc[domId].totalDiagnosticos++;
                    return acc;
                }, {});
                setNandasGrouped(agrupado);
            } catch (error) { console.error("Error cargando NANDA:", error); }
        };
        fetchNandas();
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length < 3) return setSearchResults([]);
        setIsSearching(true);
        try {
            const res = await api.get(`/api/nanda/search/${value}`);
            setSearchResults(res.data || []);
            setExpandedDomain(null);
            setExpandedClass(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectNanda = async (nanda) => {
        setSelectedNanda(nanda);
        setSearchTerm('');
        setEvaluacionesNoc({});
        setNicsBase([]);
        setNicsCalculados([]);
        setSelectedNics([]);

        try {
            const res = await api.get(`/api/noc/from-nanda/${nanda.codigo}`);
            setNocsSugeridos(res.data?.noc_sugeridos || []);

            const resMapa = await api.get(`/api/diagnosis/${nanda.codigo}`);
            const mapaData = resMapa.data;
            const codigosNic = mapaData.nic_sugeridos.map(n => n.codigo);

            const resNic = await api.post('/api/nic/list', { codigos: codigosNic });
            const dataNics = resNic.data;

            const nicsEnriquecidos = dataNics.map(nic => {
                const infoMapa = mapaData.nic_sugeridos.find(n => n.codigo === nic.codigo);
                return {
                    ...nic,
                    coincidenciaBase: infoMapa?.coincidencia    || 0,
                    nocs_asociados:   infoMapa?.nocs_asociados  || []
                };
            });
            setNicsBase(nicsEnriquecidos);

        } catch (err) {
            console.error('Error cargando NOC/NIC:', err);
        }
    };

    const handleBackToSearch = () => {
        setSelectedNanda(null); setSearchTerm(""); setNocsSugeridos([]);
        setEvaluacionesNoc({}); setNicsBase([]); setNicsCalculados([]); setSelectedNics([]);
        setExpandedDomain(null); setExpandedClass(null);
    };

    const openEvaluationModal = (noc) => {
        setCurrentScores(evaluacionesNoc[noc.codigo]?.indicadores || {});
        setEvaluatingNoc(noc);
    };

    const handleScoreChange = (indicadorCodigo, score) => {
        setCurrentScores(prev => ({ ...prev, [indicadorCodigo]: score }));
    };

    const handleSaveEvaluation = () => {
        const totalIndicadores = evaluatingNoc.indicadores.length;
        const respondidos = Object.keys(currentScores).length;
        if(respondidos < totalIndicadores) return;

        let suma = 0;
        Object.values(currentScores).forEach(val => suma += val);
        const promedio = parseFloat((suma / totalIndicadores).toFixed(2));

        const nuevasEvaluaciones = {
            ...evaluacionesNoc,
            [evaluatingNoc.codigo]: { promedio, indicadores: currentScores }
        };

        setEvaluacionesNoc(nuevasEvaluaciones);
        setEvaluatingNoc(null);
        recalcularNics(nuevasEvaluaciones);
    };

    const handleDeleteEvaluation = (codigoNoc) => {
        const nuevasEvaluaciones = { ...evaluacionesNoc };
        delete nuevasEvaluaciones[codigoNoc];
        setEvaluacionesNoc(nuevasEvaluaciones);
        if(Object.keys(nuevasEvaluaciones).length === 0) setSelectedNics([]);
        recalcularNics(nuevasEvaluaciones);
    };

    const recalcularNics = (evaluacionesActuales) => {
        if(Object.keys(evaluacionesActuales).length === 0) return setNicsCalculados([]); 

        const palabrasAgudas = ["manejo", "administración", "control", "terapia", "monitorización", "cuidados"];
        const palabrasMantenimiento = ["enseñanza", "fomento", "apoyo", "asesoramiento", "mejora", "educación", "prevención"];

        const nicsDinamicos = nicsBase.map(nic => {
            let scoreDinamico = nic.coincidenciaBase;
            const nombreNic = nic.nombre.toLowerCase();

            Object.entries(evaluacionesActuales).forEach(([codNoc, evalData]) => {
                const relacion = nic.nocs_asociados.find(n => n.codigo_noc === codNoc);
                const afinidad = relacion ? (relacion.afinidad / 100) : 0; 
                const pacienteGrave = evalData.promedio <= 3;

                if (afinidad > 0) {
                    if (pacienteGrave && palabrasAgudas.some(p => nombreNic.includes(p))) {
                        scoreDinamico += (25 * afinidad); 
                    } else if (!pacienteGrave && palabrasMantenimiento.some(p => nombreNic.includes(p))) {
                        scoreDinamico += (25 * afinidad); 
                    } else {
                        scoreDinamico += (10 * afinidad); 
                    }
                }
            });

            return { ...nic, scoreFinal: Math.min(99, scoreDinamico) };
        });

        nicsDinamicos.sort((a,b) => b.scoreFinal - a.scoreFinal);
        setNicsCalculados(nicsDinamicos);
    };

    const toggleNicSelection = (codigoNic) => {
        setSelectedNics(prev => prev.includes(codigoNic) ? prev.filter(c => c !== codigoNic) : [...prev, codigoNic] );
    };

    const handleSaveCarePlan = async () => {
        if (selectedNics.length === 0 || Object.keys(evaluacionesNoc).length === 0) return;

        const idPacienteSeguro = patient?._id || patient?.paciente?._id || patient?.data?._id || patient?.id;
        if (!idPacienteSeguro) { showToast("Error crítico: ID de paciente no encontrado.", "error"); return; }

        const payloadPlan = {
            pacienteId: idPacienteSeguro,
            ingresoId: patient?.ingresoId,
            fecha: new Date().toISOString(),
            nanda: { codigo: selectedNanda.codigo, nombre: selectedNanda.nombre },
            nocsEvaluados: Object.entries(evaluacionesNoc).map(([codigo, data]) => ({
                codigo, promedio: data.promedio, indicadores: data.indicadores
            })),
            nicsSeleccionados: nicsCalculados.filter(n => selectedNics.includes(n.codigo)).map(n => ({
                codigo: n.codigo, nombre: n.nombre
            }))
        };

        try {
            await api.post('/api/careplans', payloadPlan);
            showToast("Plan de Cuidados guardado exitosamente", "success");
            if (onCancel) onCancel();
        } catch (err) {
            showToast(err.response?.data?.error || "Error al guardar el plan", "error");
        }
    };

    // FUNCIONES DE AGRUPACIÓN DINÁMICA (DIVISION EN 3 PARTES)
    const getGroupedNocs = () => {
        const groups = { alta: [], media: [], baja: [] };
        nocsSugeridos.forEach((noc, idx) => {
            const ratio = idx / nocsSugeridos.length;
            if (ratio < 1/3) groups.alta.push(noc);
            else if (ratio < 2/3) groups.media.push(noc);
            else groups.baja.push(noc);
        });
        return groups;
    };

    const getGroupedNics = () => {
        if (nicsCalculados.length === 0) return { estrella: null, alta: [], media: [], baja: [] };
        const estrella = nicsCalculados[0]; // La primera es la principal
        const rest = nicsCalculados.slice(1);
        const groups = { estrella, alta: [], media: [], baja: [] };
        
        rest.forEach((nic, idx) => {
            if (rest.length === 0) return;
            const ratio = idx / rest.length;
            if (ratio < 1/3) groups.alta.push(nic);
            else if (ratio < 2/3) groups.media.push(nic);
            else groups.baja.push(nic);
        });
        return groups;
    };

    const groupedNocs = getGroupedNocs();
    const groupedNics = getGroupedNics();

    const SectionTitle = ({ children, step }) => (
        <div className="flex items-center gap-3 mb-6 mt-2">
            {step && <div className="w-10 h-10 rounded-xl bg-[#16a09e] flex items-center justify-center text-white text-base font-black shrink-0 shadow-sm">{step}</div>}
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0f3460]">
                {children}
            </h2>
            <div className="flex-1 h-px bg-gray-100 ml-3" />
        </div>
    );

    return (
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 font-sans relative">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f3460] tracking-tight">
                        Creador de Plan de Cuidado
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-[#16a09e]" />
                        Paciente: <span className="text-gray-800 font-bold">{patient?.nombre?.nombre || patient?.paciente?.nombre?.nombre || "No especificado"}</span>
                    </p>
                </div>
                <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm w-full md:w-auto">
                    Volver al listado
                </button>
            </div>

            {!selectedNanda ? (
                <div className="animate-fade-in space-y-6">
                    <SectionTitle step="1">Diagnóstico (NANDA)</SectionTitle>

                    {/* Buscador */}
                    <div className="relative mb-6">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#16a09e] text-lg" />
                        <input 
                            type="text" 
                            placeholder="Buscar diagnóstico por nombre, síntoma o código..." 
                            value={searchTerm} 
                            onChange={handleSearch} 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-4 focus:ring-[#16a09e]/10 transition-all placeholder-gray-400"
                        />
                    </div>

                    {searchTerm.length >= 3 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            {searchResults.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {searchResults.map((nanda) => (
                                        <li key={nanda.codigo} className="p-5 hover:bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
                                            <div className="flex-1">
                                                <p className="font-bold text-[#0f3460] text-base">{nanda.nombre} <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider ml-2">#{nanda.codigo}</span></p>
                                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{nanda.definicion}</p>
                                            </div>
                                            <button onClick={() => handleSelectNanda(nanda)} className="px-6 py-3 bg-[#16a09e]/10 text-[#16a09e] font-bold text-sm rounded-xl hover:bg-[#16a09e] hover:text-white transition-all w-full md:w-auto shrink-0">
                                                Elegir Diagnóstico
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (!isSearching && <p className="text-gray-500 text-sm p-8 text-center font-semibold">No se encontraron diagnósticos.</p>)}
                        </div>
                    ) : (
                        /*DOMINIOS Y CLASES*/
                        <div className="flex flex-col gap-4">
                            {Object.entries(nandasGrouped).map(([id, dom]) => {
                                const isExpanded = expandedDomain === id;
                                return (
                                    <div key={id} className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${isExpanded ? 'border-[#16a09e] shadow-md' : 'border-gray-100 hover:border-[#16a09e]/50'}`}>
                                        
                                        <button 
                                            onClick={() => {
                                                setExpandedDomain(isExpanded ? null : id);
                                                setExpandedClass(null);
                                            }} 
                                            className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors shadow-inner ${isExpanded ? 'bg-[#16a09e] text-white' : 'bg-gray-50 text-[#0f3460]'}`}>
                                                    <FontAwesomeIcon icon={dom.icon} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-[#16a09e] uppercase tracking-wider mb-1">Dominio #{id}</p>
                                                    <p className="text-base font-bold text-[#0f3460] leading-snug">{dom.nombre}</p>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">{dom.totalDiagnosticos} opciones disponibles</p>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#16a09e]/10 text-[#16a09e] rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-5 bg-gray-50 border-t border-gray-100">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {Object.keys(dom.clases).map((clase) => {
                                                        const isClassExpanded = expandedClass === clase;
                                                        return (
                                                            <div key={clase} className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${isClassExpanded ? 'border-[#16a09e]/50' : 'border-gray-200'}`}>
                                                                <button 
                                                                    onClick={() => setExpandedClass(isClassExpanded ? null : clase)} 
                                                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <div>
                                                                        <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1 inline-block">Clase</span>
                                                                        <p className="text-sm font-bold text-[#0f3460]">{clase}</p>
                                                                    </div>
                                                                    <FontAwesomeIcon icon={faChevronDown} className={`text-gray-400 text-sm transition-transform ${isClassExpanded ? 'rotate-180 text-[#16a09e]' : ''}`} />
                                                                </button>

                                                                {isClassExpanded && (
                                                                    <ul className="divide-y divide-gray-100 border-t border-gray-100 bg-white">
                                                                        {dom.clases[clase].map((nanda) => (
                                                                            <li key={nanda.codigo} className="p-4 flex flex-col items-start gap-3 hover:bg-gray-50 transition-colors group">
                                                                                <div className="w-full">
                                                                                    <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#16a09e] transition-colors">{nanda.nombre} <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider ml-2">#{nanda.codigo}</span></p>
                                                                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{nanda.definicion}</p>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => handleSelectNanda(nanda)} 
                                                                                    className="w-full px-4 py-2 bg-gray-100 text-[#0f3460] font-bold text-xs rounded-lg group-hover:bg-[#16a09e] group-hover:text-white transition-all shadow-sm"
                                                                                >
                                                                                    Elegir Diagnóstico
                                                                                </button>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    
                    <div className="bg-[#0f3460] p-5 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-4 relative overflow-hidden">
                        <FontAwesomeIcon icon={faStethoscope} className="absolute -right-4 -bottom-4 text-8xl text-white opacity-5" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold text-[#16a09e] uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md">Diagnóstico Seleccionado</span>
                            <h3 className="text-xl md:text-2xl font-bold text-white mt-2 leading-tight">{selectedNanda.nombre}</h3>
                        </div>
                        <button onClick={handleBackToSearch} className="relative z-10 w-full md:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition-all">
                            Cambiar
                        </button>
                    </div>

                    <div>
                        <SectionTitle step="2">Resultados Esperados (NOC)</SectionTitle>
                        <p className="text-sm text-gray-500 mb-5 md:ml-14">Evalúe el estado inicial del paciente. Las metas están ordenadas por prioridad.</p>
                        
                        <div className="md:ml-14 space-y-6">
                            {[
                                { title: "Altamente Recomendado", data: groupedNocs.alta, color: "text-amber-600", bgBadge: "bg-amber-100 text-amber-700" },
                                { title: "Recomendados", data: groupedNocs.media, color: "text-blue-600", bgBadge: "bg-blue-50 text-blue-600" },
                                { title: "Opcionales", data: groupedNocs.baja, color: "text-gray-500", bgBadge: "bg-gray-100 text-gray-600" }
                            ].map((group, groupIdx) => group.data.length > 0 && (
                                <div key={groupIdx}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ml-2 ${group.color}`}>{group.title}</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {group.data.map((noc) => {
                                            const isEvaluated = !!evaluacionesNoc[noc.codigo];
                                            return (
                                                <div key={noc.codigo} className={`p-5 rounded-2xl border transition-all ${isEvaluated ? 'bg-[#16a09e]/5 border-[#16a09e]/30' : 'bg-white border-gray-200'}`}>
                                                    <div className="flex justify-between items-start flex-col md:flex-row gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                <span className="font-bold text-[#0f3460] text-base">{noc.nombre}</span>
                                                                {!isEvaluated && <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${group.bgBadge} uppercase tracking-wider`}>{group.title.split(' ')[0]}</span>}
                                                                {isEvaluated && <span className="text-[10px] font-bold bg-[#16a09e] text-white px-2.5 py-1 rounded-md uppercase tracking-wide">Evaluado (Promedio: {evaluacionesNoc[noc.codigo].promedio})</span>}
                                                            </div>
                                                            <p className="text-sm text-gray-600 leading-relaxed">{noc.definicion}</p>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                                                            {isEvaluated ? (
                                                                <>
                                                                    <button onClick={() => openEvaluationModal(noc)} className="px-5 py-2.5 text-sm font-bold bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto">Editar</button>
                                                                    <button onClick={() => handleDeleteEvaluation(noc.codigo)} className="px-5 py-2.5 text-sm font-bold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors w-full sm:w-auto">Borrar</button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => openEvaluationModal(noc)} className="px-6 py-3 text-sm font-bold bg-[#16a09e] text-white rounded-xl hover:bg-[#128a88] shadow-sm transition-all w-full sm:w-auto">
                                                                    Evaluar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {nicsCalculados.length > 0 && (
                        <div className="animate-fade-in pt-6">
                            <SectionTitle step="3">Intervenciones (NIC)</SectionTitle>
                            <p className="text-sm text-gray-500 mb-6 md:ml-14">
                                Seleccione las intervenciones que ejecutará.
                            </p>
                            
                            <div className="md:ml-14 space-y-6">

                                {groupedNics.estrella && (
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider mb-3 ml-2 text-amber-600">Intervención Principal</h4>
                                        <div 
                                            onClick={() => toggleNicSelection(groupedNics.estrella.codigo)}
                                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group
                                                ${selectedNics.includes(groupedNics.estrella.codigo) 
                                                    ? 'bg-[#16a09e]/5 border-[#16a09e] shadow-md' 
                                                    : 'bg-amber-50/30 border-amber-300 hover:bg-amber-50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2 gap-4">
                                                <span className={`font-bold text-lg ${selectedNics.includes(groupedNics.estrella.codigo) ? 'text-[#0f3460]' : 'text-gray-900'}`}>
                                                    {groupedNics.estrella.nombre}
                                                </span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedNics.includes(groupedNics.estrella.codigo) ? 'border-[#16a09e] bg-[#16a09e]' : 'border-gray-300 bg-white'}`}>
                                                    {selectedNics.includes(groupedNics.estrella.codigo) && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed pr-8">{groupedNics.estrella.definicion}</p>
                                        </div>
                                    </div>
                                )}

                                {[
                                    { title: "Altamente Recomendadas", data: groupedNics.alta },
                                    { title: "Recomendadas", data: groupedNics.media },
                                    { title: "Opcionales", data: groupedNics.baja }
                                ].map((group, groupIdx) => group.data.length > 0 && (
                                    <div key={groupIdx}>
                                        <h4 className="text-xs font-black uppercase tracking-wider mb-3 ml-2 text-gray-500">{group.title}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {group.data.map((nic) => {
                                                const isSelected = selectedNics.includes(nic.codigo); 
                                                return (
                                                    <div 
                                                        key={nic.codigo} 
                                                        onClick={() => toggleNicSelection(nic.codigo)}
                                                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                                                            ${isSelected 
                                                                ? 'bg-[#16a09e]/5 border-[#16a09e] border-2 shadow-sm' 
                                                                : 'bg-white border-gray-200 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex justify-between items-center mb-2 gap-4">
                                                            <span className={`font-bold text-base ${isSelected ? 'text-[#0f3460]' : 'text-gray-800'}`}>
                                                                {nic.nombre}
                                                            </span>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-[#16a09e] bg-[#16a09e]' : 'border-gray-300 bg-gray-50'}`}>
                                                                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-[10px]" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-500 leading-relaxed pr-6">{nic.definicion}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={handleSaveCarePlan}
                                    disabled={selectedNics.length === 0} 
                                    className={`w-full md:w-auto px-10 py-4 text-sm uppercase tracking-wider font-bold rounded-2xl shadow-lg transition-all
                                        ${selectedNics.length === 0 
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-[#16a09e] hover:bg-[#128a88] text-white hover:-translate-y-1 hover:shadow-[#16a09e]/30'}`}
                                >
                                    Finalizar y Guardar Plan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {evaluatingNoc && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        
                        <div className="bg-[#0f3460] p-6 flex justify-between items-start text-white shrink-0 relative overflow-hidden">
                            <FontAwesomeIcon icon={faBullseye} className="absolute -right-4 -bottom-4 text-8xl text-white opacity-5" />
                            <div className="relative z-10 pr-8">
                                <span className="bg-white/10 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 inline-block">Evaluación Inicial</span>
                                <h3 className="text-xl md:text-2xl font-bold leading-tight">{evaluatingNoc.nombre}</h3>
                            </div>
                            <button onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/20 w-10 h-10 rounded-full transition-colors flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 overflow-y-auto bg-gray-50 flex-1">
                            <p className="text-sm font-bold text-gray-600 mb-5">Puntúe la gravedad de cada indicador:</p>

                            <div className="space-y-4">
                                {evaluatingNoc.indicadores?.map((ind, i) => {
                                    const isAnswered = !!currentScores[ind.codigo];
                                    return (
                                        <div key={i} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all ${isAnswered ? 'bg-[#16a09e]/5 border-[#16a09e]/30 shadow-sm' : 'bg-white border-gray-200'}`}>
                                            <span className={`text-sm font-semibold lg:w-1/2 mb-5 lg:mb-0 leading-relaxed ${isAnswered ? 'text-[#0f3460]' : 'text-gray-700'}`}>
                                                {ind.texto}
                                            </span>
                                            
                                            <div className="flex items-center gap-2 md:gap-3 lg:w-1/2 justify-between lg:justify-end">
                                                <span className="text-[10px] md:text-xs font-bold text-red-500 w-10 md:w-12 text-right uppercase">Grave</span>
                                                <div className="flex gap-1.5 md:gap-2">
                                                    {[1, 2, 3, 4, 5].map(num => (
                                                        <label key={num} className="cursor-pointer relative group">
                                                            <input 
                                                                type="radio" 
                                                                name={`ind-${ind.codigo}`} 
                                                                value={num} 
                                                                checked={currentScores[ind.codigo] === num}
                                                                onChange={() => handleScoreChange(ind.codigo, num)}
                                                                className="peer hidden" 
                                                            />
                                                            <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-gray-500 font-bold peer-checked:bg-[#16a09e] peer-checked:text-white peer-checked:border-[#16a09e] hover:border-[#16a09e]/50 transition-all shadow-sm">
                                                                {num}
                                                            </div>
                                                            {num === 1 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Grave</span>}
                                                            {num === 5 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-green-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Sano</span>}
                                                        </label>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] md:text-xs font-bold text-green-500 w-10 md:w-12 text-left uppercase">Sano</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 md:p-5 border-t border-gray-100 bg-white flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0 rounded-b-3xl">
                            <button onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }} className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEvaluation}
                                disabled={Object.keys(currentScores).length < evaluatingNoc.indicadores.length}
                                className={`px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all w-full sm:w-auto
                                    ${Object.keys(currentScores).length < evaluatingNoc.indicadores.length 
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                        : 'bg-[#16a09e] text-white hover:bg-[#128a88]'}`}
                            >
                                Guardar Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarePlanBuilder;