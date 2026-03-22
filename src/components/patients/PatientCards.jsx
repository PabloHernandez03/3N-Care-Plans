import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisH, faTh, faList, faUserCircle,
  faClock, faSortAlphaDown, faSortAlphaUpAlt,
  faSortNumericDown, faSortNumericUpAlt,
  faIdCard, faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const bloodColors = {
  'A+': 'bg-red-100 text-red-600',   'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-600', 'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-600', 'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-600', 'O-': 'bg-blue-100 text-blue-700',
};

/** Nombre completo a partir del nuevo modelo */
function getNombreCompleto(nombre = {}) {
  return [nombre.nombre, nombre.apellidoPaterno, nombre.apellidoMaterno]
    .filter(Boolean).join(' ');
}

/** "Apellido Paterno, Nombre(s)" — útil para listas ordenadas */
function getNombreOrdenado(nombre = {}) {
  const apellidos = [nombre.apellidoPaterno, nombre.apellidoMaterno].filter(Boolean).join(' ');
  return apellidos ? `${apellidos}, ${nombre.nombre || ''}` : nombre.nombre || '—';
}

/** Iniciales para el avatar */
function getInitials(nombre = {}) {
  const n = nombre.nombre?.[0] || '';
  const ap = nombre.apellidoPaterno?.[0] || '';
  return (ap + n).toUpperCase() || '?';
}

/** Edad calculada desde fechaNacimiento (Date ISO) */
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

// ── Sub-componentes ───────────────────────────────────────────────────────────

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

// ── PatientCard ───────────────────────────────────────────────────────────────

function PatientCard({ p, onSelect, isSelected }) {
  // tipoSangre viene de demograficos; diagnostico del ingreso activo si viene populado
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
      <button onClick={e => e.stopPropagation()}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors
                ${isSelected ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-gray-100'}`}>
        <FontAwesomeIcon icon={faEllipsisH} />
      </button>

      {/* Avatar + nombre */}
      <div className="flex flex-col items-center text-center mb-4">
        <PatientAvatar nombre={p.nombre} sexo={sexo} foto={p.foto} />
        <h3 className={`mt-3 font-semibold text-sm leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
          {/* Apellidos en negrita, nombre en peso normal */}
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
        <button className={`p-1.5 rounded-lg transition-colors
          ${isSelected
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-primario/10 text-primario hover:bg-primario/20'}`}>
          <FontAwesomeIcon icon={faUserCircle} size="lg" />
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PatientCards({ patients = [], onSelectPatient, sort, sortDir = 'asc', onSortChange }) {
  const [selected, setSelected] = useState(null);
  const [view, setView]         = useState('grid');

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

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Pacientes{' '}
          <span className="text-gray-400 font-normal text-base">({patients.length})</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map(({ key, labelAsc, labelDesc, iconAsc, iconDesc, tooltip }) => {
              const isActive  = sort === key;
              const isDesc    = isActive && sortDir === 'desc';
              const label     = isDesc ? labelDesc : labelAsc;
              const icon      = isDesc ? iconDesc  : iconAsc;

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

                  {/* Ícono siempre visible */}
                  <span className="text-sm leading-none">{icon}</span>

                  {/* Label solo en sm+ */}
                  <span className="hidden sm:inline">{label}</span>

                  {/* Flecha de dirección solo cuando está activo, visible en sm+ */}
                  {isActive && (
                    <span className="hidden sm:inline text-[10px] opacity-80 leading-none">
                      <FontAwesomeIcon icon={isDesc ? faArrowUp : faArrowDown} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {[['grid', faTh], ['list', faList]].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)}
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

      {/* Grid */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {patients.map(p => (
            <PatientCard key={p._id} p={p} onSelect={handleSelect} isSelected={selected === p._id} />
          ))}
        </div>
      )}

      {/* Lista */}
      {view === 'list' && (
        <div className="overflow-x-auto rounded-xl">
          <div className="min-w-[640px] space-y-2 m-0.5">

            {/* Cabecera */}
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

            {/* Filas */}
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

                  {/* Nombre con avatar */}
                  <span className="flex items-center gap-3 font-medium text-gray-800 min-w-0">
                    <PatientAvatar nombre={p.nombre} sexo={sexo} size="sm" />
                    <span className="min-w-0">
                      <span className="font-semibold block truncate">
                        {[p.nombre?.apellidoPaterno, p.nombre?.apellidoMaterno].filter(Boolean).join(' ')}
                      </span>
                      <span className="text-xs text-gray-400 block truncate">{p.nombre?.nombre}</span>
                    </span>
                  </span>

                  <div className="sm:hidden flex justify-center">
                    <button className="p-2 rounded-lg bg-primario/10 text-primario hover:bg-primario/20 transition-colors">
                      <FontAwesomeIcon icon={faUserCircle} size="lg" />
                    </button>
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
                    <button className="p-2 rounded-lg bg-primario/10 text-primario hover:bg-primario/20 transition-colors">
                      <FontAwesomeIcon icon={faUserCircle} size="lg" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}