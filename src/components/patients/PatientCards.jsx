import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faArrowRight, faTh, faList, faUserCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

// Colores por tipo de sangre
const bloodColors = {
  'A+': 'bg-red-100 text-red-600',
  'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-600',
  'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-600',
  'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-600',
  'O-': 'bg-blue-100 text-blue-700',
};

// Iniciales del nombre para el avatar fallback
function getInitials(nombre = '') {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function PatientAvatar({ nombre, sexo, foto }) {
  const bgColor = sexo === 'M'
    ? 'bg-blue-100 text-blue-600'
    : sexo === 'F'
    ? 'bg-pink-100 text-pink-600'
    : 'bg-gray-100 text-gray-500';

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre}
        className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
      />
    );
  }

  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-4 ring-white shadow-md ${bgColor}`}>
      {getInitials(nombre)}
    </div>
  );
}

// Card individual de paciente
function PatientCard({ p, onSelect, isSelected }) {
  const bloodClass = bloodColors[p.sangre] || 'bg-gray-100 text-gray-500';

  return (
    <div
      onClick={() => onSelect(p)}
      className={`
        relative  rounded-2xl p-5 cursor-pointer transition-all duration-200
        hover:shadow-lg hover:-translate-y-1
        ${isSelected
          ? 'ring-2 ring-primario shadow-lg bg-primario text-white'
          : 'bg-gradient-to-t from-primario/20 to-white shadow-sm hover:ring-1 hover:ring-primario/30'
        }
      `}
    >
      {/* Menú tres puntos */}
      <button
        onClick={e => e.stopPropagation()}
        className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors
          ${isSelected ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:text-gray-600 hover:bg-gray-300'}`}
      >
        <FontAwesomeIcon icon={faEllipsisH} />
      </button>

      {/* Avatar centrado */}
      <div className="flex flex-col items-center text-center mb-4">
        <PatientAvatar nombre={p.nombre} sexo={p.sexo} foto={p.foto} />
        <h3 className={`mt-3 font-semibold text-sm leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
          {p.nombre}
        </h3>
        <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
          #{p._id?.slice(-5).toUpperCase() || 'P0000'}
        </span>
      </div>

      {/* Divider */}
      <div className={`border-t mb-3 ${isSelected ? 'border-white/20' : 'border-gray-100'}`} />

      {/* Datos */}
      <div className="space-y-2 text-xs">
        <div>
          <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
            Diagnóstico
          </p>
          <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {p.ingreso?.diagnosticoMedico || '—'}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
              Edad
            </p>
            <p className={`font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              {p.edad} {p.edad === 1 ? 'año' : 'años'}
            </p>
          </div>

          <div className="text-right">
            <p className={`font-medium uppercase tracking-wide text-[10px] ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
              Sangre
            </p>
            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold
              ${isSelected ? 'bg-white/20 text-white' : bloodClass}`}>
              {p.sangre || '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer con flecha */}
      <div className={`mt-3 pt-3 border-t flex items-center justify-between
        ${isSelected ? 'border-white/20' : 'border-gray-100'}`}>
        <span className={`text-[10px] uppercase tracking-wide font-medium
          ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
          {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'}
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

// Componente principal
export default function PatientCards({ patients = [], onSelectPatient }) {
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  function handleSelect(p) {
    setSelected(p._id);
    onSelectPatient?.(p);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Pacientes <span className="text-gray-400 font-normal text-base">({patients.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-primario' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FontAwesomeIcon icon={faTh} size="sm" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-primario' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FontAwesomeIcon icon={faList} size="sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de cards */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {patients.map(p => (
            <PatientCard
              key={p._id}
              p={p}
              onSelect={handleSelect}
              isSelected={selected === p._id}
            />
          ))}
        </div>
      )}

      {/* Vista lista (tu tabla original mejorada como fallback) */}
        {view === 'list' && (
        <div className="overflow-x-auto rounded-xl">
          <div className="min-w-[640px] space-y-2 mb-[0.1rem]">
            <div className="bg-white rounded-xl px-6 py-3 text-xs grid grid-cols-[3fr_2fr_2fr_3fr_2fr_1fr]  gap-4 font-semibold text-gray-400 uppercase tracking-wide items-center">
              <span>Nombre</span>
              <span>Sexo</span>
              <span>Edad</span>
              <span>Diagnóstico preliminar</span>
              <span>Sangre</span>
              <span></span>
            </div>
            {patients.map(p => (
              <div
                key={p._id}
                onClick={() => handleSelect(p)}
                className={`bg-white rounded-xl mx-[0.1rem] px-6 py-4 text-sm grid grid-cols-[3fr_2fr_2fr_3fr_2fr_1fr] gap-4 items-center cursor-pointer transition-colors
                  ${selected === p._id ? 'ring-2 ring-primario' : 'hover:bg-primario/5'}`}
              >
                <span className="flex items-center gap-2 font-medium text-gray-800">
                  <span className={`hidden w-8 h-8 shrink-0 rounded-full md:flex items-center justify-center text-xs font-bold
                    ${p.sexo === 'M' ? 'bg-blue-100 text-blue-600' : p.sexo === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                    {getInitials(p.nombre)}
                  </span>
                  <span>{p.nombre}</span>
                </span>
                <span className="text-gray-500">{p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : 'Otro'}</span>
                <span className="text-gray-500">{p.edad} {p.edad === 1 ? 'año' : 'años'}</span>
                <span className="text-gray-700 truncate">{p.ingreso?.diagnosticoMedico || '—'}</span>
                <span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${bloodColors[p.sangre] || 'bg-gray-100 text-gray-500'}`}>
                    {p.sangre || '?'}
                  </span>
                </span>
                <div className="flex justify-center">
                  <button className="p-2 rounded-lg bg-primario/10 text-primario hover:bg-primario/20 transition-colors">
                    <FontAwesomeIcon icon={faUserCircle} size="lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      
    </div>
  );
}