import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientList() {

    const [patients, setPatients] = useState([]);

    useEffect(() => {

        const fetchPatients = async () => {

            try {

                const res = await axios.get("http://localhost:5000/api/patients");

                console.log(res.data); // 👈 revisar esto

                setPatients(res.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchPatients();

    }, []);

    return (
        <div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="grid grid-cols-6 font-semibold border-b pb-2 mb-2">
                    <span>Nombre</span>
                    <span>Sexo</span>
                    <span>Edad</span>
                    <span>Diagnóstico preliminar</span>
                    <span>Tipo de sangre</span>
                    <span>Fecha de registro</span>
                </div>

                {/* Rows */}
                {patients.map(p => (
                    <div key={p._id} className="grid grid-cols-6 py-2 border-b last:border-none">
                        <span>{p.nombre}</span>
                        <span
                            title={
                                p.sexo === 'M' ? 'Masculino' :
                                p.sexo === 'F' ? 'Femenino' :
                                p.sexo === 'N' ? 'Otro' :
                                'Desconocido'
                            }
                        >{p.sexo}</span>
                        <span>{p.edad}</span>
                        <span>{p.ingreso.diagnosticoMedico}</span>
                        <span>{p.sangre}</span>
                        <span>
                            {new Date(p.fechaRegistro).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                            }).replaceAll('/', '-')}
                        </span>
                    </div>
                ))}

            </div>
        </div>
    );
}