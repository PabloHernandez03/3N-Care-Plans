import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMagnifyingGlass, faLayerGroup, faFolderOpen, 
    faBookMedical, faArrowLeft, faStethoscope, faNotesMedical, faTimes, faListCheck, faRulerHorizontal,
    faHeart, faAppleAlt, faToilet, faWalking, faBrain, faUserFriends, faCogs, faProcedures, faSeedling,
    faShieldAlt, faBiohazard
} from '@fortawesome/free-solid-svg-icons';

const getTexto = (campo) => {
    if (!campo) return '';
    if (Array.isArray(campo)) return campo.map(c => getTexto(c)).join(', ');
    if (typeof campo === 'object') {
        return campo.nombre || campo.texto || campo.indicador || campo.descripcion || campo.codigo || '';
    }
    return String(campo);
};

export default function DictionaryView() {
    const [activeTab, setActiveTab] = useState('NANDA');
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedDominio, setSelectedDominio] = useState(null);
    const [selectedClase, setSelectedClase] = useState(null);
    const [selectedItemDetail, setSelectedItemDetail] = useState(null);

    const domainIconMap = {
        1: faHeart, 2: faAppleAlt, 3: faToilet, 4: faWalking, 5: faBrain, 
        6: faUserFriends, 7: faCogs, 8: faProcedures, 9: faSeedling, 
        10: faShieldAlt, 11: faBiohazard, 12: faProcedures, 13: faSeedling    
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${activeTab.toLowerCase()}`);
            if (res.ok) {
                setData(await res.json());
                setSelectedDominio(null);
                setSelectedClase(null);
                setSearchTerm('');
            } else {
                setError(`No pudimos conectar con la base de datos (${res.status})`);
            }
        } catch (error) { 
            console.error("Error en el fetch:", error); 
            setError("Parece que el servidor está dormido. Asegúrate de que Node.js esté corriendo.");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const dominios = useMemo(() => {
        if (activeTab !== 'NANDA') {
            // Para NOC y NIC mantener comportamiento original
            const unique = [...new Set(data.map(item => getTexto(item.dominio)).filter(Boolean))];
            return unique.sort();
        }
        // Para NANDA: agrupar por codigo de dominio igual que CarePlanBuilder
        const map = {};
        data.forEach(item => {
            if (!item.dominio?.codigo) return;
            const codigo = item.dominio.codigo;
            if (!map[codigo]) {
                map[codigo] = {
                    codigo,
                    nombre: item.dominio.nombre || codigo,
                    icon: domainIconMap[parseInt(codigo)] || faBookMedical, // ← nuevo
                    total: 0,
                };
            }
            map[codigo].total++;
        });
        // Ordenar por código numérico
        return Object.values(map).sort((a, b) => {
            const numA = parseInt(a.codigo);
            const numB = parseInt(b.codigo);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.codigo.localeCompare(b.codigo);
        });
    }, [data, activeTab]);

    const clasesDelDominio = useMemo(() => {
        if (!selectedDominio) return [];

        if (activeTab !== 'NANDA') {
            const itemsEnDominio = data.filter(item => getTexto(item.dominio) === selectedDominio);
            const todasLasClases = itemsEnDominio.flatMap(item =>
                Array.isArray(item.clase) ? item.clase.map(getTexto) : [getTexto(item.clase)]
            );
            return [...new Set(todasLasClases.filter(Boolean))].sort();
        }

        // NANDA: selectedDominio es el objeto { codigo, nombre, total }
        const itemsEnDominio = data.filter(item => item.dominio?.codigo === selectedDominio.codigo);
        const clasesMap = {};
        itemsEnDominio.forEach(item => {
            const claseNombre = item.clase?.nombre || 'Sin Clase Definida';
            if (!clasesMap[claseNombre]) clasesMap[claseNombre] = 0;
            clasesMap[claseNombre]++;
        });
        return Object.entries(clasesMap)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [data, selectedDominio, activeTab]);

    const itemsAMostrar = useMemo(() => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return data.filter(item =>
                getTexto(item.nombre).toLowerCase().includes(term) ||
                getTexto(item.codigo).toLowerCase().includes(term)
            );
        }
        if (!selectedDominio || !selectedClase) return [];

        if (activeTab !== 'NANDA') {
            return data.filter(item => {
                const domCoincide = getTexto(item.dominio) === selectedDominio;
                const claseCoincide = Array.isArray(item.clase)
                    ? item.clase.map(getTexto).includes(selectedClase)
                    : getTexto(item.clase) === selectedClase;
                return domCoincide && claseCoincide;
            });
        }

        // NANDA
        return data.filter(item =>
            item.dominio?.codigo === selectedDominio.codigo &&
            (item.clase?.nombre || 'Sin Clase Definida') === selectedClase.nombre
        );
    }, [data, searchTerm, selectedDominio, selectedClase, activeTab]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md shadow-sm border border-red-100 animate-fade-in">
                    <FontAwesomeIcon icon={faStethoscope} className="text-5xl mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Error de conexión</h2>
                    <p className="text-sm mb-6 text-red-500 font-medium">{error}</p>
                    <button onClick={loadData} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm">
                        Reintentar conexión
                    </button>
                </div>
            </div>
        );
    }

    const themeParams = {
        NANDA: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
        NOC: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
        NIC: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' }
    };
    const activeTheme = themeParams[activeTab];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans relative">
            <div className="max-w-5xl mx-auto">
                
                <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
                                <FontAwesomeIcon icon={faBookMedical} />
                            </div>
                            Diccionario Clínico
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 ml-12">Taxonomía estandarizada</p>
                    </div>

                    <div className="flex bg-gray-100/80 p-1.5 rounded-xl overflow-x-auto hide-scrollbar shrink-0 shadow-inner">
                        {['NANDA', 'NOC', 'NIC'].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[80px] px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                    ${activeTab === tab 
                                        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="relative mb-8">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={`Buscar código o diagnóstico en ${activeTab}...`} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 transition-all shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-blue-600 animate-fade-in">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-current border-t-transparent"></div>
                    </div>
                ) : searchTerm ? (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-sm text-gray-500 font-medium px-2">Resultados: {itemsAMostrar.length}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {itemsAMostrar.map((item, idx) => <DefinitionCard key={idx} item={item} type={activeTab} onClick={() => setSelectedItemDetail(item)} />)}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {(selectedDominio || selectedClase) && (
                            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <span onClick={() => { setSelectedDominio(null); setSelectedClase(null); }}
                                    className="cursor-pointer hover:text-blue-600 transition-colors">
                                    Dominios
                                </span>
                                {selectedDominio && (
                                    <>
                                        <span className="text-gray-300">/</span>
                                        <span onClick={() => setSelectedClase(null)}
                                            className={`cursor-pointer transition-colors ${!selectedClase ? 'font-bold text-gray-800' : 'hover:text-blue-600'}`}>
                                            {activeTab === 'NANDA' ? selectedDominio.nombre : selectedDominio}
                                        </span>
                                    </>
                                )}
                                {selectedClase && (
                                    <>
                                        <span className="text-gray-300">/</span>
                                        <span className="font-bold text-gray-800">
                                            {activeTab === 'NANDA' ? selectedClase.nombre : selectedClase}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Dominios */}
                        {!selectedDominio && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {dominios.map((dominio, idx) => {
                                    const label  = activeTab === 'NANDA' ? dominio.nombre  : dominio;
                                    const codigo = activeTab === 'NANDA' ? dominio.codigo  : null;
                                    const total  = activeTab === 'NANDA' ? dominio.total   : null;
                                    return (
                                        <div key={idx} onClick={() => setSelectedDominio(dominio)}
                                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group flex flex-col items-center text-center">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <FontAwesomeIcon icon={activeTab === 'NANDA' ? dominio.icon : faLayerGroup} />
                                            </div>
                                            {codigo && (
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                                                    Dominio {codigo}
                                                </span>
                                            )}
                                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{label}</h3>
                                            {total && <p className="text-xs text-gray-400 mt-1">{total} diagnósticos</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Clases */}
                        {selectedDominio && !selectedClase && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {clasesDelDominio.map((clase, idx) => {
                                    const label = activeTab === 'NANDA' ? clase.nombre : clase;
                                    const total = activeTab === 'NANDA' ? clase.total  : null;
                                    return (
                                        <div key={idx} onClick={() => setSelectedClase(clase)}
                                            className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                                <FontAwesomeIcon icon={faFolderOpen} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-700 group-hover:text-green-800">{label}</h3>
                                                {total && <p className="text-xs text-gray-400 mt-0.5">{total} diagnósticos</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedClase && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {itemsAMostrar.map((item, idx) => <DefinitionCard key={idx} item={item} type={activeTab} onClick={() => setSelectedItemDetail(item)} />)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedItemDetail && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItemDetail(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        <div className={`${activeTheme.bg} p-5 flex justify-between items-start text-white shrink-0`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold font-mono tracking-wider">
                                        CÓDIGO: {getTexto(selectedItemDetail.codigo)}
                                    </span>
                                    <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                        | {activeTab}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold leading-tight pr-4">{getTexto(selectedItemDetail.nombre)}</h3>
                            </div>
                            <button onClick={() => setSelectedItemDetail(null)} className="text-white hover:bg-black/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faTimes} className="text-lg" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-6">
                            
                            {activeTab === 'NOC' && selectedItemDetail.escalas && selectedItemDetail.escalas.length > 0 && (
                                <div className={`p-4 rounded-xl border ${activeTheme.border} ${activeTheme.light} flex flex-col gap-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${activeTheme.text} shadow-sm shrink-0`}>
                                            <FontAwesomeIcon icon={faRulerHorizontal} className="text-sm" />
                                        </div>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${activeTheme.text}`}>Escala de Medición</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItemDetail.escalas.map((escalaItem, i) => (
                                            <span key={i} className="bg-white border border-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                                                {getTexto(escalaItem)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dominio</p>
                                        <p className="text-sm font-semibold text-gray-800">{getTexto(selectedItemDetail.dominio) || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clase</p>
                                        <p className="text-sm font-semibold text-gray-800">{getTexto(selectedItemDetail.clase) || 'No especificada'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Definición principal</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {getTexto(selectedItemDetail.definicion) || <span className="italic text-gray-400">No hay definición registrada.</span>}
                                    </p>
                                </div>
                            </div>

                            {activeTab === 'NANDA' && (
                                <>
                                    <DetalleLista titulo="Características Definitorias" items={selectedItemDetail.caracteristicas_definitorias || selectedItemDetail.caracteristicasDefinitorias} theme={activeTheme} />
                                    <DetalleLista titulo="Factores Relacionados" items={selectedItemDetail.factores_relacionados || selectedItemDetail.factoresRelacionados} theme={activeTheme} />
                                    <DetalleLista titulo="Factores de Riesgo" items={selectedItemDetail.factores_de_riesgo || selectedItemDetail.factoresRiesgo} theme={activeTheme} />
                                    <DetalleLista titulo="Población en Riesgo" items={selectedItemDetail.poblacion_en_riesgo || selectedItemDetail.poblacionRiesgo} theme={activeTheme} />
                                    <DetalleLista titulo="Condiciones Asociadas" items={selectedItemDetail.condiciones_asociadas || selectedItemDetail.problemas_asociados || selectedItemDetail.problemasAsociados} theme={activeTheme} />
                                </>
                            )}

                            {activeTab === 'NOC' && (
                                <DetalleLista titulo="Indicadores Evaluables" items={selectedItemDetail.indicadores} theme={activeTheme} isNoc={true} />
                            )}

                            {activeTab === 'NIC' && (
                                <DetalleLista titulo="Actividades de Enfermería" items={selectedItemDetail.actividades} theme={activeTheme} />
                            )}

                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white flex justify-end shrink-0">
                            <button onClick={() => setSelectedItemDetail(null)} className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DetalleLista({ titulo, items, theme, isNoc }) {
    if (!items || items.length === 0) {
        return (
            <div>
                <h4 className={`text-sm font-bold ${theme.text} mb-2 flex items-center gap-2`}>
                    <FontAwesomeIcon icon={faListCheck} /> {titulo}
                </h4>
                <p className="text-sm text-gray-400 italic bg-white p-3 rounded-lg border border-dashed border-gray-200">No hay registros disponibles para este rubro.</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className={`text-sm font-bold ${theme.text} mb-3 flex items-center gap-2`}>
                <FontAwesomeIcon icon={faListCheck} /> {titulo} <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
            </h4>
            <ul className="space-y-3">
                {items.map((item, idx) => {
                    if (typeof item === 'object' && item !== null && (item.nombre || item.texto || item.indicador || item.descripcion || item.codigo)) {
                        const textoPrincipal = item.nombre || item.texto || item.indicador || item.descripcion || getTexto(item);
                        return (
                            <li key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm text-sm">
                                <div className={`mt-0.5 ${theme.light} ${theme.text} w-6 h-6 rounded flex items-center justify-center shrink-0 font-bold text-xs`}>
                                    {idx + 1}
                                </div>
                                <div className="flex flex-col w-full">
                                    <span className="font-semibold text-gray-800">
                                        {item.codigo && <span className="text-gray-400 font-mono text-xs mr-2">[{item.codigo}]</span>}
                                        {textoPrincipal !== item.codigo ? textoPrincipal : ''}
                                    </span>
                                    {item.definicion && (
                                        <span className="text-xs text-gray-500 mt-1.5 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                                            {item.definicion}
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-700">
                            <div className={`mt-0.5 ${theme.light} ${theme.text} w-5 h-5 rounded flex items-center justify-center shrink-0 font-bold text-xs`}>
                                {idx + 1}
                            </div>
                            <span className="leading-relaxed">{getTexto(item)}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function DefinitionCard({ item, type, onClick }) {
    const themeParams = {
        NANDA: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-500/20', hover: 'hover:border-blue-300' },
        NOC: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-500/20', hover: 'hover:border-indigo-300' },
        NIC: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-500/20', hover: 'hover:border-green-300' }
    };
    const theme = themeParams[type] || themeParams.NANDA;

    return (
        <div onClick={onClick} className={`cursor-pointer bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md ${theme.hover} transition-all flex flex-col h-full relative overflow-hidden group`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 ${theme.bg} group-hover:scale-110 transition-transform`}></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <span className={`px-3 py-1 text-xs font-black rounded-lg ring-1 inset-ring ${theme.bg} ${theme.text} ${theme.ring}`}>
                    #{getTexto(item.codigo)}
                </span>
                <div className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 max-w-[50%] truncate">
                    {getTexto(item.dominio)}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-3 relative z-10 group-hover:text-gray-900">
                {getTexto(item.nombre)}
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 flex-1 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {getTexto(item.definicion) || <span className="italic opacity-50">Sin definición registrada.</span>}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                {type === 'NIC' && item.actividades && item.actividades.length > 0 ? (
                    <span className="text-green-600 flex items-center gap-1"><FontAwesomeIcon icon={faNotesMedical} /> {item.actividades.length} act.</span>
                ) : type === 'NOC' && item.indicadores && item.indicadores.length > 0 ? (
                    <span className="text-indigo-600 flex items-center gap-1"><FontAwesomeIcon icon={faListCheck} /> {item.indicadores.length} ind.</span>
                ) : <span></span>}
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalles →</span>
            </div>
        </div>
    );
}