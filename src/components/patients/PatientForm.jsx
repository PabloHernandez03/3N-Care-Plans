import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
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

export default function PatientForm({ onCancel, onPatientSaved, showToast }) {
    const [edad, setEdad] = useState(null);
    const [sexo, setSexo] = useState('');
    const [tipoSangre, setTipoSangre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const res = await api.post('/api/patients', payload);

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
                <div className="w-9 h-9 rounded-lg bg-primario flex items-center justify-center text-white">
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
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-primario/10 text-[#0f3460] rounded-full px-3 py-1 text-xs font-semibold">
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
                        className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primario text-white text-sm font-semibold hover:bg-[#0a2547] active:scale-95 transition-all shadow-md shadow-[#0f3460]/20 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? 'Guardando…' : 'Registrar paciente'}
                </button>
            </div>
        </form>
    );
}