import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisH, faTh, faList, faUserCircle,
  faClock, faSortAlphaDown, faSortAlphaUpAlt,
  faSortNumericDown, faSortNumericUpAlt,
  faIdCard, faArrowUp, faArrowDown,
  faMagnifyingGlass, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';


const bloodColors = {
  'A+': 'bg-red-100 text-red-600',   'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-600', 'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-600', 'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-600', 'O-': 'bg-blue-100 text-blue-700',
};

function getNombreCompleto(nombre = {}) {
  return [nombre.nombre, nombre.apellidoPaterno, nombre.apellidoMaterno]
    .filter(Boolean).join(' ');
}

function getNombreOrdenado(nombre = {}) {
  const apellidos = [nombre.apellidoPaterno, nombre.apellidoMaterno].filter(Boolean).join(' ');
  return apellidos ? `${apellidos}, ${nombre.nombre || ''}` : nombre.nombre || '—';
}

function getInitials(nombre = {}) {
  const n = nombre.nombre?.[0] || '';
  const ap = nombre.apellidoPaterno?.[0] || '';
  return (ap + n).toUpperCase() || '?';
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac)) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

const SORT_OPTIONS = [
    {
        key:      'reciente',
        labelAsc: 'Más recientes',
        labelDesc:'Más antiguos',
        iconAsc:  <FontAwesomeIcon icon={faClock} />,
        iconDesc: <FontAwesomeIcon icon={faClock} className="opacity-60" />,
        tooltip:  'Fecha de registro',
    },
    {
        key:      'nombre',
        labelAsc: 'Nombre A→Z',
        labelDesc:'Nombre Z→A',
        iconAsc:  <FontAwesomeIcon icon={faSortAlphaDown} />,
        iconDesc: <FontAwesomeIcon icon={faSortAlphaUpAlt} />,
        tooltip:  'Ordenar por nombre',
    },
    {
        key:      'apellido',
        labelAsc: 'Apellido A→Z',
        labelDesc:'Apellido Z→A',
        iconAsc:  <FontAwesomeIcon icon={faIdCard} />,
        iconDesc: <FontAwesomeIcon icon={faIdCard} className="opacity-60" />,
        tooltip:  'Ordenar por apellido',
    },
    {
        key:      'edad',
        labelAsc: 'Más jóvenes',
        labelDesc:'Más mayores',
        iconAsc:  <FontAwesomeIcon icon={faSortNumericDown} />,
        iconDesc: <FontAwesomeIcon icon={faSortNumericUpAlt} />,
        tooltip:  'Ordenar por edad',
    },
];

function PatientAvatar({ nombre, sexo, foto, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-16 h-16 text-xl";
  const bgColor = sexo === 'M'
    ? 'bg-blue-100 text-blue-600'
    : sexo === 'F'
    ? 'bg-pink-100 text-pink-600'
    : 'bg-gray-100 text-gray-500';

  if (foto) return (
    <img src={foto} alt={getNombreCompleto(nombre)}
         className={`${dim} rounded-full object-cover ring-4 ring-white shadow-md`} />
  );

  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold ring-4 ring-white shadow-md ${bgColor}`}>
      {getInitials(nombre)}
    </div>
  );
}

function PatientCard({ p, onSelect, isSelected, onProfile, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tipoSangre  = p.demograficos?.tipoSangre || null;
  const sexo        = p.demograficos?.sexo || p.sexo || '';
  const edad        = calcularEdad(p.demograficos?.fechaNacimiento);
  const diagnostico = p.ultimoIngreso?.ingreso?.diagnosticoMedico || '—';
  const bloodClass  = bloodColors[tipoSangre] || 'bg-gray-100 text-gray-500';

  return (
    <div onClick={() => onSelect(p)}
         className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200
           hover:shadow-lg hover:-translate-y-1
           ${isSelected
             ? 'ring-2 ring-primario shadow-lg bg-primario text-white'
             : 'bg-gradient-to-t from-primario/20 to-white shadow-sm hover:ring-1 hover:ring-primario/30'
           }`}>

      {/* Menú tres puntos */}
      <div className="absolute top-4 right-4">
        <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className={`p-1.5 rounded-lg transition-colors
                ${isSelected ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-gray-100'}`}>
            <FontAwesomeIcon icon={faEllipsisH} />
        </button>

        {menuOpen && (
            <div
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                <button
                    onClick={() => { setMenuOpen(false); onProfile(p); }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserCircle} className="text-primario text-xs" />
                    Ver perfil
                </button>
                <div className="mx-3 my-1 border-t border-gray-100" />
                <button
                    onClick={() => { setMenuOpen(false); onDelete(p); }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 flex items-center gap-2">
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    Eliminar
                </button>
            </div>
        )}
    </div>

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center text-center mb-4">
        <PatientAvatar nombre={p.nombre} sexo={sexo} foto={p.foto} />
        <h3 className={`mt-3 font-semibold text-sm leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
          <span className="font-bold">
            {[p.nombre?.apellidoPaterno, p.nombre?.apellidoMaterno].filter(Boolean).join(' ')}
          </span>
          {p.nombre?.nombre && (
            <span className={`block font-normal text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
              {p.nombre.nombre}
            </span>
          )}
        </h3>
        <span className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
          #{p._id?.slice(-5).toUpperCase() || 'P0000'}
        </span>
      </div>

      <div className={`border-t mb-3 ${isSelected ? 'border-white/20' : 'border-gray-100'}`} />

      {/* Datos */}
      <div className="space-y-2 text-xs">
        <div>
          <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
            Diagnóstico preliminar
          </p>
          <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {diagnostico}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
              Edad
            </p>
            <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              {edad !== null ? `${edad} ${edad === 1 ? 'año' : 'años'}` : '—'}
            </p>
          </div>

          <div className="text-right">
            <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
              Sangre
            </p>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold
              ${isSelected ? 'bg-white/20 text-white' : bloodClass}`}>
              {tipoSangre || '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-3 pt-3 border-t flex items-center justify-between
        ${isSelected ? 'border-white/20' : 'border-gray-100'}`}>
        <span className={`text-[10px] uppercase tracking-wide font-medium
            ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
            {sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Femenino' : 'Otro'}
        </span>
        <button
            onClick={e => { e.stopPropagation(); onProfile(p); }}
            className={`p-1.5 rounded-lg transition-colors
                ${isSelected
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-primario/10 text-primario hover:bg-primario/20'}`}>
            <FontAwesomeIcon icon={faUserCircle} size="lg" />
        </button>
    </div>
    </div>
  );
}

function RowMenu({ p, onProfile, onDelete, onEdit }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <FontAwesomeIcon icon={faEllipsisH} />
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={e => { e.stopPropagation(); setOpen(false); }}
                    />
                    <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
                        <button
                            onClick={() => { setOpen(false); onProfile(p); }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserCircle} className="text-primario text-xs" />
                            Ver perfil
                        </button>
                        <div className="mx-3 my-1 border-t border-gray-100" />
                        <button
                            onClick={() => { setOpen(false); onDelete(p); }}
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 flex items-center gap-2">
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            Eliminar
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

export default function PatientCards({
    allPatients = [], onSelectPatient,
    sort, sortDir, onSortChange,
    page, onPageChange,
    gridPageSize, listPageSize, onPageSizeChange,
    onDeletePatient, showToast
}) {
  const [selected, setSelected] = useState(null);
  const [view, setView]         = useState('grid');
  const [search, setSearch]     = useState('');
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(null);

  function handleProfile(p) {
    navigate(`/patients/${p._id}`);
  }

  function handleDeleteRequest(p) {
    setConfirmDelete(p);
  }

  async function handleDeleteConfirm() {
    try {
        await api.delete(`/api/patients/${confirmDelete._id}`);
        onDeletePatient?.(confirmDelete._id);
        showToast("Paciente y registros eliminados exitosamente", "success");
    } catch {
        showToast("No se pudo eliminar el paciente", "error");
    } finally {
        setConfirmDelete(null);
    }
  }

  const normalizeText = (text = '') =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

    const getTokens = (text) =>
    normalizeText(text)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const filtered = useMemo(() => {
      const tokens = getTokens(search);
      if (!tokens.length) return allPatients;

      return allPatients.filter(p => {
        const full = normalizeText(`
          ${p.nombre?.nombre}
          ${p.nombre?.apellidoPaterno}
          ${p.nombre?.apellidoMaterno}
          ${p.curp}
        `);

        return tokens.every(token => full.includes(token));
      });
    }, [allPatients, search]);

    const pageSize   = view === 'grid' ? gridPageSize : listPageSize;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const patients   = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSelect(p) {
    setSelected(p._id);
    onSelectPatient?.(p);
  }

  function handleSortClick(key) {
    if (sort === key) {
      onSortChange?.(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange?.(key, 'asc');
    }
  }

  function handleViewChange(v) {
    setView(v);
    onPageChange?.(1);
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2 mb-4">
          {/* Fila 1: Buscador */}
          <div className="relative">
              <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"
              />
              <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); onPageChange?.(1); }}
                  placeholder="Buscar por nombre, apellido o CURP…"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm
                            text-gray-800 placeholder-gray-400 transition
                            focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20"
              />
              {search && (
                  <button
                      onClick={() => { setSearch(''); onPageChange?.(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-xs">
                      ✕
                  </button>
              )}
          </div>
          {/* Fila 2: Ordenamiento + vista */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-gray-400 font-normal text-sm">
                {filtered.length === 0
                    ? <span className="text-xs text-gray-400 italic">Sin resultados para "{search}"</span>
                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} de ${filtered.length}`
                }
              </span>
            </div>
          <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">

              {/* Botones de orden */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                  {SORT_OPTIONS.map(({ key, labelAsc, labelDesc, iconAsc, iconDesc, tooltip }) => {
                      const isActive = sort === key;
                      const isDesc   = isActive && sortDir === 'desc';
                      return (
                          <button
                              key={key}
                              onClick={() => handleSortClick(key)}
                              title={tooltip}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                  border transition-all duration-150 select-none
                                  ${isActive
                                      ? 'bg-primario text-white border-primario shadow-sm'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-primario/40 hover:text-primario'
                                  }`}>
                              <span className="text-sm leading-none">
                                  {isDesc ? iconDesc : iconAsc}
                              </span>
                              <span className="hidden sm:inline">
                                  {isDesc ? labelDesc : labelAsc}
                              </span>
                              {isActive && (
                                  <span className="hidden sm:inline text-[10px] opacity-80 leading-none">
                                      <FontAwesomeIcon icon={isDesc ? faArrowUp : faArrowDown} />
                                  </span>
                              )}
                          </button>
                      );
                  })}
              </div>

              {/* Toggle vista */}
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1 shrink-0 ml-auto sm:ml-0">
                  {[['grid', faTh], ['list', faList]].map(([v, icon]) => (
                      <button key={v} onClick={() => handleViewChange(v)}
                              className={`p-1.5 rounded-md transition-colors
                                  ${view === v
                                      ? 'bg-white shadow-sm text-primario'
                                      : 'text-gray-400 hover:text-gray-600'}`}>
                          <FontAwesomeIcon icon={icon} size="sm" />
                      </button>
                  ))}
              </div>
          </div>

          </div>
      </div>

      {/* Grid */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {patients.map(p => (
                <PatientCard
                    key={p._id} p={p}
                    onSelect={handleSelect}
                    isSelected={selected === p._id}
                    onProfile={handleProfile}
                    onDelete={handleDeleteRequest}
                />
            ))}
        </div>
    )}

      {/* Lista */}
      {view === 'list' && (
        <div className="overflow-x-auto rounded-xl">
          <div className="min-w-[640px] space-y-2 m-0.5">

            <div className="bg-white rounded-xl px-6 py-3 grid
                            grid-cols-[3fr_1fr_1fr_3fr_1fr_1fr]
                            gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide items-center">
              <span>Paciente</span>
              <span className="sm:hidden" />
              <span>Sexo</span>
              <span>Edad</span>
              <span>Diagnóstico preliminar</span>
              <span>Sangre</span>
              <span className="max-sm:hidden" />
            </div>

            {patients.map(p => {
              const sexo       = p.demograficos?.sexo || p.sexo || '';
              const tipoSangre = p.demograficos?.tipoSangre || null;
              const edad       = calcularEdad(p.demograficos?.fechaNacimiento);
              const diagnostico = p.ultimoIngreso?.ingreso?.diagnosticoMedico || '—';

              return (
                <div key={p._id} onClick={() => handleSelect(p)}
                     className={`bg-white rounded-xl mx-[0.1rem] px-6 py-4 text-sm grid
                                 grid-cols-[3fr_1fr_1fr_3fr_1fr_1fr]
                                 gap-4 items-center cursor-pointer transition-colors
                                 ${selected === p._id ? 'ring-2 ring-primario' : 'hover:bg-primario/5'}`}>

                  <span className="flex items-center gap-3 font-medium text-gray-800 min-w-0">
                    <PatientAvatar nombre={p.nombre} sexo={sexo} size="sm" />
                    <span className="min-w-0">
                      <span className="font-semibold block truncate">
                        {[p.nombre?.apellidoPaterno, p.nombre?.apellidoMaterno].filter(Boolean).join(' ')}
                      </span>
                      <span className="text-xs text-gray-400 block truncate">{p.nombre?.nombre}</span>
                    </span>
                  </span>

                  <div className="sm:hidden flex justify-center relative">
                      <RowMenu p={p} onProfile={handleProfile} onDelete={handleDeleteRequest}/>
                  </div>

                  <span className="text-gray-500">
                    {sexo === 'M' ? 'Masc.' : sexo === 'F' ? 'Fem.' : 'Otro'}
                  </span>

                  <span className="text-gray-500">
                    {edad !== null ? `${edad} a.` : '—'}
                  </span>

                  <span className="text-gray-700 truncate">{diagnostico}</span>

                  <span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold
                      ${bloodColors[tipoSangre] || 'bg-gray-100 text-gray-500'}`}>
                      {tipoSangre || '?'}
                    </span>
                  </span>

                  <div className="max-sm:hidden flex justify-center">
                    <div className="max-sm:hidden flex justify-center relative">
                        <RowMenu p={p} onProfile={handleProfile} onDelete={handleDeleteRequest} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
      <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 mt-6 pt-4 border-t border-gray-100">

          <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Mostrar</span>
              {[10, 20, 50].map(n => (
                  <button
                      key={n}
                      onClick={() => onPageSizeChange?.(view, n)}
                      className={`w-9 h-7 rounded-md border text-xs font-semibold transition-all
                          ${pageSize === n
                              ? 'bg-primario text-white border-primario'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-primario/40 hover:text-primario'
                          }`}>
                      {n}
                  </button>
              ))}
              <span>por página</span>
          </div>

          {/* Navegación */}
          <div className="flex items-center gap-1">
              {/* Anterior */}
              <button
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page === 1}
                  className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500
                      hover:border-primario/40 hover:text-primario disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all bg-white">
                  ← Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                      acc.push(n);
                      return acc;
                  }, [])
                  .map((item, idx) =>
                      item === '…'
                          ? <span key={`gap-${idx}`} className="px-1 text-gray-300 text-xs">…</span>
                          : <button
                              key={item}
                              onClick={() => onPageChange?.(item)}
                              className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all
                                  ${page === item
                                      ? 'bg-primario text-white border-primario shadow-sm'
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-primario/40 hover:text-primario'
                                  }`}>
                              {item}
                            </button>
                  )
              }

              <button
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 h-8 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500
                      hover:border-primario/40 hover:text-primario disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all bg-white">
                  Siguiente →
              </button>
          </div>
      </div>
      )}

      {confirmDelete && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
            onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4"
                onClick={e => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                  ¿Eliminar paciente?
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                  Se eliminará permanentemente a{' '}
                  <span className="font-medium text-gray-700">
                      {confirmDelete.nombre?.apellidoPaterno} {confirmDelete.nombre?.nombre}
                  </span>.
                  Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                  <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                      Cancelar
                  </button>
                  <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all">
                      Eliminar
                  </button>
              </div>
          </div>
      </div>
  )}

    </div>
  );
}