// PatientList.jsx — solo cambiar la URL
import { useEffect, useState } from "react";
import axios from "axios";
import PatientCards from "./PatientCards";

export default function PatientList({ onAddPatient }) {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/patients/patients-with-admission")
            .then(res => setPatients(res.data))
            .catch(err => console.error("Error al cargar pacientes:", err));
    }, []);

    return (
        <PatientCards
            patients={patients}
            onSelectPatient={(p) => console.log('Seleccionado:', p)}
        />
    );
}