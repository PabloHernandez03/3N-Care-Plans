import React, { useState, useEffect } from 'react';
import Button from '@/components/shared/Button';

const CarePlanBuilder = ({ patient, onCancel }) => {
    const [nandasGrouped, setNandasGrouped] = useState({});
    const [expandedDomain, setExpandedDomain] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [selectedNanda, setSelectedNanda] = useState(null);
    const [nocsSugeridos, setNocsSugeridos] = useState([]);
    
    const [evaluacionesNoc, setEvaluacionesNoc] = useState({}); 
    const [evaluatingNoc, setEvaluatingNoc] = useState(null); 
    const [currentScores, setCurrentScores] = useState({}); 
    
    const [nicsBase, setNicsBase] = useState([]); 
    const [nicsCalculados, setNicsCalculados] = useState([]); 
    const [selectedNics, setSelectedNics] = useState([]); 

    useEffect(() => {
        const fetchNandas = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nanda`);
                const data = await res.json();
                const agrupado = data.reduce((acc, curr) => {
                    const domName = curr.dominio ? `Dominio - ${curr.dominio.nombre}` : "Sin Dominio Definido";
                    const className = curr.clase ? `Clase - ${curr.clase.nombre}` : "Sin Clase Definida";
                    
                    if (!acc[domName]) acc[domName] = {};
                    if (!acc[domName][className]) acc[domName][className] = [];
                    acc[domName][className].push(curr);
                    return acc;
                }, {});
                setNandasGrouped(agrupado);
            } catch (error) { 
                console.error("Error cargando NANDA:", error);
            }
        };
        fetchNandas();
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length < 3) return setSearchResults([]);
        setIsSearching(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nanda/search/${value}`);
            if (res.ok) setSearchResults(await res.json());
        } catch (error) { console.error(error); } 
        finally { setIsSearching(false); }
    };

    const handleSelectNanda = async (nanda) => {
        setSelectedNanda(nanda);
        setSearchTerm("");
        setEvaluacionesNoc({});
        setNicsBase([]);
        setNicsCalculados([]);
        setSelectedNics([]); 
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/noc/from-nanda/${nanda.codigo}`);
            if (res.ok) {
                const data = await res.json();
                setNocsSugeridos(data.noc_sugeridos);
            }
            
            const resMapa = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnosis/${nanda.codigo}`);
            if(resMapa.ok) {
                const mapaData = await resMapa.json();
                const codigosNic = mapaData.nic_sugeridos.map(n => n.codigo);
                const resNic = await fetch(`${import.meta.env.VITE_API_URL}/api/nic/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigos: codigosNic })
                });
                if(resNic.ok) {
                    const dataNics = await resNic.json();
                    const nicsEnriquecidos = dataNics.map(nic => {
                        const infoMapa = mapaData.nic_sugeridos.find(n => n.codigo === nic.codigo);
                        return { 
                            ...nic, 
                            coincidenciaBase: infoMapa?.coincidencia || 0,
                            nocs_asociados: infoMapa?.nocs_asociados || []
                        };
                    });
                    setNicsBase(nicsEnriquecidos);
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleBackToSearch = () => {
        setSelectedNanda(null);
        setSearchTerm("");
        setNocsSugeridos([]);
        setEvaluacionesNoc({});
        setNicsBase([]);
        setNicsCalculados([]);
        setSelectedNics([]);
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
        if(Object.keys(evaluacionesActuales).length === 0) {
            return setNicsCalculados([]); 
        }

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
        setSelectedNics(prev => 
            prev.includes(codigoNic) 
                ? prev.filter(c => c !== codigoNic) 
                : [...prev, codigoNic] 
        );
    };

    const handleSaveCarePlan = async () => {
        if (selectedNics.length === 0 || Object.keys(evaluacionesNoc).length === 0) return;

        // 🟢 LIMPIEZA DEL PAYLOAD: Enviamos solo lo estrictamente necesario
        const payloadPlan = {
            pacienteId: patient?._id || patient?.id, // Nos aseguramos de tomar el ID del paciente
            fecha: new Date().toISOString(),
            nanda: {
                codigo: selectedNanda.codigo,
                nombre: selectedNanda.nombre
            },
            nocsEvaluados: Object.entries(evaluacionesNoc).map(([codigo, data]) => ({
                codigo,
                promedio: data.promedio,
                indicadores: data.indicadores
            })),
            nicsSeleccionados: nicsCalculados
                .filter(n => selectedNics.includes(n.codigo))
                .map(n => ({
                    codigo: n.codigo,
                    nombre: n.nombre
                }))
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/careplans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadPlan)
            });

            if (response.ok) {
                alert("Plan de Cuidados guardado exitosamente");
                onCancel(); 
            } else {
                const errorData = await response.json();
                console.error("Detalle del error BD:", errorData);
                alert("Hubo un error al guardar el plan en la base de datos.");
            }
        } catch (error) {
            console.error("Error guardando el plan", error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                Plan de cuidado - {patient?.nombre || "Paciente Desconocido"}
            </h2>

            {!selectedNanda ? (
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">1. Seleccione un Diagnóstico NANDA</h3>
                    <div className="mb-6 relative">
                        <input type="text" placeholder="Buscar por nombre, síntomas o definición..." value={searchTerm} onChange={handleSearch} className="w-full p-3 border-2 border-blue-300 rounded-lg shadow-sm focus:border-blue-600 focus:outline-none" />
                    </div>

                    {searchTerm.length >= 3 ? (
                        <div className="border border-blue-200 rounded-md bg-blue-50/30 p-2">
                            {searchResults.length > 0 ? (
                                <ul className="space-y-2">
                                    {searchResults.map((nanda) => (
                                        <li key={nanda.codigo} className="bg-white p-3 rounded border hover:border-blue-400 cursor-pointer flex justify-between items-center" onClick={() => handleSelectNanda(nanda)}>
                                            <div className="pr-4"><p className="font-bold text-blue-900">{nanda.nombre}</p><p className="text-xs text-gray-600 line-clamp-2 mt-1">{nanda.definicion}</p></div>
                                            <Button type="button" className="text-xs bg-blue-600">Seleccionar</Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (!isSearching && <p className="text-gray-500 text-sm p-2">Sin resultados.</p>)}
                        </div>
                    ) : (
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                            {Object.keys(nandasGrouped).map((dominio) => (
                                <div key={dominio} className="border-b border-gray-200 last:border-0">
                                    <button type="button" className="w-full text-left p-3 bg-gray-100 font-medium text-blue-900 flex justify-between" onClick={() => setExpandedDomain(expandedDomain === dominio ? null : dominio)}>
                                        <span>{dominio}</span><span>{expandedDomain === dominio ? '▼' : '▶'}</span>
                                    </button>
                                    {expandedDomain === dominio && (
                                        <div className="pl-4 pr-2 py-2 bg-white">
                                            {Object.keys(nandasGrouped[dominio]).map((clase) => (
                                                <div key={clase} className="mb-2 border-l-2 border-blue-400 pl-2">
                                                    <button type="button" className="w-full text-left p-2 text-sm text-gray-700 font-medium flex justify-between" onClick={() => setExpandedClass(expandedClass === clase ? null : clase)}>
                                                        <span>{clase}</span><span>{expandedClass === clase ? '▼' : '▶'}</span>
                                                    </button>
                                                    {expandedClass === clase && (
                                                        <ul className="pl-6 mt-1 space-y-2">
                                                            {nandasGrouped[dominio][clase].map((nanda) => (
                                                                <li key={nanda.codigo} className="flex justify-between items-center bg-gray-50 p-3 text-sm rounded border">
                                                                    <span><strong className="text-blue-700">{nanda.nombre}</strong></span>
                                                                    <Button type="button" onClick={() => handleSelectNanda(nanda)} className="text-xs">Seleccionar NANDA</Button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-center shadow-sm">
                        <div>
                            <h3 className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Diagnóstico NANDA Activo</h3>
                            <p className="text-lg font-medium text-blue-900">{selectedNanda.nombre}</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={handleBackToSearch}>Cambiar Diagnóstico</Button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">2. Evalúe los Resultados Esperados (NOC)</h3>
                    <ul className="space-y-3">
                        {/* 🟢 CAMBIO AQUÍ: Agregamos index para asegurar que los primeros 3 sean recomendados */}
                        {nocsSugeridos.map((noc, index) => {
                            const isEvaluated = !!evaluacionesNoc[noc.codigo];
                            const isRecomendado = index < 3 || noc.coincidencia >= 57;

                            return (
                                <li key={noc.codigo} className={`p-4 border rounded-lg shadow-sm transition-shadow ${isEvaluated ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                                    <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-gray-800">{noc.nombre}</span>
                                                {noc.coincidencia && !isEvaluated && (
                                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${isRecomendado ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-orange-100 text-orange-700 border border-orange-300'}`}>
                                                        {isRecomendado ? 'Recomendado' : 'Opcional'}
                                                    </span>
                                                )}
                                                {isEvaluated && (
                                                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-green-200 text-green-800">
                                                        Evaluado (Promedio: {evaluacionesNoc[noc.codigo].promedio})
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 line-clamp-1">{noc.definicion}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {isEvaluated ? (
                                                <>
                                                    <Button type="button" variant="secondary" onClick={() => openEvaluationModal(noc)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800">Volver a Evaluar</Button>
                                                    <Button type="button" variant="secondary" onClick={() => handleDeleteEvaluation(noc.codigo)} className="text-xs bg-red-100 hover:bg-red-200 text-red-800 border-red-200">Borrar</Button>
                                                </>
                                            ) : (
                                                <Button type="button" onClick={() => openEvaluationModal(noc)}>Evaluar Indicadores</Button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {nicsCalculados.length > 0 && (
                        <div className="mt-8 animate-fade-in border-t pt-6 bg-gray-50 -mx-6 px-6 pb-6 rounded-b-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 pt-4">
                                3. Intervenciones (NIC) Ajustadas a tu Evaluación
                                <span className="block text-sm font-normal text-gray-500 mt-1">Selecciona una o más intervenciones para aplicar al paciente.</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {nicsCalculados.map((nic, index) => {
                                    const isGolden = index === 0; 
                                    const isSelected = selectedNics.includes(nic.codigo); 
                                    
                                    return (
                                        <div 
                                            key={nic.codigo} 
                                            onClick={() => toggleNicSelection(nic.codigo)}
                                            className={`p-4 rounded-lg shadow-sm relative overflow-hidden cursor-pointer transition-all duration-200
                                                ${isSelected ? 'bg-green-50 ring-4 ring-green-500 border-transparent transform scale-[1.02]' : 
                                                 isGolden ? 'bg-yellow-50/80 border-2 border-yellow-400 hover:bg-yellow-100' : 
                                                 'bg-white border border-gray-200 hover:border-blue-400'}`}
                                        >
                                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg shadow
                                                ${isSelected ? 'bg-green-500 text-white' : 
                                                  isGolden ? 'bg-yellow-500 text-white' : 
                                                  (nic.coincidenciaDinamica >= 57 ? 'bg-green-500 text-white' : 'bg-orange-400 text-white')}`}>
                                                {isSelected ? 'Intervención Elegida' : 
                                                 isGolden ? 'Plan Recomendado' : 
                                                 (nic.coincidenciaDinamica >= 57 ? 'Recomendado' : 'Opcional')}
                                            </div>

                                            <span className={`block font-bold pr-32 ${isSelected ? 'text-green-900' : (isGolden ? 'text-yellow-900' : 'text-gray-800')}`}>
                                                {nic.nombre}
                                            </span>
                                            <span className="text-sm text-gray-600 line-clamp-2 mt-2">{nic.definicion}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <Button 
                                    type="button" 
                                    onClick={handleSaveCarePlan}
                                    disabled={selectedNics.length === 0} 
                                    className={`px-8 py-3 text-lg font-bold shadow-lg transition-transform hover:scale-105 ${selectedNics.length === 0 ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    Comenzar Plan de Cuidado
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {evaluatingNoc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b bg-blue-50/50 rounded-t-lg">
                            <h3 className="text-xl font-bold text-blue-900">Evaluación: {evaluatingNoc.nombre}</h3>
                            <p className="text-sm text-blue-700 mt-1">{evaluatingNoc.definicion}</p>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-semibold text-gray-700">Puntúe TODOS los indicadores del 1 (Grave) al 5 (Sano):</p>
                                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600">
                                    {Object.keys(currentScores).length} / {evaluatingNoc.indicadores.length} respondidos
                                </span>
                            </div>

                            <div className="space-y-3">
                                {evaluatingNoc.indicadores?.map((ind, i) => {
                                    const isAnswered = !!currentScores[ind.codigo];
                                    return (
                                        <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg border transition-colors ${isAnswered ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                            <span className={`text-sm font-medium md:w-1/2 mb-3 md:mb-0 ${isAnswered ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {ind.texto}
                                            </span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <label key={num} className="cursor-pointer group">
                                                        <input 
                                                            type="radio" 
                                                            name={`ind-${ind.codigo}`} 
                                                            value={num} 
                                                            checked={currentScores[ind.codigo] === num}
                                                            onChange={() => handleScoreChange(ind.codigo, num)}
                                                            className="peer hidden" 
                                                        />
                                                        <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-200 bg-white text-gray-500 font-bold peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 group-hover:border-blue-400 transition-all shadow-sm">
                                                            {num}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                            <Button type="button" variant="secondary" onClick={() => { setEvaluatingNoc(null); setCurrentScores({}); }}>
                                Cancelar
                            </Button>
                            <Button 
                                type="button" 
                                onClick={handleSaveEvaluation}
                                disabled={Object.keys(currentScores).length < evaluatingNoc.indicadores.length}
                                className={Object.keys(currentScores).length < evaluatingNoc.indicadores.length ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                            >
                                {Object.keys(currentScores).length < evaluatingNoc.indicadores.length 
                                    ? `Faltan ${evaluatingNoc.indicadores.length - Object.keys(currentScores).length}` 
                                    : 'Guardar Evaluación'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarePlanBuilder;