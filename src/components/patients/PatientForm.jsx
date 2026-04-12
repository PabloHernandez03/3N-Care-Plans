import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faHeartPulse } from '@fortawesome/free-solid-svg-icons';
import api from '@/utils/api';

const calcularEdad = (fechaStr) => {
    if (!fechaStr || fechaStr.length < 10) return null;
    const [d, m, y] = fechaStr.split('/');
    const nacimiento = new Date(`${y}-${m}-${d}T00:00:00`);
    if (isNaN(nacimiento)) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diff = hoy.getMonth() - nacimiento.getMonth();
    if (diff < 0 || (diff === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
};

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition focus:outline-none focus:border-[#16a09e] focus:bg-white focus:ring-2 focus:ring-[#16a09e]/20";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

const FieldLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-[#0f3460]/70 uppercase tracking-wider mb-1.5">
        {children}
    </label>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
        {children}
    </div>
);

// 🟢 Añadimos SectionTitle para mantener el diseño
const SectionTitle = ({ icon, children }) => (
    <div className="col-span-full flex items-center gap-3 mt-4 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#16a09e] flex items-center justify-center text-white text-base shrink-0">
            <FontAwesomeIcon icon={icon} />
        </div>
        <h2 className="text-base font-semibold tracking-wide text-[#0f3460] uppercase">
            {children}
        </h2>
        <div className="flex-1 h-px bg-[#16a09e]/20" />
    </div>
);

export default function PatientForm({ onCancel, onPatientSaved, showToast }) {
    const [edad, setEdad] = useState(null);
    const [sexo, setSexo] = useState('');
    const [tipoSangre, setTipoSangre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🟢 ESTADOS PARA SIGNOS VITALES
    const [signos, setSignos] = useState({
        frecuenciaCardiaca: '', sistolica: '', diastolica: '',
        frecuenciaRespiratoria: '', temperatura: '', saturacionOxigeno: '',
        glucosa: '', peso: '', talla: '', dolor: '', observaciones: ''
    });
    
    const handleSigno = (e) => setSignos(p => ({ ...p, [e.target.name]: e.target.value }));
    const haySignos = Object.values(signos).some(v => v !== '');

    const handleDate = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
        if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5, 10);
        e.target.value = val.slice(0, 10);
        setEdad(calcularEdad(e.target.value));
    };

    const parseFecha = (str) => {
        const [d, m, y] = str.split('/');
        return new Date(`${y}-${m}-${d}T00:00:00`).toISOString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const fd = new FormData(e.target);
        const payload = {
            nombre: {
                nombre:          fd.get('firstName').trim(),
                apellidoPaterno: fd.get('lastNameP').trim(),
                apellidoMaterno: fd.get('lastNameM').trim(),
            },
            curp: fd.get('curp').toUpperCase().trim(),
            demograficos: {
                fechaNacimiento: parseFecha(fd.get('birthdate')),
                sexo,
                tipoSangre,
            },
        };

        try {
            // 1. Crear al paciente
            const res = await api.post('/api/patients', payload);
            
            // Extraer el ID seguro (dependiendo de cómo responda tu backend)
            const nuevoPacienteId = res.data.patient?._id || res.data._id;

            // 2. 🟢 GUARDAR SIGNOS VITALES SI EL USUARIO LLENÓ ALGO
            if (haySignos && nuevoPacienteId) {
                const vitalsPayload = {
                    pacienteId: nuevoPacienteId,
                    signos: {
                        frecuenciaCardiaca: signos.frecuenciaCardiaca ? Number(signos.frecuenciaCardiaca) : undefined,
                        presionArterial: (signos.sistolica || signos.diastolica) ? {
                            sistolica: signos.sistolica ? Number(signos.sistolica) : undefined,
                            diastolica: signos.diastolica ? Number(signos.diastolica) : undefined,
                        } : undefined,
                        frecuenciaRespiratoria: signos.frecuenciaRespiratoria ? Number(signos.frecuenciaRespiratoria) : undefined,
                        temperatura: signos.temperatura ? Number(signos.temperatura) : undefined,
                        saturacionOxigeno: signos.saturacionOxigeno ? Number(signos.saturacionOxigeno) : undefined,
                        glucosa: signos.glucosa ? Number(signos.glucosa) : undefined,
                        peso: signos.peso ? Number(signos.peso) : undefined,
                        talla: signos.talla ? Number(signos.talla) : undefined,
                        dolor: signos.dolor ? Number(signos.dolor) : undefined,
                    },
                    observaciones: signos.observaciones || ''
                };
                
                await api.post('/api/vitalsigns', vitalsPayload);
            }

            showToast("Paciente registrado exitosamente", "success");
            onPatientSaved(res.data);

        } catch (err) {
            const msg = err.response?.data?.error || 'No se pudo conectar con el servidor.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              className="space-y-6 font-sans">

            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0f3460]/10">
                <div className="w-9 h-9 rounded-lg bg-[#16a09e] flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#0f3460]">Nuevo paciente</h2>
                    <p className="text-xs text-gray-400">Solo se requieren los datos básicos de identificación</p>
                </div>
            </div>

            <Card>
                <FieldLabel>Nombre completo</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Nombre(s) <span className="text-red-400">*</span></p>
                        <input id="firstName" name="firstName" type="text"
                               placeholder="Ej. María Elena" className={inputCls} required />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Apellido paterno <span className="text-red-400">*</span></p>
                        <input id="lastNameP" name="lastNameP" type="text"
                               placeholder="Ej. García" className={inputCls} required />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Apellido materno <span className="text-red-400">*</span></p>
                        <input id="lastNameM" name="lastNameM" type="text"
                               placeholder="Ej. López" className={inputCls} required />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <FieldLabel htmlFor="curp">CURP <span className="text-red-400">*</span></FieldLabel>
                    <input id="curp" name="curp" type="text" placeholder="18 caracteres"
                           maxLength={18} required
                           className={`${inputCls} uppercase tracking-widest`} />
                </Card>

                <Card>
                    <FieldLabel htmlFor="birthdate">Fecha de nacimiento <span className="text-red-400">*</span></FieldLabel>
                    <input id="birthdate" name="birthdate" type="text"
                           placeholder="DD/MM/AAAA" onChange={handleDate}
                           maxLength={10} pattern="\d{2}/\d{2}/\d{4}"
                           className={inputCls} required />
                    {edad !== null && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#16a09e]/10 text-[#16a09e] rounded-full px-3 py-1 text-xs font-semibold">
                            <FontAwesomeIcon icon={faCalendar} /> {edad} años
                        </div>
                    )}
                </Card>

                <Card>
                    <FieldLabel htmlFor="sexo">Sexo biológico <span className="text-red-400">*</span></FieldLabel>
                    <div className="relative">
                        <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}
                                className={selectCls} required>
                            <option value="" disabled>Seleccione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="N">Otro</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
                    </div>
                </Card>

                <Card>
                    <FieldLabel htmlFor="tipoSangre">Tipo de sangre <span className="text-red-400">*</span></FieldLabel>
                    <div className="relative">
                        <select id="tipoSangre" value={tipoSangre} onChange={(e) => setTipoSangre(e.target.value)}
                                className={selectCls} required>
                            <option value="" disabled>Seleccione</option>
                            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
                    </div>
                </Card>
            </div>

            {/* ══ SECCIÓN: SIGNOS VITALES ══ */}
            <div className="grid grid-cols-1 gap-4">
                <SectionTitle icon={faHeartPulse}>
                    Signos vitales
                    <span className="ml-2 text-xs font-normal text-gray-400 normal-case tracking-normal">opcional</span>
                </SectionTitle>

                <Card className="col-span-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* FC */}
                        <div>
                            <FieldLabel>FC <span className="text-gray-300 font-normal">bpm</span></FieldLabel>
                            <input name="frecuenciaCardiaca" type="number" min="0" max="300"
                                value={signos.frecuenciaCardiaca} onChange={handleSigno}
                                placeholder="72" className={inputCls} />
                        </div>

                        {/* PA */}
                        <div>
                            <FieldLabel>PA <span className="text-gray-300 font-normal">mmHg</span></FieldLabel>
                            <div className="flex items-center gap-1">
                                <input name="sistolica" type="number" min="0" max="300"
                                    value={signos.sistolica} onChange={handleSigno}
                                    placeholder="120" className={inputCls} />
                                <span className="text-gray-400 text-sm font-bold">/</span>
                                <input name="diastolica" type="number" min="0" max="200"
                                    value={signos.diastolica} onChange={handleSigno}
                                    placeholder="80" className={inputCls} />
                            </div>
                        </div>

                        {/* FR */}
                        <div>
                            <FieldLabel>FR <span className="text-gray-300 font-normal">rpm</span></FieldLabel>
                            <input name="frecuenciaRespiratoria" type="number" min="0" max="60"
                                value={signos.frecuenciaRespiratoria} onChange={handleSigno}
                                placeholder="16" className={inputCls} />
                        </div>

                        {/* Temperatura */}
                        <div>
                            <FieldLabel>Temp <span className="text-gray-300 font-normal">°C</span></FieldLabel>
                            <input name="temperatura" type="number" step="0.1" min="30" max="45"
                                value={signos.temperatura} onChange={handleSigno}
                                placeholder="36.5" className={inputCls} />
                        </div>

                        {/* SpO2 */}
                        <div>
                            <FieldLabel>SpO₂ <span className="text-gray-300 font-normal">%</span></FieldLabel>
                            <input name="saturacionOxigeno" type="number" min="0" max="100"
                                value={signos.saturacionOxigeno} onChange={handleSigno}
                                placeholder="98" className={inputCls} />
                        </div>

                        {/* Glucosa */}
                        <div>
                            <FieldLabel>Glucosa <span className="text-gray-300 font-normal">mg/dL</span></FieldLabel>
                            <input name="glucosa" type="number" min="0"
                                value={signos.glucosa} onChange={handleSigno}
                                placeholder="90" className={inputCls} />
                        </div>

                        {/* Peso */}
                        <div>
                            <FieldLabel>Peso <span className="text-gray-300 font-normal">kg</span></FieldLabel>
                            <input name="peso" type="number" step="0.1" min="0"
                                value={signos.peso} onChange={handleSigno}
                                placeholder="70" className={inputCls} />
                        </div>

                        {/* Talla */}
                        <div>
                            <FieldLabel>Talla <span className="text-gray-300 font-normal">cm</span></FieldLabel>
                            <input name="talla" type="number" min="0"
                                value={signos.talla} onChange={handleSigno}
                                placeholder="170" className={inputCls} />
                        </div>

                        {/* Dolor */}
                        <div>
                            <FieldLabel>Dolor <span className="text-gray-300 font-normal">0–10</span></FieldLabel>
                            <input name="dolor" type="number" min="0" max="10"
                                value={signos.dolor} onChange={handleSigno}
                                placeholder="0" className={inputCls} />
                            {signos.dolor !== '' && (
                                <div className="mt-1.5 flex items-center gap-1">
                                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${(signos.dolor / 10) * 100}%`,
                                                background: signos.dolor <= 3 ? '#22c55e'
                                                    : signos.dolor <= 6 ? '#f59e0b' : '#ef4444'
                                            }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{signos.dolor}/10</span>
                                </div>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                            <FieldLabel>Observaciones</FieldLabel>
                            <textarea name="observaciones" rows={2}
                                    value={signos.observaciones || ''}
                                    onChange={handleSigno}
                                    placeholder="Notas adicionales sobre los signos vitales..."
                                    className={`${inputCls} resize-none`} />
                        </div>
                    </div>
                </Card>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                    ⚠ {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t-2 border-[#0f3460]/10">
                <button type="button" onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                    Cancelar
                </button>
                <button type="submit" disabled={loading}
                        className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-[#16a09e] text-white text-sm font-semibold hover:bg-[#128a88] active:scale-95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Guardando…' : 'Registrar paciente'}
                </button>
            </div>
        </form>
    );
}